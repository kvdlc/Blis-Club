"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Minus, Plus, Dumbbell, Clock, Save } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  gif_url: string;
  instructions: string | null;
}

interface ExerciseConfig {
  default_sets: number;
  default_reps: number;
  default_weight_kg: number | null;
  default_rest_seconds: number;
  machine_name: string | null;
  notes: string | null;
}

interface Props {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onFavoriteToggle?: (exerciseId: string, isFav: boolean) => void;
}

const difficultyColor: Record<string, string> = {
  principiante: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermedio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  avanzado: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ExerciseDetailModal({ exercise, isOpen, onClose, userId, onFavoriteToggle }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [config, setConfig] = useState<ExerciseConfig>({
    default_sets: 3,
    default_reps: 10,
    default_weight_kg: null,
    default_rest_seconds: 60,
    machine_name: null,
    notes: null,
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !exercise) return;
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [favRes, configRes] = await Promise.all([
        supabase.from("spartan_exercise_favorites").select("exercise_id").eq("user_id", user.id).eq("exercise_id", exercise.id).maybeSingle(),
        supabase.from("spartan_exercise_configs").select("*").eq("user_id", user.id).eq("exercise_id", exercise.id).maybeSingle(),
      ]);

      setIsFav(!!favRes.data);
      if (configRes.data) {
        setConfig({
          default_sets: configRes.data.default_sets ?? 3,
          default_reps: configRes.data.default_reps ?? 10,
          default_weight_kg: configRes.data.default_weight_kg,
          default_rest_seconds: configRes.data.default_rest_seconds ?? 60,
          machine_name: configRes.data.machine_name,
          notes: configRes.data.notes,
        });
      }
      setLoaded(true);
    };
    load();
  }, [isOpen, exercise]);

  const toggleFavorite = async () => {
    const supabase = createClient();
    const newFav = !isFav;
    setIsFav(newFav);
    if (newFav) {
      await supabase.from("spartan_exercise_favorites").upsert({ user_id: userId, exercise_id: exercise.id });
    } else {
      await supabase.from("spartan_exercise_favorites").delete().eq("user_id", userId).eq("exercise_id", exercise.id);
    }
    onFavoriteToggle?.(exercise.id, newFav);
  };

  const saveConfig = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("spartan_exercise_configs").upsert({
      user_id: userId,
      exercise_id: exercise.id,
      ...config,
    });
    setSaving(false);
  };

  const stepValue = (field: "default_sets" | "default_reps", delta: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(1, (prev[field] || 0) + delta),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-end md:items-center md:justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-3xl bg-zinc-900/95 backdrop-blur-xl border-l md:border border-white/[0.06] overflow-y-auto shadow-2xl shadow-red-600/10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{exercise.muscle_group}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* GIF */}
            <div className="aspect-square bg-zinc-950 relative overflow-hidden border-b border-white/[0.04]">
              <img src={exercise.gif_url} alt={exercise.name} className="w-full h-full object-contain p-4" />
              {/* Favorite button overlaid */}
              <button onClick={toggleFavorite} className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center active:scale-90 transition-transform">
                <motion.div animate={{ scale: isFav ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                  <Star className={`w-5 h-5 ${isFav ? "text-amber-400 fill-amber-400" : "text-zinc-400"}`} />
                </motion.div>
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Name + badges */}
              <div>
                <h1 className="text-xl font-extrabold text-white">{exercise.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${difficultyColor[exercise.difficulty] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                    {exercise.equipment}
                  </span>
                </div>
              </div>

              {/* Config section */}
              {loaded && (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tu configuración</p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Sets */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                      <p className="text-[10px] font-medium text-zinc-500 mb-2">Series</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => stepValue("default_sets", -1)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Minus className="w-3 h-3 text-zinc-400" />
                        </button>
                        <span className="text-xl font-extrabold text-white">{config.default_sets}</span>
                        <button onClick={() => stepValue("default_sets", 1)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Plus className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Reps */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                      <p className="text-[10px] font-medium text-zinc-500 mb-2">Repeticiones</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => stepValue("default_reps", -1)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Minus className="w-3 h-3 text-zinc-400" />
                        </button>
                        <span className="text-xl font-extrabold text-white">{config.default_reps}</span>
                        <button onClick={() => stepValue("default_reps", 1)} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Plus className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                      <p className="text-[10px] font-medium text-zinc-500 mb-2">Peso (kg)</p>
                      <input
                        type="number"
                        value={config.default_weight_kg ?? ""}
                        onChange={(e) => setConfig({ ...config, default_weight_kg: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-full bg-transparent text-xl font-extrabold text-white text-center focus:outline-none placeholder:text-zinc-600"
                        placeholder="--"
                      />
                    </div>

                    {/* Rest */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
                      <p className="text-[10px] font-medium text-zinc-500 mb-2">Descanso (s)</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => setConfig({ ...config, default_rest_seconds: Math.max(10, config.default_rest_seconds - 15) })} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Minus className="w-3 h-3 text-zinc-400" />
                        </button>
                        <span className="text-lg font-extrabold text-white">{config.default_rest_seconds}</span>
                        <button onClick={() => setConfig({ ...config, default_rest_seconds: config.default_rest_seconds + 15 })} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <Plus className="w-3 h-3 text-zinc-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Machine name */}
                  <div>
                    <p className="text-[10px] font-medium text-zinc-500 mb-1">Nombre de la máquina</p>
                    <input
                      type="text"
                      value={config.machine_name ?? ""}
                      onChange={(e) => setConfig({ ...config, machine_name: e.target.value || null })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50"
                      placeholder="Ej: Prensa inclinada Life Fitness"
                    />
                  </div>

                  {/* Save config */}
                  <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold hover:from-red-500 hover:to-red-600 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(220,38,38,0.3)]"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Guardando..." : "Guardar configuración"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
