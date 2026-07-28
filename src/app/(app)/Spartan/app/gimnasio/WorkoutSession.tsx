"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Check,
  Circle,
  ChevronRight,
  Dumbbell,
  Trophy,
} from "lucide-react";

interface WorkoutExercise {
  id: string;
  name: string;
  gif_url: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
  rest_seconds: number;
}

interface WorkoutSessionProps {
  userId: string;
  routineId: string;
  routineName: string;
  exercises: WorkoutExercise[];
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function TimerRing({ total, remaining }: { total: number; remaining: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#be0b3c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center">
        <Clock className="w-5 h-5 text-zinc-400 mb-1" />
        <span className="text-2xl font-extrabold text-white tabular-nums">
          {formatTime(remaining)}
        </span>
      </div>
    </div>
  );
}

function Confetti() {
  const colors = ["#be0b3c", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300 - 100,
            opacity: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.5 + Math.random() * 1.5,
            ease: "easeOut",
            delay: Math.random() * 0.2,
          }}
          className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}

export default function WorkoutSession({
  userId,
  routineId,
  routineName,
  exercises,
  onClose,
}: WorkoutSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [seriesData, setSeriesData] = useState<Record<number, (number | null)[]>>(() => {
    const init: Record<number, (number | null)[]> = {};
    exercises.forEach((ex, i) => {
      init[i] = new Array(ex.sets).fill(null);
    });
    return init;
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [workoutStarted] = useState(() => new Date());
  const [workoutEnded, setWorkoutEnded] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (restTimer === null) {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      return;
    }
    if (restTimer <= 0) {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      setRestTimer(null);
      advanceToNext();
      return;
    }
    restTimerRef.current = setInterval(() => {
      setRestTimer((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restTimer]);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  const allCompleted = currentExerciseIndex >= exercises.length - 1 && completedExercises.has(currentExerciseIndex);

  const markSeriesComplete = (seriesIndex: number, weight: number | null) => {
    setSeriesData((prev) => {
      const next = { ...prev };
      next[currentExerciseIndex] = [...(prev[currentExerciseIndex] ?? [])];
      next[currentExerciseIndex][seriesIndex] = weight;
      return next;
    });
  };

  const allSeriesCompleted = (seriesData[currentExerciseIndex] ?? []).every(
    (w) => w !== null
  );

  const completeCurrentExercise = () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex);
    setCompletedExercises(newCompleted);

    const currentEx = exercises[currentExerciseIndex];
    if (currentEx.rest_seconds > 0) {
      setRestTimer(currentEx.rest_seconds);
    } else {
      advanceToNext();
    }
  };

  const advanceToNext = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setRestTimer(null);
    } else {
      finishWorkout();
    }
  }, [currentExerciseIndex, exercises.length]);

  const skipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setRestTimer(null);
    }
  };

  const finishWorkout = async () => {
    setWorkoutEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);

    setSaving(true);
    const supabase = createClient();
    const endedAt = new Date();
    const durationMinutes = Math.round(
      (endedAt.getTime() - workoutStarted.getTime()) / 60000
    );

    await supabase.from("spartan_workout_sessions").insert({
      user_id: userId,
      routine_id: routineId,
      started_at: workoutStarted.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_minutes: durationMinutes,
      series_data: seriesData,
      completed: true,
    });

    setSaving(false);
  };

  const goToExercise = (idx: number) => {
    setCurrentExerciseIndex(idx);
    setRestTimer(null);
  };

  if (workoutEnded) {
    const totalCompleted = completedExercises.size;
    const totalMinutes = Math.round(elapsedTime / 60);
    let totalVolume = 0;
    exercises.forEach((ex, i) => {
      const weights = seriesData[i] ?? [];
      for (const w of weights) {
        if (w) totalVolume += w * ex.reps;
      }
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6"
      >
        <Confetti />

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-spartan-600 to-spartan-700 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(190,11,60,0.4)]"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-extrabold text-white text-center mb-2"
        >
          Entrenamiento completado
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 w-full max-w-xs my-6"
        >
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-white">{totalMinutes}</p>
            <p className="text-[10px] text-zinc-500">minutos</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-white">{totalCompleted}</p>
            <p className="text-[10px] text-zinc-500">ejercicios</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold text-white">
              {(totalVolume / 1000).toFixed(1)}
            </p>
            <p className="text-[10px] text-zinc-500">toneladas</p>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onClose}
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(190,11,60,0.3)] disabled:opacity-50"
        >
          Volver al inicio
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{routineName}</p>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-sm font-mono tabular-nums">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Exercise pills */}
      <div className="px-4 py-3 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max">
          {exercises.map((ex, i) => {
            const isCompleted = completedExercises.has(i);
            const isCurrent = i === currentExerciseIndex;
            let bg = "bg-white/[0.03] border-white/[0.06]";
            let text = "text-zinc-500";
            let icon = <Circle className="w-3 h-3" />;

            if (isCompleted) {
              bg = "bg-emerald-500/10 border-emerald-500/20";
              text = "text-emerald-400";
              icon = <Check className="w-3 h-3" />;
            } else if (isCurrent) {
              bg = "bg-blue-500/10 border-blue-500/20";
              text = "text-blue-400";
              icon = <ChevronRight className="w-3 h-3" />;
            }

            return (
              <button
                key={i}
                onClick={() => goToExercise(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all active:scale-[0.97] shrink-0 ${bg} ${text}`}
              >
                {icon}
                <span className="truncate max-w-[100px]">{ex.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
        {/* Current exercise GIF */}
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="aspect-square bg-black rounded-3xl overflow-hidden border-2 border-spartan-500/20 shadow-[0_0_30px_rgba(190,11,60,0.3)]"
        >
          <img
            src={currentExercise.gif_url}
            alt={currentExercise.name}
            className="w-full h-full object-contain p-4"
          />
        </motion.div>

        {/* Exercise info */}
        <div>
          <h2 className="text-lg font-extrabold text-white">
            {currentExercise.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-spartan-500/10 text-spartan-400 border border-spartan-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">
              {currentExercise.muscle_group}
            </span>
            <span className="text-[10px] font-medium text-zinc-500">
              {currentExercise.sets} Series x {currentExercise.reps} Reps
            </span>
          </div>
        </div>

        {/* Series inputs */}
        {!restTimer && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Series
            </p>
            {Array.from({ length: currentExercise.sets }).map((_, seriesIdx) => {
              const weight = seriesData[currentExerciseIndex]?.[seriesIdx];
              const isDone = weight !== null;

              return (
                <div
                  key={seriesIdx}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-white/[0.03] border-white/[0.06]"
                  }`}
                >
                  <span
                    className={`text-xs font-bold w-16 shrink-0 ${
                      isDone ? "text-emerald-400 line-through" : "text-zinc-300"
                    }`}
                  >
                    Serie {seriesIdx + 1}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={weight ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? parseFloat(e.target.value) : null;
                      markSeriesComplete(seriesIdx, val);
                    }}
                    placeholder="kg"
                    disabled={isDone}
                    className="flex-1 bg-white/5 border border-white/10 text-white text-sm font-bold text-center py-2 rounded-lg focus:outline-none focus:border-spartan-500/50 disabled:opacity-30 placeholder:text-zinc-600"
                  />
                  <button
                    onClick={() => {
                      const currentWeight =
                        seriesData[currentExerciseIndex]?.[seriesIdx];
                      markSeriesComplete(seriesIdx, currentWeight ?? null);
                    }}
                    disabled={isDone}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-[0.97] ${
                      isDone
                        ? "bg-emerald-500/20"
                        : "bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 ${
                        isDone ? "text-emerald-400" : "text-zinc-600"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest timer */}
        {restTimer && restTimer > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6"
          >
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
              Descanso
            </p>
            <TimerRing
              total={currentExercise.rest_seconds}
              remaining={restTimer}
            />
            <p className="text-xs text-zinc-600 mt-4">
              Siguiente:{" "}
              {isLastExercise
                ? "Finalizar"
                : exercises[currentExerciseIndex + 1]?.name ?? "--"}
            </p>
            <button
              onClick={() => {
                setRestTimer(null);
                advanceToNext();
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors active:scale-[0.97]"
            >
              Saltar descanso
            </button>
          </motion.div>
        )}

        {/* Action buttons */}
        {!restTimer && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={skipExercise}
              disabled={isLastExercise}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 text-sm font-bold hover:bg-white/10 transition-colors active:scale-[0.97] disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
              Saltar
            </button>
            <button
              onClick={completeCurrentExercise}
              disabled={
                currentExercise.sets > 0 && !allSeriesCompleted
              }
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 shadow-[0_0_20px_rgba(190,11,60,0.3)]"
            >
              <Check className="w-4 h-4" />
              Terminar ejercicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
