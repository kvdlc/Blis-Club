import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { categoryMeta, type KidsCategory } from "@/lib/kids";
import { Sparkles, Palette, Puzzle, BookOpen, Star, ShieldCheck, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kids Club · Biblioteca creativa para niños",
  description:
    "Láminas para colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos. Un mundo de juegos para crear y aprender.",
};

export default async function KidsLandingPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("kids_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const cats = (categories ?? []) as KidsCategory[];

  return (
    <div className="min-h-screen bg-kids-gradient overflow-hidden">
      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 flex items-center justify-center text-white shadow-kids-glow">
            <Palette className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-widest text-kids-600">Blis Club</p>
            <p className="text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
              Kids Club
            </p>
          </div>
        </div>
        <Link
          href="/kids/app"
          className="rounded-full bg-kids-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-kids-glow transition-transform hover:scale-105 active:scale-95"
        >
          Entrar a jugar
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-kids-700 shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Contenido nuevo cada semana
        </div>

        <h1
          className="mt-6 text-4xl sm:text-6xl font-black leading-[1.05] text-zinc-900"
          style={{ fontFamily: "var(--font-quicksand)" }}
        >
          Un mundo de juegos
          <br />
          <span className="bg-gradient-to-r from-kids-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
            para colorear y aprender
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg text-zinc-600">
          Láminas para colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos.
          Todo en un lugar seguro, colorido y pensado para los más pequeños.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/kids/app"
            className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-7 py-4 text-base font-black text-white shadow-kids-glow transition-transform hover:scale-105 active:scale-95"
          >
            Empezar a jugar <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/kids/web"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-kids-700 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Ver planes
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 6 tipos de actividades</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Espacio seguro para niños</span>
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> Imprimibles en PDF</span>
        </div>

        {/* Portadas de categorías */}
        {cats.length > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {cats.map((c) => (
              <div key={c.id} className="kids-card overflow-hidden">
                <div className="aspect-square bg-zinc-50">
                  {c.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black" style={{ color: categoryMeta(c.slug).color }}>
                      {c.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categorías */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-12">
        <h2 className="text-center text-2xl sm:text-3xl font-black text-zinc-900" style={{ fontFamily: "var(--font-quicksand)" }}>
          ¿Qué quieres hacer hoy?
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c) => {
            const meta = categoryMeta(c.slug);
            return (
              <Link
                key={c.id}
                href={meta.path}
                className="kids-card flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-1"
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
                <p className="text-sm font-black text-zinc-800">{c.name}</p>
                <p className="text-[11px] leading-tight text-zinc-500">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Palette, title: "Elige y juega", text: "Entra a cualquier actividad y juega directo en la pantalla o descárgala para imprimir." },
            { icon: Sparkles, title: "Contenido nuevo", text: "Cada semana sumamos láminas, puzzles y cuentos nuevos para toda la familia." },
            { icon: BookOpen, title: "Aprende jugando", text: "Cuentos con lectura en voz alta y actividades que enseñan palabras y números." },
          ].map((f) => (
            <div key={f.title} className="kids-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kids-100 text-kids-600">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-zinc-800">{f.title}</h3>
              <p className="mt-1.5 text-sm text-zinc-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-kids-500 via-orange-500 to-pink-500 p-8 text-center shadow-xl sm:p-12">
          <Puzzle className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-white/20" />
          <Star className="pointer-events-none absolute -bottom-6 -left-4 h-28 w-28 text-white/20" />
          <h2 className="text-2xl font-black text-white sm:text-4xl" style={{ fontFamily: "var(--font-quicksand)" }}>
            ¡Vamos a crear y jugar!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/90 sm:text-base">
            Miles de formas de entretener a los niños mientras aprenden. Empieza gratis hoy.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/kids/app"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-kids-700 shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Entrar a jugar <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/kids/webg"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/70 px-7 py-4 text-base font-black text-white transition-transform hover:scale-105 active:scale-95"
            >
              Prueba gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-orange-100 bg-white/60 py-8 text-center text-xs text-zinc-500">
        <p className="font-bold text-zinc-700">Blis Club · Kids Club</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/legal/terminos" className="hover:text-kids-600">Términos</Link>
          <Link href="/legal/privacidad" className="hover:text-kids-600">Privacidad</Link>
          <Link href="/legal/reembolsos" className="hover:text-kids-600">Reembolsos</Link>
        </div>
      </footer>
    </div>
  );
}
