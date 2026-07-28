"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Dumbbell, Star } from "lucide-react";

interface ExerciseLibraryProps {
  onSelectMuscle: (muscle: string) => void;
}

interface MusclePreview {
  muscle: string;
  gif_url: string | null;
  count: number;
  favCount: number;
}

const ALL_MUSCLE_GROUPS = [
  "Pecho", "Espalda", "Hombros", "Biceps", "Triceps",
  "Piernas", "Abdomen", "Antebrazo", "Trapecio",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export default function ExerciseLibrary({ onSelectMuscle }: ExerciseLibraryProps) {
  const [previews, setPreviews] = useState<MusclePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreviews = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch all exercises
      const { data: allEx } = await supabase
        .from("spartan_exercise_library")
        .select("muscle_group, gif_url")
        .eq("is_active", true);

      // Fetch user favorites
      let favByMuscle: Map<string, number> = new Map();
      if (user) {
        const { data: favs } = await supabase
          .from("spartan_exercise_favorites")
          .select("exercise_id, spartan_exercise_library!inner(muscle_group)")
          .eq("user_id", user.id);

        if (favs) {
          for (const f of favs) {
            const mg = (f as any).spartan_exercise_library?.muscle_group;
            if (mg) {
              const key = mg.charAt(0).toUpperCase() + mg.slice(1).toLowerCase();
              favByMuscle.set(key, (favByMuscle.get(key) || 0) + 1);
            }
          }
        }
      }

      // Build muscle group map
      const map = new Map<string, { gif: string | null; count: number }>();
      for (const muscle of ALL_MUSCLE_GROUPS) {
        map.set(muscle, { gif: null, count: 0 });
      }

      if (allEx) {
        for (const ex of allEx) {
          const key = ex.muscle_group.charAt(0).toUpperCase() + ex.muscle_group.slice(1).toLowerCase();
          const entry = map.get(key);
          if (entry) {
            entry.count++;
            if (!entry.gif) entry.gif = ex.gif_url || null;
          }
        }
      }

      const results = Array.from(map.entries())
        .map(([muscle, data]) => ({
          muscle,
          gif_url: data.gif,
          count: data.count,
          favCount: favByMuscle.get(muscle) || 0,
        }));

      setPreviews(results);
      setLoading(false);
    };
    loadPreviews();
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-sm font-bold text-zinc-200 mb-3">Biblioteca</h2>
        <div className="grid grid-cols-2 gap-3">
          {ALL_MUSCLE_GROUPS.map((m) => (
            <div key={m} className="aspect-square bg-white/[0.03] rounded-2xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-bold text-zinc-200 mb-3">Biblioteca</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {previews.map((p) => (
          <motion.button
            key={p.muscle}
            variants={cardVariants}
            onClick={() => onSelectMuscle(p.muscle)}
            whileTap={{ scale: 0.97 }}
            className="group aspect-square bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-spartan-500/30 hover:shadow-[0_0_20px_rgba(190,11,60,0.1)] transition-all text-left relative"
          >
            <div className="absolute inset-0 bg-zinc-900">
              {p.gif_url ? (
                <img
                  src={p.gif_url}
                  alt={p.muscle}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-110 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-zinc-700" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-extrabold text-white uppercase tracking-wide">{p.muscle}</p>
              <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                {p.count} ejerc.
                {p.favCount > 0 && (
                  <span className="text-amber-400 ml-1">· ⭐ {p.favCount}</span>
                )}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
