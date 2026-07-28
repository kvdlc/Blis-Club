"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

interface ExerciseLibraryProps {
  onSelectMuscle: (muscle: string) => void;
}

interface MusclePreview {
  muscle: string;
  gif_url: string | null;
  count: number;
}

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

      // Get all exercises to dynamically determine muscle groups
      const { data: allEx } = await supabase
        .from("spartan_exercise_library")
        .select("muscle_group, gif_url")
        .eq("is_active", true);

      if (!allEx || allEx.length === 0) {
        setLoading(false);
        return;
      }

      // Group by muscle
      const map = new Map<string, { gif: string | null; count: number }>();
      for (const ex of allEx) {
        const entry = map.get(ex.muscle_group);
        if (entry) {
          entry.count++;
        } else {
          map.set(ex.muscle_group, { gif: ex.gif_url || null, count: 1 });
        }
      }

      const results: MusclePreview[] = Array.from(map.entries())
        .map(([muscle, data]) => ({ muscle, gif_url: data.gif, count: data.count }))
        .sort((a, b) => b.count - a.count);

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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/[0.03] rounded-2xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (previews.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-bold text-zinc-200 mb-3">Biblioteca</h2>
        <div className="flex flex-col items-center justify-center py-10 text-center bg-white/[0.03] rounded-2xl border border-white/[0.06]">
          <Dumbbell className="w-8 h-8 text-zinc-700 mb-2" />
          <p className="text-sm text-zinc-500">No hay ejercicios disponibles</p>
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
            className="group aspect-square bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all text-left relative"
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
              <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{p.count} ejerc.</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </section>
  );
}
