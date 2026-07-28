"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Save, Star, Plus, ChevronDown, ChevronUp, Minus, EyeOff, List, ListCollapse } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  gif_url: string;
  instructions: string | null;
  isHidden?: boolean;
}

interface ExerciseConfig {
  default_sets: number;
  default_reps: number;
  default_weight_kg: number | null;
  default_rest_seconds: number;
  machine_name: string | null;
}

interface FavoriteWithConfig {
  exercise: Exercise;
  config: ExerciseConfig;
}

interface SelectedExercise {
  exercise: Exercise;
  config: { sets: number; reps: number; weight: number | null; rest: number };
}

interface EditingRoutineData {
  id: string;
  name: string;
  muscle_group: string | null;
  exercises: Array<{
    id: string;
    name: string;
    gif_url: string;
    muscle_group: string;
    sets: number;
    reps: number;
    weight_kg: number | null;
    rest_seconds: number;
    exercise_library_id?: string | null;
  }>;
}

interface RoutineBuilderProps {
  userId: string;
  onClose: () => void;
  onSave: () => void;
  editingRoutine?: EditingRoutineData | null;
}

const MUSCLE_GROUPS = ["Pecho", "Espalda", "Hombros", "Biceps", "Triceps", "Piernas", "Abdomen", "Antebrazo", "Trapecio"];

export default function RoutineBuilder({ userId, onClose, onSave, editingRoutine }: RoutineBuilderProps) {
  const [routineName, setRoutineName] = useState(editingRoutine?.name || "");
  const [muscleTargets, setMuscleTargets] = useState<string[]>(editingRoutine?.muscle_group ? editingRoutine.muscle_group.split(" + ") : []);
  const [tab, setTab] = useState<"favorites" | "all">("favorites");
  const [favorites, setFavorites] = useState<FavoriteWithConfig[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [expandedMuscles, setExpandedMuscles] = useState<Set<string>>(new Set(editingRoutine?.muscle_group ? editingRoutine.muscle_group.split(" + ") : []));
  const [expandedSelected, setExpandedSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const [favRes, configsRes, allRes, hiddenRes] = await Promise.all([
        supabase.from("spartan_exercise_favorites").select("exercise_id").eq("user_id", userId),
        supabase.from("spartan_exercise_configs").select("*").eq("user_id", userId),
        supabase.from("spartan_exercise_library").select("*").eq("is_active", true).order("muscle_group").order("name"),
        supabase.from("spartan_exercise_hidden").select("exercise_id").eq("user_id", userId),
      ]);

      const favIds = new Set((favRes.data ?? []).map((f: any) => f.exercise_id));
      const hidIds = new Set<string>((hiddenRes.data ?? []).map((h: any) => h.exercise_id));
      const configsMap = new Map<string, any>();
      (configsRes.data ?? []).forEach((c: any) => configsMap.set(c.exercise_id, c));

      setHiddenIds(hidIds);

      const allExercisesData = (allRes.data ?? []) as any[];

      // Map favorites with their configs (exclude hidden)
      const favData: FavoriteWithConfig[] = [];
      for (const ex of allExercisesData) {
        if (favIds.has(ex.id) && !hidIds.has(ex.id)) {
          const cfg = configsMap.get(ex.id);
          favData.push({
            exercise: { ...ex, isHidden: hidIds.has(ex.id) } as Exercise,
            config: {
              default_sets: cfg?.default_sets ?? 3,
              default_reps: cfg?.default_reps ?? 10,
              default_weight_kg: cfg?.default_weight_kg ?? null,
              default_rest_seconds: cfg?.default_rest_seconds ?? 60,
              machine_name: cfg?.machine_name ?? null,
            },
          });
        }
      }

      setFavorites(favData);
      setAllExercises(allExercisesData.map((e) => ({ ...e, isHidden: hidIds.has(e.id) })) as Exercise[]);

      // Pre-fill selected exercises if editing
      if (editingRoutine) {
        const preSelected: SelectedExercise[] = [];
        for (const ex of editingRoutine.exercises) {
          // Match by exercise_library_id first, then by name+muscle
          let libraryEx = null;
          if (ex.exercise_library_id) {
            libraryEx = allExercisesData.find((lib: any) => lib.id === ex.exercise_library_id);
          }
          if (!libraryEx) {
            libraryEx = allExercisesData.find((lib: any) => lib.name === ex.name && lib.muscle_group === ex.muscle_group);
          }
          preSelected.push({
            exercise: (libraryEx || { id: ex.id, name: ex.name, gif_url: ex.gif_url, muscle_group: ex.muscle_group, equipment: "", difficulty: "intermedio" }) as Exercise,
            config: { sets: ex.sets, reps: ex.reps, weight: ex.weight_kg, rest: ex.rest_seconds },
          });
        }
        setSelected(preSelected);
      }

      setLoading(false);
    };
    load();
  }, [userId]);

  const toggleMuscleTarget = (muscle: string) => {
    setMuscleTargets((prev) => {
      if (prev.includes(muscle)) return prev.filter((m) => m !== muscle);
      return [...prev, muscle];
    });
    setExpandedMuscles((prev) => {
      const next = new Set(prev);
      next.has(muscle) ? next.delete(muscle) : next.add(muscle);
      return next;
    });
  };

  const muscleGrouped = useMemo(() => {
    const map: Record<string, Exercise[]> = {};
    for (const ex of allExercises) {
      if (!map[ex.muscle_group]) map[ex.muscle_group] = [];
      map[ex.muscle_group].push(ex);
    }
    return map;
  }, [allExercises]);

  // Filter "all" tab by selected muscle targets, in user's order
  const filteredMuscleGroups = useMemo(() => {
    if (muscleTargets.length === 0) return MUSCLE_GROUPS;
    // Respect user selection order
    return muscleTargets;
  }, [muscleTargets]);

  const toggleMuscle = (m: string) => {
    setExpandedMuscles((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  };

  const toggleSelected = (idx: number) => {
    setExpandedSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const addExercise = (exercise: Exercise, config?: ExerciseConfig) => {
    if (selected.find((s) => s.exercise.id === exercise.id)) return;
    setSelected((prev) => [
      ...prev,
      { exercise, config: { sets: config?.default_sets ?? 3, reps: config?.default_reps ?? 10, weight: config?.default_weight_kg ?? null, rest: config?.default_rest_seconds ?? 60 } },
    ]);
  };

  const removeExercise = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx: number, dir: -1 | 1) => {
    setSelected((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const updateSelectedConfig = (idx: number, field: keyof SelectedExercise["config"], value: number | null) => {
    setSelected((prev) => prev.map((s, i) => (i === idx ? { ...s, config: { ...s.config, [field]: value } } : s)));
  };

  const handleSave = async () => {
    if (!routineName.trim() || selected.length === 0) return;
    setSaving(true);
    const supabase = createClient();

    let routineId = editingRoutine?.id;

    if (editingRoutine) {
      await supabase.from("spartan_workout_routines").update({ name: routineName.trim(), muscle_group: muscleTargets.join(" + ") || null }).eq("id", editingRoutine.id);
      await supabase.from("spartan_workout_exercises").delete().eq("routine_id", editingRoutine.id);
    } else {
      const { data: routine } = await supabase.from("spartan_workout_routines").insert({ user_id: userId, name: routineName.trim(), muscle_group: muscleTargets.join(" + ") || null, is_active: true }).select("id").single();
      if (routine) routineId = routine.id;
    }

    if (routineId) {
      await supabase.from("spartan_workout_exercises").insert(
        selected.map((s, i) => ({
          routine_id: routineId,
          exercise_library_id: s.exercise.id,
          name: s.exercise.name,
          muscle_group: s.exercise.muscle_group,
          gif_url: s.exercise.gif_url,
          sets: s.config.sets,
          reps: s.config.reps,
          weight_kg: s.config.weight,
          rest_seconds: s.config.rest,
          sort_order: i,
        }))
      );
    }
    setSaving(false);
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-zinc-950 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <h1 className="text-lg font-extrabold text-white flex-1">{editingRoutine ? "Editar rutina" : "Nueva rutina"}</h1>
        <button
          onClick={handleSave}
          disabled={!routineName.trim() || selected.length === 0 || saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-xs font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 shadow-[0_0_20px_rgba(190,11,60,0.3)]"
        >
          <Save className="w-3.5 h-3.5" /> {saving ? "..." : "Guardar"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-4">
        <input type="text" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="Nombre de la rutina" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />

        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Grupos musculares</p>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_GROUPS.map((m) => {
              const active = muscleTargets.includes(m);
              return (
                <button key={m} onClick={() => toggleMuscleTarget(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${active ? "bg-spartan-600 text-white shadow-[0_0_10px_rgba(190,11,60,0.4)]" : "bg-white/5 border border-white/10 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"}`}>
                  {m}
                </button>
              );
            })}
          </div>
          {muscleTargets.length > 0 && (
            <p className="text-[10px] text-spartan-400 mt-1.5 font-medium">Mostrando: {muscleTargets.join(" → ")}</p>
          )}
        </div>

        <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          <button onClick={() => setTab("favorites")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${tab === "favorites" ? "bg-spartan-600 text-white shadow-[0_0_15px_rgba(190,11,60,0.4)]" : "text-zinc-500 hover:text-zinc-300"}`}>
            <Star className="w-3 h-3" /> Mis ejercicios ({favorites.length})
          </button>
          <button onClick={() => setTab("all")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === "all" ? "bg-spartan-600 text-white shadow-[0_0_15px_rgba(190,11,60,0.4)]" : "text-zinc-500 hover:text-zinc-300"}`}>
            Todos
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><div className="w-5 h-5 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <>
            {tab === "favorites" && (
              <div className="space-y-2">
                {(() => {
                  const filteredFavs = muscleTargets.length > 0 ? favorites.filter((f) => muscleTargets.includes(f.exercise.muscle_group)) : favorites;
                  if (filteredFavs.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <Star className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500">{favorites.length === 0 ? "No tienes ejercicios favoritos" : "Sin favoritos en los grupos seleccionados"}</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredFavs.map((fav) => (
                        <div key={fav.exercise.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                          <div className="aspect-square bg-zinc-900 overflow-hidden"><img src={fav.exercise.gif_url} alt={fav.exercise.name} className="w-full h-full object-contain p-3" /></div>
                          <div className="p-2.5 space-y-1.5">
                            <p className="text-[11px] font-bold text-zinc-200 leading-tight line-clamp-2">{fav.exercise.name}</p>
                            <p className="text-[10px] text-zinc-500">{fav.config.default_sets}x{fav.config.default_reps}{fav.config.default_weight_kg ? ` @ ${fav.config.default_weight_kg}kg` : ""}</p>
                            <button onClick={() => addExercise(fav.exercise, fav.config)} disabled={!!selected.find((s) => s.exercise.id === fav.exercise.id)} className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-spartan-600/10 border border-spartan-500/20 text-spartan-400 text-[10px] font-bold hover:bg-spartan-600/20 transition-colors active:scale-[0.97] disabled:opacity-30">
                              <Plus className="w-3 h-3" /> Agregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {tab === "all" && (
              <div className="space-y-2">
                {filteredMuscleGroups.map((muscle) => {
                  const exercises = muscleGrouped[muscle] ?? [];
                  const expanded = expandedMuscles.has(muscle);
                  const visibleExs = exercises.filter((e) => !e.isHidden);
                  const hiddenExs = exercises.filter((e) => e.isHidden);

                  return (
                    <div key={muscle} className="overflow-hidden">
                      <button onClick={() => toggleMuscle(muscle)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-colors ${muscleTargets.includes(muscle) ? "bg-spartan-600/10 border-spartan-500/20 hover:bg-spartan-600/15" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"}`}>
                        <span className={`text-xs font-bold ${muscleTargets.includes(muscle) ? "text-spartan-400" : "text-zinc-300"}`}>{muscle} <span className="text-zinc-600 ml-1.5 text-[10px] font-normal">{visibleExs.length}{hiddenExs.length > 0 ? `+${hiddenExs.length}` : ""}</span></span>
                        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="space-y-1 pt-1 px-1">
                              {visibleExs.map((ex) => (
                                <div key={ex.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                                  <img src={ex.gif_url} alt={ex.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0" />
                                  <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-zinc-200 truncate">{ex.name}</p><p className="text-[9px] text-zinc-600">{ex.equipment}</p></div>
                                  <button onClick={() => addExercise(ex)} disabled={!!selected.find((s) => s.exercise.id === ex.id)} className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-spartan-600/10 border border-spartan-500/20 text-spartan-400 text-[10px] font-bold hover:bg-spartan-600/20 transition-colors active:scale-[0.97] disabled:opacity-30 shrink-0">
                                    <Plus className="w-3 h-3" /> Agregar
                                  </button>
                                </div>
                              ))}
                              {hiddenExs.length > 0 && (
                                <div className="opacity-50">
                                  {hiddenExs.map((ex) => (
                                    <div key={ex.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                                      <img src={ex.gif_url} alt={ex.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0 opacity-50" />
                                      <div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-zinc-500 truncate">{ex.name}</p><p className="text-[9px] text-zinc-700">oculto</p></div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom panel - collapsible */}
      <div className="shrink-0 border-t border-white/[0.06] bg-zinc-950/95 backdrop-blur-sm flex flex-col" style={{ maxHeight: panelCollapsed ? "auto" : "40vh" }}>
        <button onClick={() => setPanelCollapsed(!panelCollapsed)} className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-2">
            {panelCollapsed ? <ListCollapse className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />}
            <p className="text-xs font-bold text-zinc-200">Seleccionados ({selected.length})</p>
          </div>
          {selected.length > 0 && !panelCollapsed && (
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }} disabled={!routineName.trim() || saving} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-[10px] font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] disabled:opacity-40 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
              <Save className="w-3 h-3" /> {saving ? "..." : "Guardar"}
            </button>
          )}
        </button>

        {!panelCollapsed && (
          <div className="overflow-y-auto p-2 space-y-2 flex-1">
            {selected.length === 0 ? (
              <div className="py-8 text-center"><p className="text-xs text-zinc-600">Agrega ejercicios para crear tu rutina</p></div>
            ) : (
              <AnimatePresence>
                {selected.map((s, idx) => {
                  const isExpanded = expandedSelected.has(idx);
                  return (
                    <motion.div key={`${s.exercise.id}-${idx}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2 p-2 cursor-pointer" onClick={() => toggleSelected(idx)}>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); moveExercise(idx, -1); }} disabled={idx === 0} className="w-4 h-4 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-400 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                          <button onClick={(e) => { e.stopPropagation(); moveExercise(idx, 1); }} disabled={idx === selected.length - 1} className="w-4 h-4 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-400 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                        </div>
                        <img src={s.exercise.gif_url} alt={s.exercise.name} className="w-8 h-8 rounded-lg object-cover bg-zinc-800 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-zinc-200 truncate">{s.exercise.name}</p>
                          <p className="text-[9px] text-zinc-500">{s.config.sets}x{s.config.reps}{s.config.weight ? ` @ ${s.config.weight}kg` : ""}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeExercise(idx); }} className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-spartan-500/20 transition-colors shrink-0"><X className="w-3 h-3 text-zinc-500" /></button>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                            <div className="px-2 pb-2 grid grid-cols-2 gap-1.5">
                              {(["sets", "reps", "weight", "rest"] as const).map((field) => (
                                <div key={field} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-1.5">
                                  <p className="text-[8px] text-zinc-600 mb-0.5">{field === "sets" ? "Series" : field === "reps" ? "Reps" : field === "weight" ? "Peso (kg)" : "Descanso (s)"}</p>
                                  <input type="number" min={field === "rest" ? 10 : 1} step={field === "rest" ? 5 : 1} value={s.config[field] ?? ""} onChange={(e) => updateSelectedConfig(idx, field, e.target.value ? parseFloat(e.target.value) : null)} placeholder="--" className="w-full bg-transparent text-xs font-bold text-white text-center focus:outline-none placeholder:text-zinc-600" />
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
