"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Star, ArrowRight, ShieldCheck, CreditCard, Clock, Sparkles, Palette, Puzzle, BookOpen, Download, Ban, Crown } from "lucide-react";

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

const PERKS = [
  { icon: Palette, label: "Todo para colorear", desc: "Láminas ilimitadas y nuevos dibujos cada semana" },
  { icon: Puzzle, label: "Puzzles sin fin", desc: "Crucigramas, laberintos y sopas de letras" },
  { icon: BookOpen, label: "Cuentos con voz", desc: "Historias ilustradas con lectura en voz alta" },
  { icon: Download, label: "Imprimibles en PDF", desc: "Descarga actividades listas para imprimir" },
  { icon: Sparkles, label: "Contenido nuevo", desc: "Nuevos recursos cada semana para toda la familia" },
  { icon: Ban, label: "Sin anuncios", desc: "Un espacio seguro y tranquilo para los niños" },
];

const FAQS = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Cancelas desde tu perfil y sigues usando Kids Club hasta el final del periodo pagado." },
  { q: "¿Es seguro para mis hijos?", a: "Totalmente. No mostramos anuncios y todo el contenido está pensado para niños." },
  { q: "¿Qué incluye el plan?", a: "Acceso completo a colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos, además del generador con IA." },
  { q: "¿Es seguro pagar con tarjeta?", a: "Sí. Usamos IziPay, una pasarela de pago segura. Tus datos nunca tocan nuestros servidores." },
];

export function KidsSubscriptionClient({ plans }: { plans: Plan[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const intervalLabel: Record<string, string> = { month: "mes", quarter: "trimestre", year: "año" };
  const formatPrice = (c: number) => {
    const d = c / 100;
    return d % 1 === 0 ? `$${d}` : `$${d.toFixed(2)}`;
  };

  const plan = plans.find((p) => p.billing_interval === "quarter") || plans[0];
  const cta = plan?.cta_text || "Suscribirme ahora";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="kids-card relative overflow-hidden p-6 text-center">
        <Crown className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 text-amber-200/60" />
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-black text-amber-700">
          <Sparkles className="h-3.5 w-3.5" /> {plan?.badge || "Ahorra 60%"}
        </div>
        <h1 className="mt-4 text-3xl font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
          Desbloquea toda la diversión
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-zinc-500">
          Colorear, puzzles, cuentos y creación con IA. Todo sin límites, para toda la familia.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
            <span className="ml-2 text-sm font-black text-zinc-700">4.9/5</span>
          </div>
          <span className="text-xs font-semibold text-zinc-400">Lo usan más de 1,200 familias</span>
        </div>
      </section>

      {/* Plan */}
      <section className="mx-auto max-w-md">
        {plan ? (
          <div className="kids-card overflow-hidden">
            <div className="bg-gradient-to-r from-kids-500 to-pink-500 px-6 py-3 text-center">
              <p className="text-sm font-black text-white">{plan.name}</p>
            </div>
            <div className="p-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-zinc-900">{formatPrice(plan.price_cents)}</span>
                <span className="text-zinc-400">/{intervalLabel[plan.billing_interval] || "periodo"}</span>
              </div>
              {plan.original_price_cents && plan.original_price_cents > plan.price_cents && (
                <p className="mt-2 text-center text-xs font-semibold text-zinc-400">
                  Precio real {formatPrice(plan.original_price_cents)}. Hoy solo {formatPrice(plan.price_cents)}.
                </p>
              )}
              {plan.description && (
                <p className="mt-3 text-center text-sm font-semibold text-zinc-500">{plan.description}</p>
              )}

              <ul className="mt-5 space-y-2">
                {(plan.features?.length ? plan.features : PERKS.map((p) => p.label)).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-semibold text-zinc-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/kids/app/checkout?plan=${plan.id}`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-kids-500 py-4 text-base font-black text-white shadow-kids-glow transition-transform active:scale-95"
              >
                {cta} <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="mt-3 text-center text-[11px] font-semibold text-zinc-400">Cancela cuando quieras. Sin compromiso.</p>
            </div>
          </div>
        ) : (
          <div className="kids-card p-8 text-center text-sm font-bold text-zinc-500">
            No hay planes disponibles por ahora.
          </div>
        )}
      </section>

      {/* Beneficios */}
      <section>
        <h2 className="mb-3 text-center text-xl font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
          Lo que incluye
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.label} className="kids-card p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kids-100 text-kids-600">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-2 text-sm font-black text-zinc-800">{p.label}</h3>
              <p className="mt-0.5 text-[11px] text-zinc-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-lg space-y-2">
        <h2 className="mb-2 text-center text-xl font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
          Preguntas frecuentes
        </h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="kids-card overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="pr-4 text-sm font-black text-zinc-800">{faq.q}</span>
              <span className={`shrink-0 text-lg font-black text-kids-500 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
            </button>
            <div className={`overflow-hidden transition-all ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
              <p className="px-4 pb-4 text-xs text-zinc-500">{faq.a}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-center gap-5 pb-4 text-[11px] font-semibold text-zinc-400">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-kids-500" /> Pago seguro</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-kids-500" /> Soporte 24/7</span>
        <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-kids-500" /> Cancela cuando quieras</span>
      </section>
    </div>
  );
}
