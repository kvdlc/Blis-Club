"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Plus, Check, X, Settings, Trash2, Droplets, TrendingUp, TrendingDown, Wallet, Apple, BookOpen, Dumbbell, Star, Save, Pencil, Eye } from "lucide-react";

const HABIT_TYPES = [
  { value: "counter", label: "Contador", icon: Plus },
  { value: "check", label: "Check diario", icon: Check },
  { value: "currency_income", label: "Ingreso ($)", icon: TrendingUp },
  { value: "currency_expense", label: "Gasto ($)", icon: TrendingDown },
];

const ICON_OPTIONS = [
  { value: "Droplets", icon: Droplets, label: "Agua" },
  { value: "Apple", icon: Apple, label: "Comida" },
  { value: "Dumbbell", icon: Dumbbell, label: "Ejercicio" },
  { value: "BookOpen", icon: BookOpen, label: "Lectura" },
  { value: "Wallet", icon: Wallet, label: "Dinero" },
  { value: "Star", icon: Star, label: "Estrella" },
];

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#be0b3c", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

interface HabitForm {
  name: string;
  type: string;
  unit: string;
  target_value: number;
  container_size: number | null;
  container_label: string;
  color: string;
  icon: string;
}

export default function HabitosPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [todayEntries, setTodayEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [form, setForm] = useState<HabitForm>({
    name: "", type: "counter", unit: "", target_value: 1,
    container_size: null, container_label: "", color: "#3b82f6", icon: "Droplets",
  });
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState("");

  useEffect(() => { setTodayStr(new Date().toISOString().split("T")[0]); }, []);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const today = new Date().toISOString().split("T")[0];
    const [habitsRes, entriesRes] = await Promise.all([
      supabase.from("spartan_habits").select("*").eq("user_id", user.id).eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("spartan_habit_entries").select("*").eq("user_id", user.id).eq("date", today),
    ]);
    setHabits(habitsRes.data ?? []);
    setTodayEntries(entriesRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getEntry = (habitId: string) => todayEntries.find((e: any) => e.habit_id === habitId);

  const openEditor = (habit?: any) => {
    if (habit) {
      setEditingHabit(habit);
      setForm({
        name: habit.name, type: habit.type, unit: habit.unit || "",
        target_value: habit.target_value || 1,
        container_size: habit.container_size ?? null,
        container_label: habit.container_label || "",
        color: habit.color || "#3b82f6", icon: habit.icon || "Droplets",
      });
    } else {
      setEditingHabit(null);
      setForm({ name: "", type: "counter", unit: "", target_value: 1, container_size: null, container_label: "", color: "#3b82f6", icon: "Droplets" });
    }
    setShowEditor(true);
  };

  const saveHabit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const data = {
      user_id: userId, name: form.name.trim(), type: form.type,
      unit: form.unit || null, target_value: form.target_value || 1,
      container_size: form.container_size || null, container_label: form.container_label || null,
      color: form.color, icon: form.icon,
      is_active: true,
    };
    if (editingHabit) {
      await supabase.from("spartan_habits").update(data).eq("id", editingHabit.id);
    } else {
      await supabase.from("spartan_habits").insert(data);
    }
    setSaving(false); setShowEditor(false);
    await loadData();
  };

  const deleteHabit = async (id: string) => {
    if (!confirm("¿Eliminar este hábito?")) return;
    await createClient().from("spartan_habits").delete().eq("id", id);
    await loadData();
  };

  const markHabit = async (habit: any) => {
    setActionLoading(habit.id);
    const supabase = createClient();
    const entry = getEntry(habit.id);

    if (habit.type === "counter") {
      const current = entry?.value || 0;
      const newVal = current + 1;
      const completed = newVal >= (habit.target_value || 1);
      await supabase.from("spartan_habit_entries").upsert({
        habit_id: habit.id, user_id: userId, date: todayStr, value: newVal, completed,
      });
    } else if (habit.type === "check") {
      if (entry?.completed) {
        await supabase.from("spartan_habit_entries").delete().eq("id", entry.id);
      } else {
        await supabase.from("spartan_habit_entries").upsert({
          habit_id: habit.id, user_id: userId, date: todayStr, value: 1, completed: true,
        });
      }
    }
    setActionLoading(null);
    await loadData();
  };

  const getIcon = (iconName: string) => {
    const opt = ICON_OPTIONS.find(o => o.value === iconName);
    return opt?.icon || Star;
  };

  const completedCount = habits.filter((h: any) => { const e = getEntry(h.id); return e && e.completed; }).length;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Hábitos</h1>
            <p className="text-xs text-zinc-500">Hoy: {completedCount}/{habits.length} completados</p>
          </div>
        </div>
        <button onClick={() => openEditor()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold hover:from-spartan-500 active:scale-[0.97] shadow-[0_0_15px_rgba(190,11,60,0.3)]">
          <Plus className="w-3.5 h-3.5" /> Nuevo
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <CheckSquare className="w-12 h-12 text-zinc-700 mb-3" />
          <h2 className="text-lg font-bold text-zinc-300">Sin hábitos</h2>
          <p className="text-sm text-zinc-500 mt-1">Agrega hábitos para hacer seguimiento diario.</p>
          <button onClick={() => openEditor()} className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold active:scale-95 shadow-[0_0_20px_rgba(190,11,60,0.3)]">Agregar hábito</button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400">Progreso de hoy</span>
              <span className="text-xs font-bold text-zinc-200">{completedCount}/{habits.length}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: habits.length > 0 ? `${(completedCount/habits.length)*100}%` : "0%" }} />
            </div>
          </div>

          {/* Habit cards */}
          <div className="space-y-2">
            {habits.map((habit: any) => {
              const entry = getEntry(habit.id);
              const isCheck = habit.type === "check";
              const isCurrency = habit.type === "currency_income" || habit.type === "currency_expense";
              const isCounter = !isCheck && !isCurrency;
              const isCompleted = entry?.completed ?? false;
              const IconComp = getIcon(habit.icon);
              const current = entry?.value || 0;
              const target = habit.target_value || 1;
              const pct = Math.min(100, (current / target) * 100);
              const isLoading = actionLoading === habit.id;

              return (
                <motion.div key={habit.id} layout className={`rounded-2xl border overflow-hidden ${isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <button onClick={() => markHabit(habit)} disabled={isLoading} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all active:scale-[0.95] ${isCompleted ? "bg-emerald-500/20 border-emerald-500/30" : "bg-white/[0.03] border-white/[0.06]"}`} style={{ borderColor: isCompleted ? undefined : `${habit.color}30` }}>
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <IconComp className={`w-5 h-5 ${isCompleted ? "text-emerald-400" : ""}`} style={{ color: isCompleted ? undefined : habit.color }} />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0" onClick={() => isCounter && markHabit(habit)}>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-zinc-200">{habit.name}</p>
                        </div>

                        {isCurrency && entry && (
                          <p className={`text-lg font-extrabold mt-0.5 ${habit.type === "currency_income" ? "text-emerald-400" : "text-spartan-400"}`}>
                            {habit.type === "currency_income" ? "+" : "-"}${Number(entry.value).toLocaleString("es-ES")}
                          </p>
                        )}

                        {isCounter && (
                          <div className="mt-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-zinc-400">
                                {habit.container_label && current > 0 ? `${current} × ${habit.container_label}` : current} / {target} {habit.unit || ""}
                              </span>
                              <span className="text-[10px] text-zinc-600">{Math.round(pct)}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: habit.color }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isCounter && (
                          <button onClick={() => markHabit(habit)} disabled={isLoading} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-[0.95] ${isCompleted ? "bg-emerald-500/20" : "bg-white/5 border border-white/10 hover:bg-emerald-500/20"}`}>
                            <Plus className={`w-4 h-4 ${isCompleted ? "text-emerald-400" : "text-zinc-500"}`} />
                          </button>
                        )}
                        {isCheck && (
                          <button onClick={() => markHabit(habit)} disabled={isLoading} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-[0.95] ${isCompleted ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                            {isCompleted && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </button>
                        )}
                        <button onClick={() => openEditor(habit)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteHabit(habit.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-700 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setShowEditor(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="relative bg-zinc-900 border border-white/[0.08] rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/[0.06] z-10">
                <h2 className="text-base font-extrabold text-white">{editingHabit ? "Editar hábito" : "Nuevo hábito"}</h2>
                <button onClick={() => setShowEditor(false)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"><X className="w-4 h-4 text-zinc-400" /></button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Agua, Lectura..." className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {HABIT_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm({ ...form, type: t.value })} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${form.type === t.value ? "bg-spartan-600/10 border-spartan-500/30 text-spartan-400" : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"}`}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Meta diaria</label>
                    <input type="number" min={1} value={form.target_value} onChange={e => setForm({ ...form, target_value: parseInt(e.target.value) || 1 })} className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white text-center focus:outline-none focus:border-spartan-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Unidad</label>
                    <input type="text" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="botellas, min..." className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white text-center placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                  </div>
                </div>

                {/* Container config (for water/tomatodo) */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Configuración del contenedor</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-zinc-600">Tamaño (ml)</label>
                      <input type="number" value={form.container_size ?? ""} onChange={e => setForm({ ...form, container_size: e.target.value ? parseFloat(e.target.value) : null })} placeholder="750" className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-600">Etiqueta</label>
                      <input type="text" value={form.container_label} onChange={e => setForm({ ...form, container_label: e.target.value })} placeholder="750ml" className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white text-center placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
                    </div>
                  </div>
                </div>

                {/* Icon picker */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Ícono</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ICON_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setForm({ ...form, icon: opt.value })} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${form.icon === opt.value ? "bg-spartan-600/20 border-spartan-500/40" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"}`} title={opt.label}>
                        <opt.icon className={`w-5 h-5 ${form.icon === opt.value ? "text-spartan-400" : "text-zinc-400"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Color</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-full border-2 transition-all active:scale-[0.95]" style={{ backgroundColor: c, borderColor: form.color === c ? "#fff" : "transparent" }} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowEditor(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-sm font-bold hover:bg-white/10">Cancelar</button>
                  <button onClick={saveHabit} disabled={saving || !form.name.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
                    {saving ? "..." : <><Save className="w-4 h-4" /> {editingHabit ? "Actualizar" : "Crear hábito"}</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
