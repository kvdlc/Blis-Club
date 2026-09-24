"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles, ArrowRight, Star, ShieldCheck, Heart, Palette } from "lucide-react";
import InlineRegister from "@/components/InlineRegister";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  original_price_cents: number | null;
  billing_interval: string;
  features: string[];
  badge: string | null;
  description: string | null;
  cta_text: string | null;
}

const FAQS = [
  { q: "¿Cómo empiezo?", a: "Crea tu cuenta gratis y entra directo a jugar. Tienes acceso de prueba sin tarjeta." },
  { q: "¿Sirve para varias edades?", a: "Sí. El contenido está separado por edades, desde 3 hasta 10 años." },
  { q: "¿Necesito imprimir?", a: "No. Las actividades se juegan en la pantalla, y también puedes descargar imprimibles en PDF." },
  { q: "¿Puedo cancelar?", a: "Cuando quieras, desde tu perfil. Sin complicaciones." },
];

export function KidsWebLandingClient({
  plans,
  categories,
}: {
  plans: Plan[];
  categories: { id: string; slug: string; name: string; cover_url: string | null; color: string | null }[];
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const plan = plans.find((p) => p.billing_interval === "quarter") || plans[0];
  const formatPrice = (c: number) => { const d = c / 100; return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`; };

  return (
    <div className="min-h-screen bg-kids-gradient">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 text-white shadow-kids-glow">
              <Palette className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-widest text-kids-600">Blis Club</p>
              <p className="text-base font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>Kids Club</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/kids/app" className="hidden text-sm font-black text-kids-600 sm:block">Entrar</Link>
            <Link href="#precio" className="rounded-full bg-kids-500 px-4 py-2 text-sm font-black text-white shadow-kids-glow">Comenzar</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pb-10 pt-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-kids-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Contenido nuevo cada semana
        </div>
        <h1 className="mt-5 text-4xl font-black leading-tight text-zinc-900 sm:text-6xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Aprender jugando nunca fue
          <span className="block bg-gradient-to-r from-kids-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">tan divertido</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-zinc-600 sm:text-lg">
          La biblioteca creativa para niños: colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos, más un generador de dibujos con IA.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="#precio" className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-7 py-4 text-base font-black text-white shadow-kids-glow transition-transform hover:scale-105">
            Ver precios <ArrowRight className="h-5 w-5" />
          </a>
          <Link href="/kids/webg" className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-black text-kids-700 shadow-md transition-transform hover:scale-105">
            Probar gratis
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 6 actividades</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Espacio seguro</span>
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> Miles de familias</span>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <div key={c.id} className="kids-card flex flex-col items-center gap-2 p-3 text-center">
              <div className="h-14 w-14 overflow-hidden rounded-2xl bg-zinc-50">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.cover_url} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black" style={{ color: c.color || "#F97316" }}>
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-black text-zinc-700">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Precio */}
      <section id="precio" className="mx-auto max-w-md px-5 py-10">
        <h2 className="mb-6 text-center text-2xl font-black text-zinc-900 sm:text-3xl" style={{ fontFamily: "var(--font-quicksand)" }}>
          Un precio simple
        </h2>
        {plan ? (
          <div className="kids-card overflow-hidden">
            <div className="bg-gradient-to-r from-kids-500 to-pink-500 px-6 py-3 text-center">
              <p className="text-sm font-black text-white">{plan.badge || "Oferta especial"}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-black text-zinc-700">{plan.name}</p>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-zinc-900">{formatPrice(plan.price_cents)}</span>
                <span className="text-zinc-400">/{plan.billing_interval === "quarter" ? "trimestre" : "periodo"}</span>
              </div>
              {plan.original_price_cents && plan.original_price_cents > plan.price_cents && (
                <p className="mt-1 text-xs text-zinc-400">Antes {formatPrice(plan.original_price_cents)}</p>
              )}
              <ul className="mt-5 space-y-2 text-left">
                {(plan.features?.length ? plan.features : ["Toda la biblioteca", "Crea con IA", "Sin anuncios"]).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-semibold text-zinc-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/kids/web/checkout?plan=${plan.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-kids-500 py-4 text-base font-black text-white shadow-kids-glow"
              >
                {plan.cta_text || "Suscribirme ahora"} <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="kids-card p-8 text-center text-sm font-bold text-zinc-500">Pronto anunciaremos precios.</div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-center text-sm font-black text-zinc-600">…o empieza gratis ahora mismo</p>
          <InlineRegister appSlug="kids" redirectTo="/kids/app" buttonText="Crear cuenta gratis" placeholder="tu@correo.com" />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-lg px-5 pb-16">
        <h2 className="mb-4 text-center text-2xl font-black text-zinc-900" style={{ fontFamily: "var(--font-quicksand)" }}>
          Preguntas frecuentes
        </h2>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <div key={i} className="kids-card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
                <span className="pr-4 text-sm font-black text-zinc-800">{f.q}</span>
                <span className={`shrink-0 text-lg font-black text-kids-500 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`overflow-hidden transition-all ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                <p className="px-4 pb-4 text-xs text-zinc-500">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-orange-100 bg-white/60 py-8 text-center text-xs text-zinc-500">
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
