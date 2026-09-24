"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Star, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { categoryMeta, DIFFICULTY_LABEL, type KidsActivity } from "@/lib/kids";
import { ActivityCover } from "./ActivityCover";

const GRADIENTS: Record<string, string> = {
  colorear: "from-red-300 to-rose-400",
  crucigrama: "from-blue-300 to-indigo-400",
  laberinto: "from-emerald-300 to-teal-400",
  sopa_letras: "from-violet-300 to-purple-400",
  unir_puntos: "from-amber-300 to-orange-400",
  cuento: "from-pink-300 to-fuchsia-400",
};

export function ActivityCard({
  activity,
  initialFavorite = false,
  stars = 0,
}: {
  activity: KidsActivity;
  initialFavorite?: boolean;
  stars?: number;
}) {
  const meta = categoryMeta(activity.category_slug);
  const [fav, setFav] = useState(initialFavorite);
  const [busy, setBusy] = useState(false);

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    if (fav) {
      setFav(false);
      await supabase.from("kids_favorites").delete().eq("user_id", user.id).eq("activity_id", activity.id);
    } else {
      setFav(true);
      await supabase.from("kids_favorites").insert({ user_id: user.id, activity_id: activity.id });
    }
    setBusy(false);
  };

  return (
    <Link
      href={`/kids/app/actividad/${activity.id}`}
      className="kids-card group relative flex flex-col overflow-hidden transition-transform hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Cover */}
      <div className="relative h-32 overflow-hidden">
        <ActivityCover activity={activity} />
        <button
          onClick={toggleFav}
          aria-label="Favorito"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 backdrop-blur transition-transform active:scale-90"
        >
          <Heart className={`h-5 w-5 ${fav ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`} />
        </button>
        {activity.is_ai_generated && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black text-violet-600 backdrop-blur">
            <Sparkles className="h-3 w-3" /> IA
          </span>
        )}
        {Array.isArray(activity.data?.pages) && activity.data.pages.length > 1 && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black text-kids-700 backdrop-blur">
            <BookOpen className="h-3 w-3" /> {activity.data.pages.length} páginas
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: meta.color }}>
          {meta.name}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-black text-zinc-800">{activity.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] font-bold text-zinc-400">
            {activity.age_min}–{activity.age_max} años · {DIFFICULTY_LABEL[activity.difficulty]}
          </span>
          {stars > 0 && (
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < stars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`}
                />
              ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
