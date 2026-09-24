"use client";

import Link from "next/link";
import InlineRegister from "@/components/InlineRegister";
import { Sparkles, ShieldCheck, Gift, ArrowRight, Palette, Puzzle, BookOpen, Printer } from "lucide-react";

const BENEFITS = [
  { icon: Palette, title: "Colorea sin límites", desc: "Láminas listas para pintar en la pantalla." },
  { icon: Puzzle, title: "Puzzles y retos", desc: "Crucigramas, laberintos y sopas de letras." },
  { icon: BookOpen, title: "Cuentos con voz", desc: "Historias que se leen en voz alta." },
  { icon: Printer, title: "Imprimibles PDF", desc: "Descarga actividades para hacer en papel." },
];

export default function KidsWebGratisPage() {
  return (
    <div className="min-h-screen bg-kids-gradient">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6">
        <Link href="/kids" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 text-white shadow-kids-glow">
            <Palette className="h-5 w-5" />
          </div>
          <span className="text-base font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>Kids Club</span>
        </Link>
        <Link href="/kids/web" className="text-sm font-black text-kids-600">Ver planes</Link>
      </header>

      <main className="mx-auto max-w-xl px-5 pb-16 pt-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-700">
          <Gift className="h-3.5 w-3.5" /> Acceso de prueba gratis
        </div>
        <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-900" style={{ fontFamily: "var(--font-quicksand)" }}>
          Empieza a jugar hoy mismo
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-semibold text-zinc-600">
          Crea tu cuenta y entra a la biblioteca creativa para niños. Sin tarjeta de crédito.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="kids-card flex items-start gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kids-100 text-kids-600">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-800">{b.title}</p>
                <p className="text-[11px] text-zinc-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="kids-card mt-8 p-5">
          <p className="mb-3 flex items-center justify-center gap-2 text-sm font-black text-zinc-700">
            <Sparkles className="h-4 w-4 text-violet-500" /> Crea tu cuenta gratis
          </p>
          <InlineRegister appSlug="kids" redirectTo="/kids/app" buttonText="Empezar gratis" placeholder="tu@correo.com" />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Espacio seguro, sin anuncios para niños
          </p>
        </div>

        <Link href="/kids/web" className="mt-6 inline-flex items-center gap-2 text-sm font-black text-kids-600">
          Conoce los planes <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}
