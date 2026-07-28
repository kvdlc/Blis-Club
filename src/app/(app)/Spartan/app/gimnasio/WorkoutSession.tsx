"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Check, Circle, ChevronRight, Plus, Trophy, X, Play, Flag, Timer, Volume2 } from "lucide-react";

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

interface SeriesEntry {
  weight: number | null;
  reps: number;
  completed: boolean;
}

interface ExerciseSessionData {
  series: SeriesEntry[];
  actualRestSeconds: number | null;
  actualBetweenSeriesRest: number | null;
  actualTransitionTime: number | null;
}

interface WorkoutSessionProps {
  userId: string;
  routineId: string;
  routineName: string;
  exercises: WorkoutExercise[];
  onClose: () => void;
}

const STORAGE_KEY = "spartan_workout_session";
const BETWEEN_SERIES_REST = 60;

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function TimerRing({ total, remaining }: { total: number; remaining: number }) {
  const radius = 52; const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.max(0, remaining / total));
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#timerGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-1000 ease-linear" />
        <defs><linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#be0b3c" /><stop offset="100%" stopColor="#f97316" /></linearGradient></defs>
      </svg>
      <div className="flex flex-col items-center"><Clock className="w-5 h-5 text-zinc-400 mb-1" /><span className="text-2xl font-extrabold text-white tabular-nums">{formatTime(remaining)}</span></div>
    </div>
  );
}

function Confetti() {
  const colors = ["#be0b3c", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div key={i} initial={{ x: 0, y: 0, opacity: 1, scale: 0 }} animate={{ x: (Math.random()-0.5)*300, y: (Math.random()-0.5)*300-100, opacity: 0, scale: 1 }} transition={{ duration: 1.5+Math.random()*1.5, ease: "easeOut", delay: Math.random()*0.2 }} className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i%colors.length] }} />
      ))}
    </div>
  );
}

export default function WorkoutSession({ userId, routineId, routineName, exercises, onClose }: WorkoutSessionProps) {
  const [started, setStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [allSeriesData, setAllSeriesData] = useState<Record<number, ExerciseSessionData>>(() => {
    const init: Record<number, ExerciseSessionData> = {};
    exercises.forEach((ex, i) => init[i] = { series: new Array(ex.sets).fill(null).map(() => ({ weight: null, reps: ex.reps, completed: false })), actualRestSeconds: null, actualBetweenSeriesRest: null, actualTransitionTime: null });
    return init;
  });
  const [lastWeights, setLastWeights] = useState<Record<number, (number | null)[]>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [seriesRestTimer, setSeriesRestTimer] = useState<number | null>(null);
  const [restTarget, setRestTarget] = useState(60);
  const [restStartTime, setRestStartTime] = useState<number | null>(null);
  const [seriesRestStart, setSeriesRestStart] = useState<number | null>(null);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [workoutEnded, setWorkoutEnded] = useState(false);
  const [abandoning, setAbandoning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [seriesTimerExpired, setSeriesTimerExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seriesRestRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const beep = () => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; osc.type = "square";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  useEffect(() => { const load = async () => {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const data = JSON.parse(saved); if (data.routineId === routineId && data.started) { setStarted(true); setCurrentExerciseIndex(data.currentExerciseIndex ?? 0); setCompletedExercises(new Set(data.completedExercises ?? [])); setAllSeriesData(data.allSeriesData ?? {}); setElapsedTime(data.elapsedTime ?? 0); if (data.workoutStartTime) setWorkoutStartTime(new Date(data.workoutStartTime)); } } } catch {}
    const supabase = createClient();
    const { data: lastSession } = await supabase.from("spartan_workout_sessions").select("series_data").eq("user_id", userId).eq("routine_id", routineId).eq("completed", true).order("started_at", { ascending: false }).limit(1).maybeSingle();
    if (lastSession?.series_data) { const prev: Record<number, (number|null)[]> = {}; const sd = lastSession.series_data as any; for (const [k, v] of Object.entries(sd)) { const idx = parseInt(k); if ((v as any)?.series) prev[idx] = (v as any).series.map((s: any) => s.weight ?? null); } setLastWeights(prev); }
  }; load(); }, []);

  useEffect(() => { if (!started) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ routineId, started: true, currentExerciseIndex, completedExercises: Array.from(completedExercises), allSeriesData, elapsedTime, workoutStartTime: workoutStartTime?.toISOString() })); } catch {}
  }, [started, routineId, currentExerciseIndex, completedExercises, allSeriesData, elapsedTime]);

  useEffect(() => { if (!started) return;
    timerRef.current = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); if (restTimerRef.current) clearInterval(restTimerRef.current); if (seriesRestRef.current) clearInterval(seriesRestRef.current); };
  }, [started]);

  // Rest timer (between exercises) — alerts when done, keeps counting past 0
  useEffect(() => {
    if (restTimer === null) { if (restTimerRef.current) clearInterval(restTimerRef.current); return; }
    if (restTimer <= 0) {
      if (!timerExpired) { setTimerExpired(true); beep(); }
      if (restTimerRef.current) clearInterval(restTimerRef.current);
      return;
    }
    restTimerRef.current = setInterval(() => setRestTimer((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [restTimer, timerExpired]);

  // Series rest timer (between series repetitions)
  useEffect(() => {
    if (seriesRestTimer === null) { if (seriesRestRef.current) clearInterval(seriesRestRef.current); return; }
    if (seriesRestTimer <= 0) {
      if (!seriesTimerExpired) { setSeriesTimerExpired(true); beep(); }
      if (seriesRestRef.current) clearInterval(seriesRestRef.current);
      return;
    }
    seriesRestRef.current = setInterval(() => setSeriesRestTimer((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => { if (seriesRestRef.current) clearInterval(seriesRestRef.current); };
  }, [seriesRestTimer, seriesTimerExpired]);

  const handleStartWorkout = () => {
    setStarted(true);
    setWorkoutStartTime(new Date());
    setRestTimer(0);
    setTimerExpired(true);
  };

  const currentExercise = exercises[currentExerciseIndex];
  const currentData = allSeriesData[currentExerciseIndex] ?? { series: [], actualRestSeconds: null, actualBetweenSeriesRest: null, actualTransitionTime: null };
  const prevWeights = lastWeights[currentExerciseIndex] ?? [];

  const updateSeriesField = (seriesIndex: number, field: "weight" | "reps", value: number | null) => {
    setAllSeriesData((prev) => {
      const next = { ...prev }; const cur = next[currentExerciseIndex]; if (!cur) return next;
      const s = [...cur.series]; if (!s[seriesIndex]) s[seriesIndex] = { weight: null, reps: currentExercise.reps, completed: false };
      s[seriesIndex] = { ...s[seriesIndex], [field]: value };
      next[currentExerciseIndex] = { ...cur, series: s }; return next;
    });
  };

  const toggleSeriesComplete = (seriesIndex: number) => {
    setAllSeriesData((prev) => {
      const next = { ...prev }; const cur = next[currentExerciseIndex]; if (!cur) return next;
      const s = [...cur.series]; if (!s[seriesIndex]) s[seriesIndex] = { weight: null, reps: currentExercise.reps, completed: false };
      const wasCompleted = s[seriesIndex].completed;
      s[seriesIndex] = { ...s[seriesIndex], completed: !wasCompleted };
      if (!wasCompleted) {
        // Just completed a series — save between-series rest time
        if (seriesRestStart) {
          const actualRest = Math.round((Date.now() - seriesRestStart) / 1000);
          next[currentExerciseIndex] = { ...cur, series: s, actualBetweenSeriesRest: actualRest };
          setSeriesRestStart(null);
        }
        setSeriesRestTimer(null); setSeriesTimerExpired(false);
      } else {
        // Un-completing — restart the between-series timer
        setSeriesRestTimer(BETWEEN_SERIES_REST);
        setSeriesRestStart(Date.now());
        setSeriesTimerExpired(false);
        next[currentExerciseIndex] = { ...cur, series: s };
        return next;
      }
      next[currentExerciseIndex] = { ...cur, series: s };
      return next;
    });

    // Check if all series are complete to trigger transition to next exercise
    // We'll handle this via the allSeriesCompleted check
  };

  const addSeries = () => {
    setAllSeriesData((prev) => {
      const next = { ...prev }; const cur = next[currentExerciseIndex]; if (!cur) return next;
      next[currentExerciseIndex] = { ...cur, series: [...cur.series, { weight: null, reps: currentExercise.reps, completed: false }] };
      return next;
    });
  };

  const removeSeries = (seriesIndex: number) => {
    setAllSeriesData((prev) => {
      const next = { ...prev }; const cur = next[currentExerciseIndex]; if (!cur || cur.series.length <= 1) return next;
      next[currentExerciseIndex] = { ...cur, series: cur.series.filter((_, i) => i !== seriesIndex) };
      return next;
    });
  };

  // Start series rest when completing a series
  useEffect(() => {
    if (!started || restTimer !== null) return;
    const anyJustCompleted = currentData.series.some((s) => s.completed && seriesRestStart === null && seriesRestTimer === null);
    // We handle this in toggleSeriesComplete
  }, []);

  const allSeriesCompleted = currentData.series.length > 0 && currentData.series.every((s) => s.completed);

  // Called when user clicks "Terminar ejercicio" (all series done)
  const completeCurrentExercise = () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex);
    setCompletedExercises(newCompleted);

    if (restStartTime) {
      const actualRest = Math.round((Date.now() - restStartTime) / 1000);
      setAllSeriesData((prev) => { const next = { ...prev }; const c = next[currentExerciseIndex]; if (c) next[currentExerciseIndex] = { ...c, actualRestSeconds: actualRest }; return next; });
      setRestStartTime(null);
    }
    if (seriesRestStart) {
      const actualSR = Math.round((Date.now() - seriesRestStart) / 1000);
      setAllSeriesData((prev) => { const next = { ...prev }; const c = next[currentExerciseIndex]; if (c) next[currentExerciseIndex] = { ...c, actualBetweenSeriesRest: actualSR }; return next; });
      setSeriesRestStart(null);
    }

    setSeriesRestTimer(null); setSeriesTimerExpired(false);
    setRestTimer(null); setTimerExpired(false);

    if (currentExerciseIndex < exercises.length - 1) {
      const nextEx = exercises[currentExerciseIndex + 1];
      // Record transition time start
      const transStart = Date.now();
      setRestTarget(nextEx.rest_seconds);
      setRestStartTime(Date.now());
      setRestTimer(nextEx.rest_seconds);
      setTimerExpired(false);
      // Advance the index (only once!)
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      finishWorkout();
    }
  };

  // Called when user clicks "Comenzar" after rest timer expired
  const startNextExercise = () => {
    if (restStartTime) {
      const actual = Math.round((Date.now() - restStartTime) / 1000);
      const prevIdx = currentExerciseIndex - 1;
      if (prevIdx >= 0) {
        setAllSeriesData((prev) => { const next = { ...prev }; if (next[prevIdx]) next[prevIdx] = { ...next[prevIdx], actualRestSeconds: actual }; return next; });
      }
      setRestStartTime(null);
    }
    setRestTimer(null);
    setTimerExpired(false);
  };

  const skipExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      if (restStartTime) {
        const actual = Math.round((Date.now() - restStartTime) / 1000);
        const prevIdx = currentExerciseIndex - 1;
        if (prevIdx >= 0) {
          setAllSeriesData((prev) => { const next = { ...prev }; if (next[prevIdx]) next[prevIdx] = { ...next[prevIdx], actualRestSeconds: actual }; return next; });
        }
      }
      setCurrentExerciseIndex((prev) => prev + 1);
      setRestTimer(null); setTimerExpired(false);
      setRestStartTime(null);
      setSeriesRestTimer(null); setSeriesTimerExpired(false);
    }
  };

  const abandonWorkout = () => { localStorage.removeItem(STORAGE_KEY); onClose(); };

  const finishWorkout = async () => {
    setWorkoutEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (seriesRestRef.current) clearInterval(seriesRestRef.current);
    setSaving(true);
    const supabase = createClient();
    const endedAt = new Date();
    const start = workoutStartTime || new Date();
    await supabase.from("spartan_workout_sessions").insert({
      user_id: userId, routine_id: routineId,
      started_at: start.toISOString(), ended_at: endedAt.toISOString(),
      duration_minutes: Math.round((endedAt.getTime() - start.getTime()) / 60000),
      series_data: allSeriesData, completed: true,
    });
    localStorage.removeItem(STORAGE_KEY); setSaving(false);
  };

  const goToExercise = (idx: number) => { setCurrentExerciseIndex(idx); setRestTimer(null); setTimerExpired(false); setRestStartTime(null); setSeriesRestTimer(null); setSeriesTimerExpired(false); };

  // ── PRE-START SCREEN ──
  if (!started) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><ArrowLeft className="w-4 h-4 text-zinc-400" /></button>
          <div className="flex-1"><p className="text-sm font-bold text-white truncate">{routineName}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-spartan-600/20 border border-spartan-500/20 flex items-center justify-center mb-4"><Play className="w-9 h-9 text-spartan-400 ml-1" /></div>
            <h2 className="text-xl font-extrabold text-white">Listo para entrenar</h2>
            <p className="text-sm text-zinc-500 mt-1">{exercises.length} ejercicios</p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Ejercicios</p>
            {exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-zinc-500">{i + 1}</span></div>
                <img src={ex.gif_url} alt={ex.name} className="w-9 h-9 rounded-lg object-cover bg-zinc-800 shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-xs font-bold text-zinc-200 truncate">{ex.name}</p><p className="text-[10px] text-zinc-600">{ex.sets}x{ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ""} · {ex.rest_seconds}s desc</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 p-4 border-t border-white/[0.06]">
          <button onClick={handleStartWorkout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-base font-extrabold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_40px_rgba(190,11,60,0.4)]"><Play className="w-5 h-5" /> Iniciar entrenamiento</button>
        </div>
      </div>
    );
  }

  // ── FINISHED ──
  if (workoutEnded) {
    const totalCompleted = completedExercises.size;
    const totalMinutes = Math.round(elapsedTime / 60);
    let totalVolume = 0;
    exercises.forEach((ex, i) => { const data = allSeriesData[i]; if (!data) return; for (const s of data.series) { if (s.completed && s.weight) totalVolume += s.weight * s.reps; } });
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6">
        <Confetti />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-full bg-gradient-to-r from-spartan-600 to-spartan-700 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(190,11,60,0.4)]"><Trophy className="w-10 h-10 text-white" /></motion.div>
        <h1 className="text-2xl font-extrabold text-white text-center mb-2">Entrenamiento completado</h1>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs my-6">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center"><p className="text-2xl font-extrabold text-white">{totalMinutes}</p><p className="text-[10px] text-zinc-500">minutos</p></div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center"><p className="text-2xl font-extrabold text-white">{totalCompleted}</p><p className="text-[10px] text-zinc-500">ejercicios</p></div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 text-center"><p className="text-2xl font-extrabold text-white">{(totalVolume / 1000).toFixed(1)}</p><p className="text-[10px] text-zinc-500">toneladas</p></div>
        </div>
        <button onClick={onClose} disabled={saving} className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(190,11,60,0.3)] disabled:opacity-50">Volver al inicio</button>
      </motion.div>
    );
  }

  const isExerciseRest = restTimer !== null && restTimer <= 0 && timerExpired;
  const isSeriesRest = seriesRestTimer !== null && seriesRestTimer <= 0 && seriesTimerExpired;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
        <button onClick={() => setAbandoning(true)} className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20" title="Abandonar"><Flag className="w-4 h-4 text-red-400" /></button>
        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{routineName}</p></div>
        <div className="flex items-center gap-2 text-zinc-400"><Clock className="w-3.5 h-3.5" /><span className="text-sm font-mono tabular-nums">{formatTime(elapsedTime)}</span></div>
      </div>

      {/* Exercise pills */}
      <div className="px-4 py-3 overflow-x-auto shrink-0">
        <div className="flex gap-2 min-w-max">
          {exercises.map((ex, i) => {
            const isCompl = completedExercises.has(i); const isCurr = i === currentExerciseIndex;
            let bg = "bg-white/[0.03] border-white/[0.06]", text = "text-zinc-500", icon: any = <Circle className="w-3 h-3" />;
            if (isCompl) { bg = "bg-emerald-500/10 border-emerald-500/20"; text = "text-emerald-400"; icon = <Check className="w-3 h-3" />; }
            else if (isCurr) { bg = "bg-blue-500/10 border-blue-500/20"; text = "text-blue-400"; icon = <ChevronRight className="w-3 h-3" />; }
            return <button key={i} onClick={() => goToExercise(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold active:scale-[0.97] shrink-0 ${bg} ${text}`}>{icon}<span className="truncate max-w-[100px]">{ex.name}</span></button>;
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-8">
        {/* GIF */}
        <motion.div key={currentExerciseIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="aspect-square bg-black rounded-3xl overflow-hidden border-2 border-spartan-500/20 shadow-[0_0_30px_rgba(190,11,60,0.3)]">
          <img src={currentExercise.gif_url} alt={currentExercise.name} className="w-full h-full object-contain p-4" />
        </motion.div>

        <div>
          <h2 className="text-lg font-extrabold text-white">{currentExercise.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-spartan-500/10 text-spartan-400 border border-spartan-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">{currentExercise.muscle_group}</span>
            <span className="text-[10px] font-medium text-zinc-500">{currentExercise.sets} Series x {currentExercise.reps} Reps</span>
          </div>
        </div>

        {/* Series rest timer (between series) */}
        {seriesRestTimer !== null && seriesRestTimer > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <Timer className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400">Descanso entre series</p>
              <p className="text-lg font-extrabold text-amber-300 monospace">{formatTime(seriesRestTimer)}</p>
            </div>
          </div>
        )}

        {isSeriesRest && (
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <Volume2 className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-sm font-extrabold text-amber-400">¡Descanso completado!</p>
            <p className="text-[10px] text-amber-500/70 mt-1">Continúa cuando estés listo</p>
            <button onClick={() => { setSeriesRestTimer(null); setSeriesTimerExpired(false); }} className="mt-3 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors active:scale-[0.97]">
              Entendido
            </button>
          </motion.div>
        )}

        {/* Series inputs — full width, spaced buttons */}
        {restTimer === null && !isExerciseRest && seriesRestTimer === null && !isSeriesRest && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Series</p>
              <button onClick={addSeries} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-bold hover:bg-white/10 transition-colors active:scale-[0.97]"><Plus className="w-3 h-3" /> Añadir</button>
            </div>

            {currentData.series.map((entry, seriesIdx) => {
              const isDone = entry.completed;
              const ghostWeight = prevWeights[seriesIdx];

              return (
                <div key={seriesIdx} className={`w-full flex items-center gap-2 p-3 rounded-2xl border transition-colors ${isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                  <span className={`text-xs font-bold w-14 shrink-0 ${isDone ? "text-emerald-400 line-through" : "text-zinc-300"}`}>Serie {seriesIdx + 1}</span>

                  <div className="relative flex-1 min-w-0">
                    <input type="number" min={0} step={0.5} value={entry.weight ?? ""} onChange={(e) => updateSeriesField(seriesIdx, "weight", e.target.value ? parseFloat(e.target.value) : null)} placeholder="kg" disabled={isDone} className="w-full bg-white/5 border border-white/10 text-white text-sm font-bold text-center py-2 rounded-lg focus:outline-none focus:border-spartan-500/50 disabled:opacity-30 placeholder:text-zinc-600" />
                    {!isDone && !entry.weight && ghostWeight && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-600 pointer-events-none">{ghostWeight}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600">×</span>
                  <input type="number" min={1} max={99} value={entry.reps} onChange={(e) => updateSeriesField(seriesIdx, "reps", parseInt(e.target.value) || 1)} disabled={isDone} className="w-16 bg-white/5 border border-white/10 text-white text-sm font-bold text-center py-2 rounded-lg focus:outline-none focus:border-spartan-500/50 disabled:opacity-30" />
                  <span className="text-[10px] text-zinc-600">r</span>

                  {/* Remove button — red circle */}
                  {!isDone && currentData.series.length > 1 && (
                    <button onClick={() => removeSeries(seriesIdx)} className="w-9 h-9 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-colors active:scale-[0.95] shrink-0">
                      <MinusIcon />
                    </button>
                  )}

                  {/* Complete button — green circle */}
                  <button onClick={() => {
                    toggleSeriesComplete(seriesIdx);
                    if (!entry.completed) {
                      // Start series rest timer
                      setSeriesRestTimer(BETWEEN_SERIES_REST);
                      setSeriesRestStart(Date.now());
                      setSeriesTimerExpired(false);
                    }
                  }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-[0.95] shrink-0 ${isDone ? "bg-emerald-500 border-2 border-emerald-400" : "bg-emerald-500/10 border-2 border-emerald-500/30 hover:bg-emerald-500/20"}`}>
                    <Check className={`w-4 h-4 ${isDone ? "text-white" : "text-emerald-500"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rest timer (between exercises) */}
        {restTimer !== null && restTimer > 0 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-6">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Descanso previo</p>
            <div className="flex items-center gap-2 mb-4"><span className="text-[10px] text-zinc-600">Meta:</span><span className="text-xs font-bold text-zinc-300">{restTarget}s</span></div>
            <TimerRing total={restTarget} remaining={restTimer} />
            <p className="text-xs text-zinc-600 mt-4">Siguiente: {exercises[currentExerciseIndex]?.name ?? "Finalizar"}</p>
            <button onClick={startNextExercise} className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium hover:bg-white/10 transition-colors active:scale-[0.97]">Saltar descanso</button>
          </motion.div>
        )}

        {/* Rest timer EXPIRED — alert with explosion effect */}
        {isExerciseRest && (
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="flex flex-col items-center py-6">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mb-3">
              <Volume2 className="w-8 h-8 text-amber-400" />
            </motion.div>
            <h3 className="text-lg font-extrabold text-amber-400">¡Descanso terminado!</h3>
            <p className="text-xs text-zinc-500 mt-1">Siguiente: {exercises[currentExerciseIndex]?.name ?? "Finalizar"}</p>
            <p className="text-[10px] text-amber-500/60 mt-1">El temporizador sigue corriendo hasta que comiences</p>
            <button onClick={startNextExercise} className="mt-5 w-full max-w-xs flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_30px_rgba(190,11,60,0.3)]">
              <Play className="w-4 h-4" /> Comenzar ejercicio
            </button>
          </motion.div>
        )}

        {/* Action buttons — only show when not resting */}
        {restTimer === null && !isExerciseRest && seriesRestTimer === null && !isSeriesRest && (
          <div className="space-y-2 pt-2">
            <button onClick={completeCurrentExercise} disabled={!allSeriesCompleted} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
              <Check className="w-4 h-4" /> Terminar ejercicio
            </button>
            <button onClick={skipExercise} disabled={currentExerciseIndex >= exercises.length - 1 && allSeriesCompleted} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 text-xs font-bold hover:bg-white/10 transition-colors active:scale-[0.97] disabled:opacity-30">
              <ChevronRight className="w-3.5 h-3.5" /> Saltar ejercicio
            </button>
          </div>
        )}
      </div>

      {/* Abandon modal */}
      {abandoning && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-6" onClick={() => setAbandoning(false)}>
          <div className="bg-zinc-900 border border-white/[0.08] rounded-3xl p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4"><Flag className="w-7 h-7 text-red-400" /></div>
            <h3 className="text-lg font-extrabold text-white">¿Abandonar?</h3>
            <p className="text-xs text-zinc-500 mt-1">Se perderá el progreso.</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button onClick={() => setAbandoning(false)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-bold hover:bg-white/10">Cancelar</button>
              <button onClick={abandonWorkout} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 active:scale-[0.97]">Abandonar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="6" width="10" height="2" rx="1" fill="currentColor" className="text-red-400" />
    </svg>
  );
}
