"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Search, X, Star, Dumbbell, ArrowLeft } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  gif_url: string;
  isFav?: boolean;
}

interface Props {
  muscleGroup: string;
  onBack: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export default function MuscleGroupView({ muscleGroup, onBack, onSelectExercise }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [exRes, favRes] = await Promise.all([
        supabase.from("spartan_exercise_library").select("*").eq("is_active", true).eq("muscle_group", muscleGroup).order("name"),
        supabase.from("spartan_exercise_favorites").select("exercise_id").eq("user_id", user.id),
      ]);

      const favSet = new Set<string>((favRes.data ?? []).map((f: any) => f.exercise_id));
      setExercises(((exRes.data ?? []) as any[]).map((e) => ({ ...e, isFav: favSet.has(e.id) })));
      setFavorites(favSet);
      setLoading(false);
    };
    load();
  }, [muscleGroup]);

  const toggleFavorite = async (exerciseId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newFav = !favorites.has(exerciseId);
    setFavorites((prev) => {
      const next = new Set(prev);
      newFav ? next.add(exerciseId) : next.delete(exerciseId);
      return next;
    });
    setExercises((prev) => prev.map((e) => (e.id === exerciseId ? { ...e, isFav: newFav } : e)));

    if (newFav) {
      await supabase.from("spartan_exercise_favorites").upsert({ user_id: user.id, exercise_id: exerciseId });
    } else {
      await supabase.from("spartan_exercise_favorites").delete().eq("user_id", user.id).eq("exercise_id", exerciseId);
    }
  };

  const { favoritesList, othersList } = useMemo(() => {
    const favs = exercises.filter((e) => e.isFav);
    const others = exercises.filter((e) => !e.isFav);

    if (showFavoritesOnly) {
      if (search.trim()) {
        const q = search.toLowerCase();
        return { favoritesList: favs.filter((e) => e.name.toLowerCase().includes(q)), othersList: [] };
      }
      return { favoritesList: favs, othersList: [] };
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return {
        favoritesList: favs.filter((e) => e.name.toLowerCase().includes(q)),
        othersList: others.filter((e) => e.name.toLowerCase().includes(q)),
      };
    }

    return { favoritesList: favs, othersList: others };
  }, [exercises, showFavoritesOnly, search]);

  const favCount = exercises.filter((e) => e.isFav).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-white">{muscleGroup}</h1>
          <p className="text-xs text-zinc-500">{exercises.length} ejercicios{favCount > 0 ? ` · ⭐ ${favCount} tuyos` : ""}</p>
        </div>
      </div>

      {/* Toggle favorites */}
      <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
        <button onClick={() => setShowFavoritesOnly(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!showFavoritesOnly ? "bg-spartan-600 text-white shadow-[0_0_15px_rgba(190,11,60,0.4)]" : "text-zinc-500 hover:text-zinc-300"}`}>
          Todos
        </button>
        <button onClick={() => setShowFavoritesOnly(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${showFavoritesOnly ? "bg-spartan-600 text-white shadow-[0_0_15px_rgba(190,11,60,0.4)]" : "text-zinc-500 hover:text-zinc-300"}`}>
          <Star className="w-3 h-3" /> Mis ejercicios ({favCount})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ejercicio..." className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-spartan-500/50" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-zinc-500" /></button>}
      </div>

      {/* Grid: favorites first, then others */}
      <div className="grid grid-cols-2 gap-2">
        {!showFavoritesOnly && favoritesList.length > 0 && (
          <div className="col-span-2 flex items-center gap-1.5 mt-1 mb-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Mis ejercicios</span>
            <span className="flex-1 h-px bg-amber-500/20" />
          </div>
        )}

        {[...favoritesList, ...othersList].map((ex, i) => (
          <motion.button
            key={ex.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 20) * 0.02 }}
            onClick={() => onSelectExercise(ex)}
            className={`group relative bg-white/[0.03] border rounded-2xl overflow-hidden hover:border-spartan-500/30 hover:shadow-[0_0_20px_rgba(190,11,60,0.1)] transition-all active:scale-[0.98] text-left ${ex.isFav ? "border-amber-500/20" : "border-white/[0.06]"}`}
          >
            {ex.isFav && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 z-10" />
            )}
            <div className="aspect-square bg-zinc-900 relative overflow-hidden">
              <img src={ex.gif_url} alt={ex.name} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Star className={`w-3.5 h-3.5 ${ex.isFav ? "text-amber-400 fill-amber-400" : "text-zinc-500"}`} />
              </button>
            </div>
            <div className="p-2.5">
              <p className="text-[11px] font-bold text-zinc-200 leading-tight line-clamp-2">{ex.name}</p>
              <div className="flex items-center gap-1 mt-1">
                {ex.isFav && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />}
                <span className="text-[8px] font-medium text-zinc-600">{ex.equipment}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {favoritesList.length === 0 && othersList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dumbbell className="w-10 h-10 text-zinc-700 mb-2" />
          <p className="text-sm font-medium text-zinc-500">Sin resultados</p>
        </div>
      )}
    </div>
  );
}
