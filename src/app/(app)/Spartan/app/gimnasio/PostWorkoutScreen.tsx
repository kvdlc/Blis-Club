"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Dumbbell,
  Clock,
  Trophy,
  TrendingUp,
  Crown,
  Camera,
  Share2,
  Home,
  ChevronRight,
  Check,
  Circle,
  Star,
  Users,
  BarChart3,
  Calendar,
  Zap,
  ArrowUp,
  X,
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

interface SeriesEntry {
  weight: number | null;
  reps: number;
  completed: boolean;
}

interface ExerciseSessionData {
  series: SeriesEntry[];
  actualRestSeconds: number | null;
  actualBetweenSeriesRest: number | null;
}

interface PostWorkoutScreenProps {
  userId: string;
  routineName: string;
  exercises: WorkoutExercise[];
  allSeriesData: Record<number, ExerciseSessionData>;
  completedExercises: Set<number>;
  elapsedTime: number;
  workoutStartTime: Date | null;
  workoutEnded: true;
  bodyWeight: number | null;
  gymOccupancy: string;
  previousSession: any | null;
  onClose: () => void;
  onSaveWeightAndGym: (weight: number | null, occupancy: string) => Promise<void>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg}kg`;
}

const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const OCCUPANCY_MAP: Record<string, string> = { "vacio": "Vacío", "normal": "Normal", "lleno": "Lleno" };

function ConfettiParticles() {
  const colors = ["#be0b3c", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 600 - 200,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 3 + Math.random() * 3, ease: "easeOut", delay: Math.random() * 0.5 }}
          className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
          style={{ backgroundColor: colors[i % colors.length] }}
        />
      ))}
    </div>
  );
}

function FloatingSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: Math.random() * 100 - 50 + "%", y: "110%", opacity: 0, scale: 0 }}
          animate={{
            y: "-10%",
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
          className="absolute text-amber-400/60 text-xs"
          style={{ left: `${Math.random() * 100}%` }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

function GlowRings() {
  return (
    <>
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.15, 0.25] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#be0b3c]/15 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.12, 0.25, 0.12] }}
        transition={{ repeat: Infinity, duration: 5, delay: 0.8 }}
        className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-amber-500/12 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.08, 0.15] }}
        transition={{ repeat: Infinity, duration: 6, delay: 1.5 }}
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#be0b3c]/10 blur-3xl"
      />
    </>
  );
}

function StatCard({
  icon: Icon,
  value,
  subtitle,
  comparison,
  positive,
  color,
}: {
  icon: React.ComponentType<any>;
  value: string;
  subtitle: string;
  comparison?: string;
  positive?: boolean;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] overflow-hidden flex flex-col items-center"
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: color }}
      />
      <Icon className="w-4 h-4 mb-2" style={{ color }} />
      <p className="text-xl font-extrabold text-white">{value}</p>
      <p className="text-[10px] font-medium text-zinc-500 uppercase">{subtitle}</p>
      {comparison && (
        <span
          className={`text-[10px] font-bold mt-1 flex items-center gap-0.5 ${
            positive ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {positive ? <ArrowUp className="w-2.5 h-2.5" /> : null}
          {comparison}
        </span>
      )}
    </motion.div>
  );
}

function ProgressiveBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export default function PostWorkoutScreen({
  userId,
  routineName,
  exercises,
  allSeriesData,
  completedExercises,
  elapsedTime,
  workoutStartTime,
  workoutEnded,
  bodyWeight: initialWeight,
  gymOccupancy: initialOccupancy,
  previousSession,
  onClose,
  onSaveWeightAndGym,
}: PostWorkoutScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [bodyWeight, setBodyWeight] = useState<number | null>(initialWeight);
  const [gymOccupancy, setGymOccupancy] = useState(initialOccupancy || "normal");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await onSaveWeightAndGym(bodyWeight, gymOccupancy);
    } catch {}
    setSaving(false);
    setStep(2);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("spartan_photos")
        .upload(filePath, file, { upsert: true });
      if (!error) {
        await supabase.from("spartan_progress_photos").insert({
          user_id: userId,
          photo_url: filePath,
          weight_kg: bodyWeight,
        });
      }
    } catch {}
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const prevData = useMemo(() => {
    const sd = previousSession?.series_data;
    if (!sd) return null;
    let totalVol = 0;
    let completedCount = 0;
    const maxWeights: Record<string, number> = {};
    for (const [k, v] of Object.entries(sd)) {
      const idx = parseInt(k);
      const d = v as any;
      if (!d?.series) continue;
      const completed = d.series.some((s: any) => s.completed);
      if (completed) completedCount++;
      for (const s of d.series) {
        if (s.completed && s.weight) {
          totalVol += s.weight * s.reps;
          const ex = exercises[idx];
          if (ex && s.weight > (maxWeights[ex.name] || 0)) {
            maxWeights[ex.name] = s.weight;
          }
        }
      }
    }
    return {
      volume: totalVol,
      completedExercises: completedCount,
      duration: previousSession.duration_minutes
        ? previousSession.duration_minutes * 60
        : null,
      maxWeights,
    };
  }, [previousSession, exercises]);

  const currentStats = useMemo(() => {
    let totalVol = 0;
    let totalSeries = 0;
    const maxWeights: Record<string, number> = {};
    const prs: { name: string; prevMax: number; newMax: number; diff: number }[] = [];

    exercises.forEach((ex, i) => {
      const d = allSeriesData[i];
      if (!d) return;
      let exMax = 0;
      for (const s of d.series) {
        if (s.completed) {
          totalSeries++;
          if (s.weight) {
            totalVol += s.weight * s.reps;
            if (s.weight > exMax) exMax = s.weight;
          }
        }
      }
      if (exMax > 0) maxWeights[ex.name] = exMax;
    });

    if (prevData) {
      for (const [name, max] of Object.entries(maxWeights)) {
        const prevMax = prevData.maxWeights[name] || 0;
        if (prevMax > 0 && max > prevMax) {
          prs.push({ name, prevMax, newMax: max, diff: max - prevMax });
        }
      }
    }

    return {
      volume: totalVol,
      totalSeries,
      completedCount: completedExercises.size,
      maxWeights,
      prs,
    };
  }, [allSeriesData, exercises, completedExercises, prevData]);

  const exerciseVolumes = useMemo(() => {
    const vols: Record<number, number> = {};
    exercises.forEach((ex, i) => {
      const d = allSeriesData[i];
      if (!d) return;
      let v = 0;
      for (const s of d.series) {
        if (s.completed && s.weight) v += s.weight * s.reps;
      }
      vols[i] = v;
    });
    return vols;
  }, [allSeriesData, exercises]);

  const timeStr = formatDuration(elapsedTime);
  const endTime = workoutEnded ? new Date() : workoutStartTime;
  const dayName = endTime ? DAYS_ES[endTime.getDay()] : "";
  const dayNum = endTime ? endTime.getDate() : "";
  const monthName = endTime ? MONTHS_ES[endTime.getMonth()] : "";
  const timeStart = workoutStartTime
    ? `${workoutStartTime.getHours().toString().padStart(2, "0")}:${workoutStartTime.getMinutes().toString().padStart(2, "0")}`
    : "";
  const timeEnd = endTime
    ? `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`
    : "";

  const weightDiff =
    bodyWeight != null && prevData && previousSession?.body_weight_kg
      ? Number((bodyWeight - previousSession.body_weight_kg).toFixed(1))
      : null;

  const volumeDiffPct =
    prevData && prevData.volume > 0
      ? Math.round(((currentStats.volume - prevData.volume) / prevData.volume) * 100)
      : null;

  const durationDiff =
    prevData?.duration
      ? elapsedTime - prevData.duration
      : null;

  const exercisesDiff =
    prevData ? currentStats.completedCount - prevData.completedExercises : null;

  return (
    <AnimatePresence mode="wait">
      {step === 1 ? (
        // ── STEP 1: Weight + Gym Occupancy ──
        <motion.div
          key="step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#be0b3c]/20 to-[#be0b3c]/10 border border-[#be0b3c]/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(190,11,60,0.3)]"
            >
              <Scale className="w-9 h-9 text-[#be0b3c]" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-extrabold text-white text-center mb-1"
            >
              ¿Cuánto pesas hoy?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-zinc-500 text-center mb-8"
            >
              Registra tu peso antes de ver el resumen
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full max-w-xs space-y-5"
            >
              <div className="relative">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                  Peso corporal
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={30}
                    max={300}
                    step={0.1}
                    value={bodyWeight ?? ""}
                    onChange={(e) =>
                      setBodyWeight(e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder="78.5"
                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-lg font-bold text-center py-4 rounded-2xl focus:outline-none focus:border-[#be0b3c]/50 placeholder:text-zinc-700 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                  ¿Cómo está el gimnasio?
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "vacio", label: "Vacío", icon: "○" },
                    { value: "normal", label: "Normal", icon: "●" },
                    { value: "lleno", label: "Lleno", icon: "○" },
                  ].map((opt) => {
                    const isSelected = gymOccupancy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setGymOccupancy(opt.value)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border text-xs font-bold transition-all active:scale-[0.97] ${
                          isSelected
                            ? "bg-white/[0.06] border-[#be0b3c]/40 text-white shadow-[0_0_20px_rgba(190,11,60,0.2)]"
                            : "bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span
                          className={`text-lg ${
                            isSelected ? "text-[#be0b3c]" : "text-zinc-600"
                          }`}
                        >
                          {isSelected ? "●" : "○"}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="shrink-0 p-4 border-t border-white/[0.06]"
          >
            <button
              onClick={handleContinue}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#be0b3c] to-[#e0114d] text-white text-base font-extrabold hover:from-[#d01a4a] active:scale-[0.97] disabled:opacity-50 shadow-[0_0_40px_rgba(190,11,60,0.4)] transition-all"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      ) : (
        // ── STEP 2: Epic Summary ──
        <motion.div
          key="step2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto"
        >
          <ConfettiParticles />
          <FloatingSparkles />
          <GlowRings />

          <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 pb-32">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 z-20"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Profile photo */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="relative mb-4"
            >
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -top-5 left-1/2 -translate-x-1/2 text-xl"
              >
                👑
              </motion.div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#be0b3c] via-amber-500 to-[#be0b3c] p-[2px] shadow-[0_0_30px_rgba(190,11,60,0.5)]">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                  <Dumbbell className="w-7 h-7 text-[#be0b3c]" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h1
                className="text-3xl font-extrabold text-white tracking-tight"
                style={{
                  textShadow: "0 0 40px rgba(190,11,60,0.6), 0 0 80px rgba(190,11,60,0.3)",
                }}
              >
                ENTRENAMIENTO
              </h1>
              <h1
                className="text-3xl font-extrabold text-[#be0b3c] tracking-tight"
                style={{
                  textShadow: "0 0 30px rgba(190,11,60,0.5), 0 0 60px rgba(190,11,60,0.2)",
                }}
              >
                COMPLETADO
              </h1>
              <p className="text-xs text-zinc-500 mt-2">{routineName}</p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-2 w-full max-w-md mb-6"
            >
              <StatCard
                icon={Scale}
                value={bodyWeight != null ? `${bodyWeight}kg` : "--"}
                subtitle="Peso"
                comparison={
                  weightDiff != null
                    ? `${weightDiff > 0 ? "+" : ""}${weightDiff}kg`
                    : undefined
                }
                positive={weightDiff != null && weightDiff < 0}
                color="#be0b3c"
              />
              <StatCard
                icon={BarChart3}
                value={formatVolume(currentStats.volume)}
                subtitle="Volumen"
                comparison={
                  volumeDiffPct != null
                    ? `${volumeDiffPct > 0 ? "+" : ""}${volumeDiffPct}%`
                    : undefined
                }
                positive={volumeDiffPct != null && volumeDiffPct > 0}
                color="#f97316"
              />
              <StatCard
                icon={Clock}
                value={timeStr}
                subtitle="Duración"
                comparison={
                  durationDiff != null
                    ? `${durationDiff > 0 ? "+" : ""}${formatDuration(Math.abs(durationDiff))}`
                    : undefined
                }
                positive={false}
                color="#3b82f6"
              />
            </motion.div>

            {/* PRs section */}
            {currentStats.prs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Nuevos récords personales
                  </h3>
                </div>
                <div className="space-y-2">
                  {currentStats.prs.map((pr, i) => {
                    const pct = Math.round((pr.diff / pr.prevMax) * 100);
                    return (
                      <motion.div
                        key={pr.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-bold text-white">
                              {pr.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-400">
                            +{pr.diff}kg (+{pct}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-zinc-500">
                            {pr.prevMax}kg →{" "}
                          </span>
                          <span className="text-[11px] font-bold text-amber-300">
                            {pr.newMax}kg
                          </span>
                          <ProgressiveBar pct={pct * 3} color="#f59e0b" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* All exercises */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-md mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-[#be0b3c]" />
                <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                  Ejercicios
                </h3>
                <span className="text-[10px] text-zinc-600">
                  {completedExercises.size}/{exercises.length} completados
                </span>
              </div>
              <div className="space-y-2">
                {exercises.map((ex, i) => {
                  const isDone = completedExercises.has(i);
                  const d = allSeriesData[i];
                  const series = d?.series ?? [];
                  const exMax = d?.series.reduce(
                    (mx, s) =>
                      s.weight && s.weight > (mx || 0) ? s.weight : mx,
                    0 as number | null
                  );
                  const vol = exerciseVolumes[i] ?? 0;
                  const isPR =
                    prevData &&
                    exMax != null &&
                    exMax > (prevData.maxWeights[ex.name] || 0);

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                      className={`rounded-2xl border overflow-hidden ${
                        isDone
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-white/[0.02] border-white/[0.04] opacity-40"
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-center gap-2.5 mb-2">
                          <img
                            src={ex.gif_url}
                            alt={ex.name}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-bold truncate ${
                                isDone ? "text-emerald-200" : "text-zinc-600"
                              }`}
                            >
                              {ex.name}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                              {ex.muscle_group}
                              {exMax != null && (
                                <span className="text-amber-500/70 ml-2">
                                  {exMax}kg máximo
                                </span>
                              )}
                            </p>
                          </div>
                          {isDone ? (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                          )}
                        </div>

                        {series.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {series.map((s, si) => (
                              <span
                                key={si}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.completed
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : "bg-white/[0.03] text-zinc-600 border border-white/[0.06]"
                                }`}
                              >
                                S{si + 1}:{" "}
                                {s.weight != null ? `${s.weight}kg` : "--"}
                                {" × "}
                                {s.reps}
                                {s.completed ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : null}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-zinc-500">
                            {vol > 0 ? `Volumen: ${formatVolume(vol)}` : "Sin volumen"}
                          </span>
                          {isPR && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                              <Trophy className="w-3 h-3" />
                              ¡Nuevo PR!
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Comparison section */}
            {prevData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full max-w-md mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                    VS Anterior
                  </h3>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                  {/* Volume comparison */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Volumen
                      </span>
                      <span className="text-[10px] font-bold text-white">
                        {formatVolume(prevData.volume)} → {formatVolume(currentStats.volume)}
                        {volumeDiffPct != null && (
                          <span
                            className={
                              volumeDiffPct >= 0
                                ? "text-emerald-400 ml-1"
                                : "text-zinc-500 ml-1"
                            }
                          >
                            ({volumeDiffPct >= 0 ? "+" : ""}
                            {volumeDiffPct}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <ProgressiveBar
                      pct={
                        prevData.volume > 0
                          ? (currentStats.volume / prevData.volume) * 100 - 100
                          : 0
                      }
                      color="#22c55e"
                    />
                  </div>

                  {/* Duration comparison */}
                  {prevData.duration != null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">
                          Duración
                        </span>
                        <span className="text-[10px] font-bold text-white">
                          {formatDuration(prevData.duration)} → {timeStr}
                          {durationDiff != null && (
                            <span className="text-zinc-500 ml-1">
                              ({durationDiff > 0 ? "+" : ""}
                              {formatDuration(Math.abs(durationDiff))})
                            </span>
                          )}
                        </span>
                      </div>
                      <ProgressiveBar
                        pct={
                          prevData.duration > 0
                            ? (elapsedTime / prevData.duration) * 100 - 100
                            : 0
                        }
                        color="#3b82f6"
                      />
                    </div>
                  )}

                  {/* Exercises comparison */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Ejercicios
                      </span>
                      <span className="text-[10px] font-bold text-white">
                        {prevData.completedExercises} → {currentStats.completedCount}
                        {exercisesDiff != null && (
                          <span
                            className={
                              exercisesDiff >= 0
                                ? "text-emerald-400 ml-1"
                                : "text-zinc-500 ml-1"
                            }
                          >
                            ({exercisesDiff >= 0 ? "+" : ""}
                            {exercisesDiff})
                          </span>
                        )}
                      </span>
                    </div>
                    <ProgressiveBar
                      pct={
                        prevData.completedExercises > 0
                          ? (currentStats.completedCount /
                              prevData.completedExercises) *
                              100 -
                            100
                          : 0
                      }
                      color="#a855f7"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="w-full max-w-md mb-6 space-y-2"
            >
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">
                    {timeStart} - {timeEnd} · {dayName} {dayNum} {monthName}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">
                    {OCCUPANCY_MAP[gymOccupancy] || gymOccupancy}
                  </span>
                </div>
              </div>

              <label className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-400">
                    Subir foto de progreso
                  </span>
                </div>
                {uploadingPhoto ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-zinc-500/30 border-t-zinc-400 rounded-full"
                  />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </motion.div>

            {/* Stars decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-1 mb-8"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 1 + i * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent space-y-2"
          >
            <div className="max-w-md mx-auto space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-sm font-bold hover:bg-white/[0.06] active:scale-[0.97] transition-all">
                <Share2 className="w-4 h-4" /> Compartir
              </button>
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#be0b3c] to-[#e0114d] text-white text-sm font-extrabold hover:from-[#d01a4a] active:scale-[0.97] shadow-[0_0_30px_rgba(190,11,60,0.4)] transition-all"
              >
                <Home className="w-4 h-4" /> Volver al inicio
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
