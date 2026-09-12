"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check, Zap, ShieldCheck, Star, ArrowRight, Sparkles, Heart, ChevronDown,
  Dumbbell, Target, Flame, HeartPulse, Lock, Ban, TrendingUp, Trophy, CalendarClock,
} from "lucide-react";

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

const PAIN_POINTS = [
  { icon: Ban, title: "Empiezas y abandonas", desc: "La motivación se va en una semana. Sin seguimiento ni rachas, volver a empezar cuesta el doble." },
  { icon: Target, title: "Entrenas sin rumbo", desc: "Vas al gimnasio sin un plan claro. Haces lo mismo cada vez y no ves progreso real." },
  { icon: CalendarClock, title: "Hábitos que no duran", desc: "Quieres disciplina pero no tienes dónde registrar tu día a día ni cómo mantenerte constante." },
  { icon: TrendingUp, title: "No ves tu avance", desc: "Sin métricas no sabes si mejoras. La falta de resultados visibles mata la constancia." },
];

const PILLARS = [
  { icon: Dumbbell, title: "Entrenamiento", desc: "Rutinas y sesiones de gimnasio organizadas por objetivo, con seguimiento de cada ejercicio." },
  { icon: Flame, title: "Hábitos & rachas", desc: "Construye disciplina con hábitos diarios, rachas y recordatorios que te mantienen en el camino." },
  { icon: HeartPulse, title: "Progreso & motivación", desc: "Métricas claras, retos y contenido para no rendirte. Ves tu avance semana a semana." },
];

const EXPANDABLE = [
  { icon: Dumbbell, title: "Rutinas inteligentes", has: "Planes de entrenamiento por objetivo (fuerza, hipertrofia, resistencia) con series, repeticiones y descansos.", before: "Llegas al gym sin plan y haces lo que se te ocurre. Resultados mínimos y desmotivación.", after: "Cada sesión tiene un propósito. Sabes exactamente qué hacer y por qué, y ves cómo sube tu rendimiento.", win: "Progresarás más rápido porque entrenas con estructura y sobrecarga progresiva." },
  { icon: Flame, title: "Hábitos y disciplina", has: "Registra hábitos diarios, mantén rachas y visualiza tu constancia con estadísticas claras.", before: "Dependes de la motivación, que es frágil. Un mal día rompe semanas de esfuerzo.", after: "La disciplina se construye con seguimiento. Las rachas te empujan a no romper la cadena.", win: "Convertirás el esfuerzo en hábito y el hábito en resultados permanentes." },
  { icon: Trophy, title: "Retos y motivación", has: "Desafíos periódicos y contenido que te mantiene enfocado cuando las ganas bajan.", before: "Cuando pierdes la motivación, abandonas. No hay nada que te empuje a continuar.", after: "Retos y comunidad te dan un motivo diario para seguir. Siempre hay un siguiente paso.", win: "Mantendrás el ritmo incluso en las semanas difíciles." },
  { icon: TrendingUp, title: "Métricas de progreso", has: "Gráficos de avance: peso, marcas, sesiones, hábitos cumplidos y rachas.", before: "No sabes si mejoras. La sensación de estancamiento te hace rendirte.", after: "Ves cada avance, por pequeño que sea. Los datos confirman tu progreso y te motivan.", win: "Tomarás decisiones con datos y celebrarás cada logro." },
];

const TESTIMONIALS = [
  { name: "Andrés M.", text: "Llevaba años empezando y dejando el gym. Con las rachas y los retos ya llevo 4 meses sin fallar.", metric: "4 meses", label: "sin fallar" },
  { name: "Camilo R.", text: "Las rutinas por objetivo me ordenaron todo. Subí mis marcas en press y sentadilla como nunca.", metric: "+30%", label: "en marcas" },
  { name: "Sebastián P.", text: "Ver mis métricas de hábitos cambió todo. Ahora la disciplina es parte de mi día a día.", metric: "21 días", label: "de racha" },
];

const FAQS = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Cancelas cuando quieras y sigues usando Blis Spartan hasta el final del período pagado." },
  { q: "¿Necesito ir al gimnasio?", a: "No. Puedes entrenar en casa o en el gym. Las rutinas se adaptan a tu objetivo y equipo disponible." },
  { q: "¿Sirve si soy principiante?", a: "Sí, está pensada para todos. Empiezas con rutinas y hábitos simples y vas subiendo con tu progreso." },
  { q: "¿Qué incluye el plan Pro?", a: "Acceso completo: rutinas, hábitos, retos, métricas de progreso y motivación. Sin límites." },
  { q: "¿Mis datos están seguros?", a: "Sí. Tu información es privada y se guarda con cifrado. Nunca la compartimos con terceros." },
  { q: "¿Hay versión gratis?", a: "Sí. Puedes empezar gratis y probar la app antes de decidir. Cuando quieras, pasas a Pro." },
];

export function SpartanWebLandingClient({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalLabel: Record<string, string> = { month: "mes", quarter: "trimestre", year: "año" };
  const price = (c: number) => `$${(c / 100).toFixed(2)}`;

  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) setSelectedPlan(plans[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  const goToPricing = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) { setError("Elige un plan."); return; }
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      plan: selectedPlan,
      email: email.trim().toLowerCase(),
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
    });
    router.push(`/Spartan/web/checkout?${params.toString()}`);
  };

  const selectPlan = (id: string) => {
    setSelectedPlan(id);
    setTimeout(goToPricing, 100);
  };

  return (
    <div className="relative overflow-hidden min-h-[100dvh] bg-[#0a0a0f] text-zinc-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-spartan-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/Spartan/web" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white font-extrabold text-sm">B</div>
          <span className="font-extrabold text-sm">Blis <span className="text-spartan-400">Spartan</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/Spartan/webg" className="text-xs font-bold text-zinc-300 hover:text-spartan-400 transition-colors">Probar gratis</Link>
          <button onClick={goToPricing} className="text-xs font-bold text-white bg-gradient-to-r from-spartan-600 to-spartan-700 px-3.5 py-2 rounded-xl active:scale-95 transition-transform">Ver planes</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-10 text-center">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-[linear-gradient(120deg,#be0b3c,#f97316)] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Blis Spartan Pro
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-4xl sm:text-6xl font-black leading-[1.05] mb-5">
          Forja tu mejor
          <span className="block bg-gradient-to-r from-spartan-400 via-red-400 to-orange-400 bg-clip-text text-transparent">versión.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Rutinas, hábitos, retos y métricas en una sola app. Entrena con propósito y mantén la disciplina que necesitas.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={goToPricing} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white px-6 py-3.5 font-bold text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] active:scale-[0.98] transition-transform">
            <Zap className="w-4 h-4" /> Ver planes
          </button>
          <Link href="/Spartan/webg" className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 px-6 py-3.5 font-bold text-sm hover:bg-white/[0.1] transition-colors">
            Probar gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1 mt-7">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-spartan-400 fill-spartan-400" />)}
          <span className="text-sm font-bold ml-2">4.9/5</span>
          <span className="text-xs text-zinc-500 ml-2">· +2.000 usuarios</span>
        </div>
      </section>

      {/* Pain points */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">¿Por qué cuesta tanto mantener la disciplina?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PAIN_POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-3xl p-5 bg-red-500/[0.05] border border-red-500/15">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-red-500/10 border border-red-500/20 text-red-400"><Icon className="w-5 h-5" /></div>
                <h3 className="text-sm font-extrabold mb-1.5">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">Todo para tu disciplina, en una app</h2>
        <p className="text-sm text-zinc-400 text-center mb-8 max-w-2xl mx-auto">Entrenamiento, hábitos y progreso conectados para que no abandones.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="rounded-3xl p-6 bg-white/[0.03] border border-white/[0.08]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="text-base font-extrabold mb-1.5">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Expandable features */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Lo que obtienes con Pro</h2>
        <div className="space-y-3">
          {EXPANDABLE.map((f, i) => {
            const Icon = f.icon;
            const open = openFeature === i;
            return (
              <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                <button onClick={() => setOpenFeature(open ? null : i)} className="w-full flex items-center gap-3 p-4 text-left">
                  <span className="w-9 h-9 rounded-xl bg-spartan-500/10 border border-spartan-500/20 text-spartan-400 flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
                  <span className="flex-1 text-sm font-bold">{f.title}</span>
                  <ChevronDown className={`w-4 h-4 text-spartan-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-2 text-xs text-zinc-400 leading-relaxed">
                    <p>{f.has}</p>
                    <p className="text-zinc-500"><b className="text-zinc-300">Antes:</b> {f.before}</p>
                    <p className="text-zinc-500"><b className="text-zinc-300">Con Blis:</b> {f.after}</p>
                    <p className="text-spartan-300 font-semibold">{f.win}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Hombres que ya forjan su mejor versión</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-3xl p-5 bg-white/[0.03] border border-white/[0.08]">
              <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-spartan-400 fill-spartan-400" />)}</div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white text-xs font-black">{t.name[0]}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold">{t.name}</p>
                  <p className="text-[10px] text-zinc-500">{t.metric} {t.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-4 py-12 scroll-mt-16">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-spartan-400 bg-spartan-500/10 border border-spartan-500/20 rounded-full px-3.5 py-1.5 mb-4 uppercase tracking-wider"><Sparkles className="w-3.5 h-3.5" /> Planes</span>
          <h2 className="text-2xl sm:text-3xl font-black">Elige tu plan y empieza hoy</h2>
          <p className="text-sm text-zinc-400 mt-2">Paga seguro con tarjeta. Cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((p) => {
            const selected = selectedPlan === p.id;
            return (
              <div key={p.id} className={`relative rounded-3xl p-5 border transition-all ${selected ? "border-spartan-500/60 bg-spartan-500/[0.07]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"}`}>
                {p.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-gradient-to-r from-spartan-600 to-spartan-700 px-2.5 py-1 rounded-full whitespace-nowrap">{p.badge}</span>}
                <h3 className="text-sm font-extrabold">{p.name}</h3>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-black text-spartan-400">{price(p.price_cents)}</span>
                  {p.original_price_cents && <span className="text-sm text-zinc-500 line-through mb-1">{price(p.original_price_cents)}</span>}
                  <span className="text-xs text-zinc-500 mb-1.5">/{intervalLabel[p.billing_interval] || "mes"}</span>
                </div>
                {p.description && <p className="text-[11px] text-zinc-500 mt-1">{p.description}</p>}
                <ul className="space-y-2 my-4">
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-spartan-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => selectPlan(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${selected ? "bg-gradient-to-r from-spartan-600 to-spartan-700 text-white" : "bg-white/[0.06] border border-white/12 text-zinc-200 hover:bg-white/[0.1]"}`}>
                  {selected ? "✓ Seleccionado" : (p.cta_text || "Elegir")}
                </button>
              </div>
            );
          })}
          {plans.length === 0 && <p className="text-sm text-zinc-500 md:col-span-3 text-center">Aún no hay planes publicados.</p>}
        </div>

        {/* Register → checkout */}
        <div className="max-w-md mx-auto rounded-3xl p-6 bg-white/[0.04] border border-spartan-500/20">
          <h3 className="text-base font-extrabold mb-1">Paga tu plan</h3>
          <p className="text-xs text-zinc-500 mb-4">Ingresa tus datos y te llevamos a la pasarela de pago segura.</p>
          <form onSubmit={handlePay} className="space-y-3">
            <input type="email" required placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
              <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{error}</p>}
            <button type="submit" disabled={loading || plans.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white py-3.5 font-bold text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] active:scale-[0.98] disabled:opacity-50 transition-transform">
              <Lock className="w-4 h-4" /> Ir a pagar con tarjeta
            </button>
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500"><ShieldCheck className="w-3 h-3" /> Pago seguro con Izipay</div>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left">
                <span className="text-sm font-bold">{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-spartan-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-spartan-600 to-spartan-700 p-8 sm:p-10 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative">
            <Heart className="w-8 h-8 text-white/90 mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Empieza a forjar tu mejor versión</h2>
            <p className="text-sm text-white/85 mb-6 max-w-lg mx-auto">Únete a los que ya entrenan con propósito y disciplina.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={goToPricing} className="rounded-2xl bg-white text-spartan-700 px-6 py-3.5 font-black text-sm hover:bg-white/90 transition-colors">Ver planes</button>
              <Link href="/Spartan/webg" className="rounded-2xl bg-black/20 border border-white/30 text-white px-6 py-3.5 font-bold text-sm hover:bg-black/30 transition-colors">Probar gratis</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-4 pb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
          <Link href="/legal/terminos" className="hover:text-spartan-400 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-spartan-400 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-spartan-400 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
