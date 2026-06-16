"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Zap,
  ArrowRight,
  Check,
  Car,
  Wrench,
  Fuel,
  FileText,
  Store,
  Calculator,
  ShieldCheck,
  Lock,
  Star,
  Heart,
  ClipboardList,
} from "lucide-react";

export default function AutoWebGPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    const params = new URLSearchParams({
      ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
    });

    router.push(`/auto/app?${params.toString()}`);
  };

  const features = [
    { icon: ClipboardList, title: "Bitácora inteligente", desc: "Registra mantenimientos, gastos y documentos con alertas automáticas." },
    { icon: Calculator, title: "7 calculadoras", desc: "Viaje, depreciación, llantas, presión, aceite, financiamiento y autonomía." },
    { icon: Fuel, title: "Control de gastos", desc: "Gráficos de consumo y proyecciones para ahorrar todos los meses." },
    { icon: FileText, title: "Documentos al día", desc: "SOAT, revisión técnica y pólizas con alertas de vencimiento." },
    { icon: Store, title: "Marketplace", desc: "Compra y vende con perfil público verificado y historial completo." },
    { icon: Car, title: "Perfil público QR", desc: "Comparte el historial de tu auto con un solo escaneo." },
  ];

  return (
    <div className="relative overflow-hidden bg-auto-gradient min-h-[100dvh]">
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "8%", left: "12%", delay: "0s", size: 32 },
          { top: "20%", left: "80%", delay: "0.8s", size: 28 },
          { top: "45%", left: "25%", delay: "1.6s", size: 36 },
          { top: "60%", left: "70%", delay: "2.4s", size: 24 },
          { top: "85%", left: "45%", delay: "1.2s", size: 30 },
        ].map((item, i) => (
          <span
            key={i}
            className="absolute animate-icon-pulse select-none text-emerald-500"
            style={{
              top: item.top,
              left: item.left,
              width: item.size,
              height: item.size,
              animationDelay: item.delay,
              opacity: 0.15,
            }}
          >
            <Car className="w-full h-full" />
          </span>
        ))}
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/auto/web" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">B</div>
            <span className="font-extrabold text-zinc-100 text-sm">Blis Auto</span>
          </Link>
          <Link href="/auto/web" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">
            Ver planes pagos
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm border border-white/6 rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-emerald-400 tracking-wide">Registro gratuito</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-100 mb-5 leading-[1.1]">
          Prueba Blis Auto
          <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            GRATIS
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Acceso completo a todas las herramientas. Sin tarjeta de crédito, sin compromiso.
        </p>

        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-emerald-400 fill-emerald-400" />
          ))}
          <span className="text-sm font-bold text-zinc-200 ml-2">4.9/5</span>
        </div>
        <p className="text-xs text-zinc-500 mb-10">Basado en 800+ reseñas de conductores</p>
      </section>

      {/* Form + Features */}
      <section className="relative z-10 px-4 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="card-auto-dark-elevated rounded-[1.5rem] p-6 border border-emerald-500/15">
            <h3 className="text-lg font-extrabold text-zinc-100 mb-1">Crea tu cuenta gratis</h3>
            <p className="text-xs text-zinc-500 mb-5">Accede a todas las funciones. Sin tarjeta.</p>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-zinc-100">¡Cuenta lista!</h4>
                <p className="text-sm text-zinc-400 mt-1">Redirigiendo...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-auto-600 hover:bg-auto-500 text-white py-3 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando cuenta...
                    </>
                  )                   : (
                    <>
                      <Zap className="w-4 h-4" />
                      Crear cuenta gratis
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                  <Lock className="w-3 h-3 text-zinc-500" />
                  Sin tarjeta. Cancela cuando quieras.
                </div>
              </form>
            )}
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="card-auto-dark rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">{f.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="relative z-10 px-4 pb-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: "Sin tarjeta", desc: "No requiere método de pago. Solo tu correo." },
            { icon: Heart, title: "Soporte real", desc: "Respuesta en menos de 24 horas. Gente real, no bots." },
            { icon: Car, title: "Todo incluido", desc: "Acceso a bitácora, calculadoras, documentos y marketplace." },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="text-center p-6 rounded-2xl card-auto-dark border border-white/6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Icon className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-extrabold text-zinc-100 mb-2">{t.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-12 text-center">
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500">
          <Link href="/legal/terminos" className="hover:text-emerald-400 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-emerald-400 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
      </footer>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes icon-pulse {
          0%, 100% { opacity: 0.12; transform: scale(0.92); }
          50% { opacity: 0.32; transform: scale(1.12); }
        }
        .animate-icon-pulse {
          animation: icon-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

