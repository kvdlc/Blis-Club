"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Flame,
  Dumbbell,
  CheckSquare,
  Droplets,
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  Pencil,
  Apple,
  Calendar,
  Star,
  X,
  Save,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  data: {
    profile: { first_name?: string; avatar_url?: string } | null;
    streak: number;
    sessionsCount: number;
    sessionsThisWeek: number;
    routinesCount: number;
    exercisesCount: number;
    muscleVolume: Array<{ muscle: string; volume: number }>;
    habits: any[];
    todayStr: string;
    plan: any;
    last7Days: Array<{ day: string; trained: boolean; planned: boolean }>;
  };
  userId: string;
}

const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const FULL_DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const PIE_COLORS = [
  "#be0b3c",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
];

const PRESET_SCHEDULES: Record<string, string[]> = {
  interdiario: ["Lu", "Mi", "Vi"],
  lmxjv: ["Lu", "Ma", "Mi", "Ju", "Vi"],
  lxv: ["Lu", "Mi", "Vi"],
  full: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
};

function getPresetFromDays(days: string[] | undefined): string {
  if (!days || days.length === 0) return "custom";
  const sorted = [...days].sort(
    (a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b)
  );
  for (const [key, preset] of Object.entries(PRESET_SCHEDULES)) {
    const presetSorted = [...preset].sort(
      (a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b)
    );
    if (JSON.stringify(sorted) === JSON.stringify(presetSorted)) return key;
  }
  if (
    days.length === 2 &&
    days.includes("Lu") &&
    days.includes("Mi") &&
    days.every((d) => DAY_NAMES.indexOf(d) % 2 === 0)
  ) {
    return "interdiario";
  }
  return "custom";
}

const HABIT_ICONS: Record<string, React.ReactNode> = {
  default: <Star className="w-4 h-4 text-amber-400" />,
  water: <Droplets className="w-4 h-4 text-blue-400" />,
  food: <Apple className="w-4 h-4 text-green-400" />,
  exercise: <Dumbbell className="w-4 h-4 text-spartan-400" />,
  reading: <FileText className="w-4 h-4 text-violet-400" />,
};

export default function DashboardContent({ data, userId }: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [habitsData, setHabitsData] = useState(data.habits);
  const [habitLoading, setHabitLoading] = useState<Record<string, boolean>>({});

  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [localPlan, setLocalPlan] = useState(data.plan);

  const initialPreset = getPresetFromDays(data.plan?.custom_days ?? []);
  const [planForm, setPlanForm] = useState<{
    preset: string;
    custom_days: string[];
    target_sessions: number;
  }>({
    preset: data.plan ? initialPreset : "",
    custom_days: data.plan?.custom_days ?? [],
    target_sessions: data.plan?.target_sessions ?? 4,
  });

  const firstName = data.profile?.first_name ?? "";
  const handleName = firstName || "guerrero";

  const constancyPct = useMemo(() => {
    const planned = data.last7Days.filter((d) => d.planned);
    if (planned.length === 0) return null;
    const trained = planned.filter((d) => d.trained).length;
    return Math.round((trained / planned.length) * 100);
  }, [data.last7Days]);

  const totalTons = useMemo(
    () => data.muscleVolume.reduce((sum, m) => sum + m.volume, 0),
    [data.muscleVolume]
  );

  const volumeTrend = null;

  const getEntryForHabit = useCallback(
    (habit: any) => {
      return (
        habit.spartan_habit_entries?.find((e: any) => e.date === data.todayStr) ??
        null
      );
    },
    [data.todayStr]
  );

  const completedHabits = useMemo(
    () =>
      habitsData.filter((h: any) => {
        const e = getEntryForHabit(h);
        return e && e.completed;
      }).length,
    [habitsData, getEntryForHabit]
  );

  const updateLocalEntry = useCallback(
    (habitId: string, updates: { value?: number; completed?: boolean }) => {
      setHabitsData((prev: any[]) =>
        prev.map((h: any) => {
          if (h.id !== habitId) return h;
          const entries = [...(h.spartan_habit_entries ?? [])];
          const idx = entries.findIndex(
            (e: any) => e.date === data.todayStr
          );
          if (idx >= 0) {
            entries[idx] = { ...entries[idx], ...updates };
          } else {
            entries.push({
              habit_id: habitId,
              user_id: userId,
              date: data.todayStr,
              value: updates.value ?? 0,
              completed: updates.completed ?? false,
            });
          }
          return { ...h, spartan_habit_entries: entries };
        })
      );
    },
    [data.todayStr, userId]
  );

  const handleToggleCheck = async (habit: any) => {
    const entry = getEntryForHabit(habit);
    const isCompleted = entry?.completed ?? false;

    setHabitLoading((prev) => ({ ...prev, [habit.id]: true }));

    const newCompleted = !isCompleted;
    updateLocalEntry(habit.id, {
      value: newCompleted ? 1 : 0,
      completed: newCompleted,
    });

    try {
      const { error } = await supabase.from("spartan_habit_entries").upsert(
        {
          habit_id: habit.id,
          user_id: userId,
          date: data.todayStr,
          value: newCompleted ? 1 : 0,
          completed: newCompleted,
        },
        { onConflict: "habit_id,user_id,date" }
      );
      if (error) throw error;
    } catch {
      updateLocalEntry(habit.id, {
        value: isCompleted ? 1 : 0,
        completed: isCompleted,
      });
    } finally {
      setHabitLoading((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  const handleIncrementCounter = async (habit: any) => {
    const entry = getEntryForHabit(habit);
    const currentValue = entry?.value ?? 0;
    const targetValue = habit.target_value ?? 1;
    const newValue = currentValue + 1;
    const newCompleted = newValue >= targetValue;

    setHabitLoading((prev) => ({ ...prev, [habit.id]: true }));

    updateLocalEntry(habit.id, { value: newValue, completed: newCompleted });

    try {
      const { error } = await supabase.from("spartan_habit_entries").upsert(
        {
          habit_id: habit.id,
          user_id: userId,
          date: data.todayStr,
          value: newValue,
          completed: newCompleted,
        },
        { onConflict: "habit_id,user_id,date" }
      );
      if (error) throw error;
    } catch {
      updateLocalEntry(habit.id, {
        value: currentValue,
        completed: entry?.completed ?? false,
      });
    } finally {
      setHabitLoading((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  const handleSavePlan = async () => {
    setPlanSaving(true);
    try {
      const { error } = await supabase.from("spartan_training_plan").upsert({
        user_id: userId,
        custom_days: planForm.custom_days,
        target_sessions: planForm.target_sessions,
        schedule_type: planForm.preset,
      });
      if (error) throw error;

      setLocalPlan({
        custom_days: planForm.custom_days,
        target_sessions: planForm.target_sessions,
        schedule_type: planForm.preset,
      });
      setShowPlanEditor(false);
    } catch {
    } finally {
      setPlanSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setPlanForm((prev) => {
      const newDays = prev.custom_days.includes(day)
        ? prev.custom_days.filter((d) => d !== day)
        : [...prev.custom_days, day].sort((a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b));
      return { ...prev, preset: "custom", custom_days: newDays, target_sessions: newDays.length };
    });
  };

  const selectPreset = (key: string) => {
    const days = PRESET_SCHEDULES[key] ?? planForm.custom_days;
    setPlanForm({ preset: key, custom_days: days, target_sessions: days.length });
  };

  const resolvedPlan = localPlan || data.plan;

  return (
    <div className="space-y-5 pb-8">
      {/* ── Section 1: Hero compacto ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4"
      >
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center ring-2 ring-spartan-500/40 shadow-[0_0_20px_rgba(190,11,60,0.25)]">
            {data.profile?.avatar_url ? (
              <img
                src={data.profile.avatar_url}
                alt=""
                className="w-11 h-11 rounded-full object-cover"
              />
            ) : (
              <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-white truncate">
            Hola {handleName}
          </h2>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-spartan-500/10 border border-spartan-500/20">
              <Flame className="w-3.5 h-3.5 text-spartan-400" strokeWidth={2.5} />
              <span className="text-xs font-bold text-spartan-400">{data.streak}</span>
              <span className="text-[10px] text-spartan-400/70">días de racha</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Dumbbell className="w-3.5 h-3.5" />
              <span className="font-bold text-zinc-300">{data.sessionsCount}</span>
              <span>sesiones</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 2: Constancia semanal ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-spartan-400" />
            <h3 className="text-sm font-bold text-zinc-200">
              Constancia
            </h3>
            {constancyPct !== null && (
              <span className="text-xs font-bold text-spartan-400 ml-1">
                {constancyPct}%
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setPlanForm({
                preset: resolvedPlan
                  ? getPresetFromDays(resolvedPlan.custom_days)
                  : "",
                custom_days: resolvedPlan?.custom_days ?? [],
                target_sessions: resolvedPlan?.target_sessions ?? 4,
              });
              setShowPlanEditor(!showPlanEditor);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-medium text-zinc-400"
          >
            <Pencil className="w-3 h-3" />
            Editar plan
          </button>
        </div>

        {!resolvedPlan?.custom_days?.length ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">Define tu plan de entrenamiento</p>
            <p className="text-xs text-zinc-600 mt-0.5 max-w-xs">
              Configura los días que entrenas para hacer seguimiento de tu constancia.
            </p>
            <button
              onClick={() => {
                setPlanForm({ preset: "", custom_days: [], target_sessions: 4 });
                setShowPlanEditor(true);
              }}
              className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-95"
            >
              Configurar plan
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1.5 h-28">
              {data.last7Days.map((day, i) => {
                let barColor = "bg-zinc-800";
                if (day.trained) barColor = "bg-emerald-500";
                else if (day.planned) barColor = "bg-spartan-500";

                const maxPlanned = Math.max(
                  1,
                  data.last7Days.filter((d) => d.planned).length
                );
                const heightPct = day.trained || day.planned ? "100%" : "35%";

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1 justify-end"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: heightPct }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className={`w-full max-w-[32px] rounded-t-md ${barColor}`}
                      style={{ minHeight: day.trained || day.planned ? undefined : 12 }}
                    />
                    <span className="text-[10px] font-medium text-zinc-500">
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {constancyPct !== null && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-xs text-zinc-500">
                  {data.last7Days.filter((d) => d.trained).length} de {data.last7Days.filter((d) => d.planned).length} días entrenados
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`font-bold ${
                      constancyPct >= 80
                        ? "text-emerald-400"
                        : constancyPct >= 50
                          ? "text-amber-400"
                          : "text-spartan-400"
                    }`}
                  >
                    {constancyPct}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Plan editor inline ── */}
        <AnimatePresence>
          {showPlanEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Configurar plan de entrenamiento
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "interdiario", label: "Interdiario" },
                    { key: "lmxjv", label: "L-M-X-J-V" },
                    { key: "lxv", label: "L-X-V" },
                    { key: "full", label: "Toda la semana" },
                    { key: "custom", label: "Personalizado" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key !== "custom") selectPreset(key);
                        else
                          setPlanForm((p) => ({
                            ...p,
                            preset: "custom",
                          }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        planForm.preset === key
                          ? "bg-spartan-500/20 border-spartan-500/40 text-spartan-300"
                          : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {(planForm.preset === "custom" ||
                  planForm.preset === "") && (
                  <div>
                    <p className="text-[10px] text-zinc-500 mb-2">
                      Selecciona los días
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DAY_NAMES.map((day, i) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all ${
                            planForm.custom_days.includes(day)
                              ? "bg-spartan-500/20 border-spartan-500/40 text-spartan-300"
                              : "bg-white/[0.03] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]"
                          }`}
                          title={FULL_DAY_NAMES[i]}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-zinc-500 mb-1.5">
                    Sesiones por semana
                  </p>
                  <p className="text-sm font-extrabold text-white">{planForm.custom_days.length || planForm.target_sessions} {planForm.custom_days.length === 1 ? "día" : "días"}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePlan}
                    disabled={planSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {planSaving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Guardar plan
                  </button>
                  <button
                    onClick={() => setShowPlanEditor(false)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-500 hover:text-zinc-300 transition-all"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Section 3: Estadísticas ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-spartan-400" />
          <h3 className="text-sm font-bold text-zinc-200">Tus números</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
            <p className="text-2xl font-extrabold text-white">{data.routinesCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">rutinas creadas</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
            <p className="text-2xl font-extrabold text-white">{data.sessionsThisWeek}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">sesiones esta semana</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
            <p className="text-2xl font-extrabold text-white">{data.exercisesCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">ejercicios en rutinas</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
            <p className="text-2xl font-extrabold text-white">{data.sessionsCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">entrenos totales</p>
          </div>
        </div>
      </motion.div>

      {/* ── Section 4: Distribución muscular (Pie Chart) ── */}
      {data.muscleVolume.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4 text-spartan-400" />
            <h3 className="text-sm font-bold text-zinc-200">Músculos más trabajados</h3>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.muscleVolume} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="volume" nameKey="muscle" stroke="none">
                  {data.muscleVolume.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "#e4e4e7", padding: "8px 12px" }}
                  formatter={(value: number) => [`${value} toneladas`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa", paddingTop: 4 }} iconType="circle" iconSize={6} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Section 5: Hábitos de hoy ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-200">
              Hábitos de hoy
            </h3>
          </div>
          <span className="text-xs font-bold text-zinc-400">
            {completedHabits}/{habitsData.length}
          </span>
        </div>

        {habitsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckSquare className="w-8 h-8 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">Sin hábitos configurados</p>
            <Link
              href="/Spartan/app/habitos"
              className="mt-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all"
            >
              Agregar hábito
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {habitsData.map((habit: any) => {
              const entry = getEntryForHabit(habit);
              const isCheck =
                habit.type === "check" || habit.type === "measure";
              const isCounter = habit.type === "counter";
              const isCurrency =
                habit.type === "currency_income" ||
                habit.type === "currency_expense";
              const isCompleted = entry?.completed ?? false;
              const isLoading = habitLoading[habit.id] ?? false;
              const icon =
                HABIT_ICONS[habit.icon as string] ?? HABIT_ICONS.default;

              return (
                <motion.div
                  key={habit.id}
                  layout
                  className={`p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/15"
                      : "bg-white/[0.02] border-white/[0.04]"
                  }`}
                >
                  {/* Check type */}
                  {isCheck && (
                    <button
                      onClick={() => handleToggleCheck(habit)}
                      disabled={isLoading}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-bold text-zinc-200 truncate">
                          {habit.name}
                        </p>
                        {habit.description && (
                          <p className="text-[10px] text-zinc-500 truncate">
                            {habit.description}
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                            : "border-zinc-600"
                        }`}
                      >
                        {isLoading ? (
                          <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        ) : isCompleted ? (
                          <Check
                            className="w-3.5 h-3.5 text-white"
                            strokeWidth={3}
                          />
                        ) : null}
                      </div>
                    </button>
                  )}

                  {/* Counter type */}
                  {isCounter && (
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-200 truncate">
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {habit.container_size &&
                              habit.container_label && (
                                <span className="text-[10px] text-zinc-500">
                                  {habit.container_size}
                                  {habit.container_label}
                                </span>
                              )}
                            {habit.container_size &&
                              habit.container_label && (
                                <span className="text-[10px] text-zinc-600">
                                  Botellas: {entry?.value ?? 0}/
                                  {habit.target_value ?? 0}
                                </span>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleIncrementCounter(habit)}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-zinc-300 shrink-0 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          +1
                          {habit.unit
                            ? ` ${habit.unit}`
                            : habit.container_size && habit.container_label
                              ? ` ${habit.container_size}${habit.container_label}`
                              : ""}
                        </button>
                      </div>

                      <div className="mt-2 ml-12">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-500">
                            {entry?.value ?? 0}/{habit.target_value ?? 0}{" "}
                            {habit.unit || ""}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">
                            {Math.min(
                              100,
                              ((entry?.value ?? 0) /
                                (habit.target_value || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                100,
                                ((entry?.value ?? 0) /
                                  (habit.target_value || 1)) *
                                  100
                              )}%`,
                            }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: habit.color || "#3b82f6",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Currency type */}
                  {isCurrency && (
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          habit.type === "currency_income"
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-spartan-500/10 border-spartan-500/20"
                        }`}
                      >
                        {habit.type === "currency_income" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-spartan-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-200 truncate">
                          {habit.name}
                        </p>
                      </div>
                      {entry && (
                        <span
                          className={`text-sm font-extrabold ${
                            habit.type === "currency_income"
                              ? "text-emerald-400"
                              : "text-spartan-400"
                          }`}
                        >
                          {habit.type === "currency_income" ? "+" : "-"}$
                          {Number(entry.value).toLocaleString("es-ES")}
                        </span>
                      )}
                      {!entry && (
                        <span className="text-xs text-zinc-600">
                          Sin registro hoy
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}

            <Link
              href="/Spartan/app/habitos"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.06] hover:bg-white/[0.04] transition-all text-xs text-zinc-500 hover:text-zinc-300"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar hábito
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Section 6: Acceso rápido ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="space-y-2"
      >
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
          Acceso rápido
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/Spartan/app/gimnasio"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-spartan-500/10 border border-spartan-500/20 flex items-center justify-center group-hover:bg-spartan-500/15 transition-all">
              <Dumbbell className="w-5 h-5 text-spartan-400" />
            </div>
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Gimnasio
            </span>
          </Link>

          <Link
            href="/Spartan/app/motivacion"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/15 transition-all">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Motivación
            </span>
          </Link>

          <Link
            href="/Spartan/app/habitos"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-all">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Hábitos
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
