import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowRight, Printer, Sparkles, Palette, Puzzle, Download, Star, Wand2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ActivityCard } from "@/components/kids/ActivityCard";
import { categoryMeta, type KidsActivity, type KidsCategory } from "@/lib/kids";

export const dynamic = "force-dynamic";

export default async function KidsHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [catsRes, actsRes, favsRes, progRes, profRes, printRes] = await Promise.all([
    supabase.from("kids_categories").select("*").eq("is_active", true).in("slug", ["colorear", "crucigrama", "laberinto", "sopa_letras", "unir_puntos", "cuento"]).order("sort_order", { ascending: true }),
    supabase.from("kids_activities").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(24),
    supabase.from("kids_favorites").select("activity_id").eq("user_id", user.id),
    supabase.from("kids_progress").select("activity_id, stars, status").eq("user_id", user.id),
    supabase.from("kids_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase.from("kids_printables").select("id, title, cover_url, category_slug").eq("is_published", true).order("sort_order", { ascending: true }).limit(4),
  ]);

  const categories = (catsRes.data ?? []) as KidsCategory[];
  const activities = (actsRes.data ?? []) as KidsActivity[];
  const profiles = profRes.data ?? [];
  const printables = printRes.data ?? [];

  const favSet = new Set((favsRes.data ?? []).map((f: any) => f.activity_id));
  const starsMap = new Map<string, number>((progRes.data ?? []).map((p: any) => [p.activity_id, p.stars ?? 0]));
  const inProgressIds = new Set(
    (progRes.data ?? []).filter((p: any) => p.status === "in_progress").map((p: any) => p.activity_id),
  );

  const continuePlaying = activities.filter((a) => inProgressIds.has(a.id)).slice(0, 8);
  const recommended = activities.filter((a) => !inProgressIds.has(a.id)).slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Saludo + perfiles */}
      <section className="kids-card relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-5">
        <Star className="pointer-events-none absolute -right-1 -top-4 h-14 w-14 text-amber-200/80 animate-float-slow" />
        <Wand2 className="pointer-events-none absolute -left-1 bottom-1 h-8 w-8 text-violet-200 animate-sparkle" />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-violet-500">¡Hola de nuevo!</p>
          <h1 className="mt-1 text-2xl font-black text-magic sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            ¿Qué quieres hacer hoy?
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {profiles.slice(0, 5).map((p: any) => (
            <div
              key={p.id}
              title={p.name}
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-2xl font-black text-zinc-600 shadow-sm ring-2 ring-white"
              style={{ backgroundColor: p.color || "#FFEDD5" }}
            >
              {p.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                (p.name || "?").charAt(0).toUpperCase()
              )}
            </div>
          ))}
          <Link
            href="/kids/app/perfil"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-kids-100 text-kids-600 ring-2 ring-white transition-transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Accesos directos por sección */}
      <section className="grid grid-cols-3 gap-3">
        <Link href="/kids/app/interactivos" className="kids-card group relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center transition-transform hover:-translate-y-1">
          <Star className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 text-violet-100" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white shadow-md"><Palette className="h-6 w-6" /></span>
          <span className="text-sm font-black text-zinc-800">Interactivos</span>
          <span className="text-[10px] leading-tight text-zinc-500">Colorear y cuentos</span>
        </Link>
        <Link href="/kids/app/juegos" className="kids-card group relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center transition-transform hover:-translate-y-1">
          <Star className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 text-emerald-100" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md"><Puzzle className="h-6 w-6" /></span>
          <span className="text-sm font-black text-zinc-800">Juegos</span>
          <span className="text-[10px] leading-tight text-zinc-500">Puzzles y retos</span>
        </Link>
        <Link href="/kids/app/imprimibles" className="kids-card group relative flex flex-col items-center gap-2 overflow-hidden p-4 text-center transition-transform hover:-translate-y-1">
          <Star className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 text-sky-100" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-md"><Download className="h-6 w-6" /></span>
          <span className="text-sm font-black text-zinc-800">Imprimibles</span>
          <span className="text-[10px] leading-tight text-zinc-500">Ebooks en PDF</span>
        </Link>
      </section>

      {/* Categorías */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Elige una actividad
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => {
            const meta = categoryMeta(c.slug);
            return (
              <Link
                key={c.id}
                href={meta.path}
                className="kids-card flex flex-col items-center gap-2 p-3 text-center transition-transform hover:-translate-y-1 active:scale-95"
              >
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-50">
                  {c.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black" style={{ color: meta.color }}>
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-black leading-tight text-zinc-700">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Imprimibles */}
      {printables.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
              <Sparkles className="h-5 w-5 text-violet-500" /> Para imprimir
            </h2>
            <Link href="/kids/app/imprimibles" className="flex items-center gap-1 text-sm font-black text-kids-600">
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {printables.map((p: any) => {
              const meta = categoryMeta(p.category_slug);
              return (
                <Link key={p.id} href={`/kids/app/imprimibles/${p.id}`} className="kids-card overflow-hidden transition-transform hover:-translate-y-1">
                  <div className="flex h-24 items-center justify-center overflow-hidden bg-zinc-50">
                    {p.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <Printer className="h-8 w-8 text-zinc-300" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[9px] font-black uppercase" style={{ color: meta.color }}>{meta.name}</p>
                    <p className="line-clamp-1 text-xs font-black text-zinc-800">{p.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Seguir jugando */}
      {continuePlaying.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Seguir jugando
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {continuePlaying.map((a) => (
              <div key={a.id} className="w-40 shrink-0">
                <ActivityCard activity={a} initialFavorite={favSet.has(a.id)} stars={starsMap.get(a.id) ?? 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recomendados */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
            <Sparkles className="h-5 w-5 text-pink-500" /> Para ti
          </h2>
          <Link href="/kids/app/interactivos" className="flex items-center gap-1 text-sm font-black text-kids-600">
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {recommended.length === 0 ? (
          <div className="kids-card p-8 text-center">
            <p className="text-sm font-bold text-zinc-500">Todavía no hay actividades.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.map((a) => (
              <ActivityCard key={a.id} activity={a} initialFavorite={favSet.has(a.id)} stars={starsMap.get(a.id) ?? 0} />
            ))}
          </div>
        )}
      </section>

      {/* CTA imprimibles */}
      <section>
        <Link
          href="/kids/app/imprimibles"
          className="relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 p-6 shadow-lg transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white">
            <Printer className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-black text-white" style={{ fontFamily: "var(--font-quicksand)" }}>
              Imprimibles en PDF
            </p>
            <p className="text-sm text-white/85">Descarga actividades listas para imprimir en casa.</p>
          </div>
          <ArrowRight className="h-6 w-6 text-white" />
        </Link>
      </section>
    </div>
  );
}
