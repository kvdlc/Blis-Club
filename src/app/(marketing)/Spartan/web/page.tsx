import Link from "next/link";
import { Shield, Dumbbell, Flame, Target, Check, ArrowRight, Lock, Sparkles, Zap, HeartPulse } from "lucide-react";

export const metadata = {
  title: "Blis Spartan · Planes",
  description: "Forja tu mejor versión. Hábitos, gimnasio y disciplina en una sola app.",
};

const features = [
  { icon: Dumbbell, title: "Entrenamiento", desc: "Rutinas y sesiones de gimnasio organizadas por objetivo." },
  { icon: Target, title: "Hábitos", desc: "Construye disciplina con seguimiento diario y rachas." },
  { icon: Flame, title: "Motivación", desc: "Contenido y retos para mantenerte constante." },
  { icon: HeartPulse, title: "Progreso", desc: "Métricas claras de tu avance semana a semana." },
];

const planFeatures = [
  "Rutinas y sesiones ilimitadas",
  "Seguimiento de hábitos y rachas",
  "Retos y contenido de motivación",
  "Estadísticas de progreso",
  "Sincronización en todos tus dispositivos",
  "Soporte real en menos de 24 horas",
];

export default function SpartanWebPage() {
  return (
    <div className="relative overflow-hidden min-h-[100dvh] bg-[#0a0a0f]">
      {/* Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-spartan-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white font-extrabold text-sm">B</div>
          <span className="font-extrabold text-zinc-100 text-sm">Blis <span className="text-spartan-400">Spartan</span></span>
        </Link>
        <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-spartan-400 transition-colors">Iniciar sesión</Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-10 text-center">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-[linear-gradient(120deg,#be0b3c,#f97316)] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          <Shield className="w-3.5 h-3.5" /> Blis Spartan
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-zinc-50 leading-[1.05] mb-5">
          Forja tu mejor
          <span className="block bg-gradient-to-r from-spartan-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
            versión.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Hábitos, gimnasio y disciplina en una sola app. Entrena con propósito y mantén el ritmo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/Spartan/app" className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white px-6 py-3.5 font-bold text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] hover:opacity-95 transition-opacity active:scale-[0.98]">
            <Zap className="w-4 h-4" /> Entrar a la app
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 text-zinc-100 px-6 py-3.5 font-bold text-sm hover:bg-white/[0.1] transition-colors">
            Iniciar sesión <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-3xl p-5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-spartan-500/10 border border-spartan-500/20 text-spartan-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-100 mb-1.5">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plan */}
      <section className="relative z-10 max-w-lg mx-auto px-4 py-12">
        <div className="relative rounded-[2rem] p-6 sm:p-8 border border-spartan-500/25 bg-white/[0.04] backdrop-blur-md overflow-hidden">
          <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-spartan-500/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-black text-zinc-100">Blis Spartan <span className="text-spartan-400">Pro</span></span>
              <span className="text-[10px] font-bold text-spartan-300 bg-spartan-500/15 border border-spartan-500/30 rounded-full px-2.5 py-1">Oferta de lanzamiento</span>
            </div>

            <div className="flex items-end gap-3 mb-1">
              <span className="text-lg font-bold text-zinc-500 line-through">$10</span>
              <span className="text-xs text-zinc-500 line-through">/mes</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-spartan-400 drop-shadow-[0_0_20px_rgba(190,11,60,0.45)]">GRATIS</span>
              <span className="text-sm font-bold text-zinc-400 mb-1.5">ahora</span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Regalamos el plan completo a los primeros usuarios. <span className="text-spartan-300 font-semibold">Sin tarjeta, sin letra chica.</span>
            </p>

            <ul className="space-y-2.5 mb-7">
              {planFeatures.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-spartan-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300">{p}</span>
                </li>
              ))}
            </ul>

            <Link href="/Spartan/app" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white py-3.5 font-black text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] hover:opacity-95 transition-opacity active:scale-[0.98]">
              <Sparkles className="w-4 h-4" /> Activar gratis ahora
            </Link>
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 mt-3">
              <Lock className="w-3 h-3" /> Sin tarjeta de crédito. Cancela cuando quieras.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
