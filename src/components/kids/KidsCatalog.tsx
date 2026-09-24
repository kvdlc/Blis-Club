"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { ActivityCard } from "@/components/kids/ActivityCard";
import { categoryMeta, type KidsActivity, type KidsCategory, type KidsCategorySlug } from "@/lib/kids";
import { activitySection, type KidsSection } from "@/lib/kids/sections";

export function KidsCatalog({
  categories,
  title,
  subtitle,
  icon,
  sections,
}: {
  categories: KidsCategorySlug[];
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  sections?: KidsSection[];
}) {
  const searchParams = useSearchParams();
  const initial = searchParams.get("categoria") || "todas";
  const [cat, setCat] = useState(initial);
  const [activities, setActivities] = useState<KidsActivity[]>([]);
  const [cats, setCats] = useState<KidsCategory[]>([]);
  const [favSet, setFavSet] = useState<Set<string>>(new Set());
  const [starsMap, setStarsMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const [acts, c, favs, prog] = await Promise.all([
        supabase.from("kids_activities").select("*").eq("is_published", true).in("category_slug", categories).order("created_at", { ascending: false }),
        supabase.from("kids_categories").select("*").eq("is_active", true).in("slug", categories).order("sort_order", { ascending: true }),
        user ? supabase.from("kids_favorites").select("activity_id").eq("user_id", user.id) : Promise.resolve({ data: [] }),
        user ? supabase.from("kids_progress").select("activity_id, stars").eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);
      setActivities((acts.data ?? []) as KidsActivity[]);
      setCats((c.data ?? []) as KidsCategory[]);
      setFavSet(new Set((favs.data ?? []).map((f: any) => f.activity_id)));
      setStarsMap(new Map((prog.data ?? []).map((p: any) => [p.activity_id, p.stars ?? 0])));
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chips = useMemo(
    () => [{ id: "todas", slug: "todas", name: "Todas", color: "#F97316", cover_url: null as string | null }, ...cats],
    [cats],
  );

  const visible = useMemo(
    () => (sections ? activities.filter((a) => sections.includes(activitySection(a))) : activities),
    [activities, sections],
  );

  const filtered = useMemo(
    () => visible.filter((a) => cat === "todas" || a.category_slug === cat),
    [visible, cat],
  );

  return (
    <div className="space-y-4">
      <div className="kids-card relative flex items-center gap-4 overflow-hidden p-5">
        <Star className="pointer-events-none absolute -right-2 -top-3 h-16 w-16 text-amber-200 animate-float-slow" />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white shadow-md">
          {icon ?? <span className="text-xl font-black">K</span>}
        </div>
        <div>
          <h1 className="text-xl font-black text-magic" style={{ fontFamily: "var(--font-quicksand)" }}>
            {title}
          </h1>
          <p className="text-xs font-semibold text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {chips.map((c) => {
          const active = cat === c.slug;
          return (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              style={active ? { backgroundColor: c.color || "#F97316" } : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-black transition-all ${
                active ? "text-white shadow-md" : "bg-white text-zinc-600 shadow-sm"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/70">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-zinc-500">{c.name.charAt(0)}</span>
                )}
              </span>
              {c.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl bg-white/70" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="kids-card p-10 text-center text-sm font-bold text-zinc-500">No hay elementos en esta categoría.</div>
      ) : cat === "todas" ? (
        <div className="space-y-7">
          {cats.map((c) => {
            const meta = categoryMeta(c.slug);
            const items = visible.filter((a) => a.category_slug === c.slug);
            if (!items.length) return null;
            return (
              <section key={c.id}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
                  {c.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_url} alt="" className="h-7 w-7 rounded-lg object-cover" />
                  )}
                  {meta.name}
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((a) => (
                    <ActivityCard key={a.id} activity={a} initialFavorite={favSet.has(a.id)} stars={starsMap.get(a.id) ?? 0} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => (
            <ActivityCard key={a.id} activity={a} initialFavorite={favSet.has(a.id)} stars={starsMap.get(a.id) ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
