"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ActivityCard } from "@/components/kids/ActivityCard";
import { type KidsActivity } from "@/lib/kids";

export default function FavoritosPage() {
  const [activities, setActivities] = useState<KidsActivity[]>([]);
  const [starsMap, setStarsMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [favs, prog] = await Promise.all([
        supabase.from("kids_favorites").select("activity_id, kids_activities(*)").eq("user_id", user.id),
        supabase.from("kids_progress").select("activity_id, stars").eq("user_id", user.id),
      ]);
      const acts = (favs.data ?? [])
        .map((f: any) => f.kids_activities)
        .filter(Boolean) as KidsActivity[];
      setActivities(acts);
      setStarsMap(new Map((prog.data ?? []).map((p: any) => [p.activity_id, p.stars ?? 0])));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-52 animate-pulse rounded-3xl bg-white/70" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="kids-card flex items-center gap-3 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
          <Star className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
            Mis favoritos
          </h1>
          <p className="text-xs font-semibold text-zinc-500">Las actividades que más te gustan.</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="kids-card p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-rose-300" />
          <p className="mt-3 text-sm font-bold text-zinc-500">Todavía no tienes favoritos.</p>
          <Link href="/kids/app/interactivos" className="mt-4 inline-flex rounded-2xl bg-kids-500 px-5 py-3 text-sm font-black text-white shadow-kids-glow">
            Explorar actividades
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {activities.map((a) => (
            <ActivityCard key={a.id} activity={a} initialFavorite stars={starsMap.get(a.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
