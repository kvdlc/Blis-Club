"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Zap, ArrowRight, Check, Wrench, Fuel, FileText, Store, Calculator,
  ShieldCheck, Lock, Star, Heart, ClipboardList, Sparkles, Bell, QrCode,
  TrendingUp, Camera, MapPin,
} from "lucide-react";
import {
  Reveal, Stagger, StaggerItem, TiltCard, GlowOrb, Marquee, ScrollParallax,
} from "@/app/(app)/auto/app/marketplace/MarketplaceMotion";
import {
  FuelWidget, TripWidget, ChartsWidget, DocsWidget, MarketplaceWidget,
  CompareWidget, SpecsWidget, ShareTallerWidget, PhoneMock, StatFlip,
} from "./WebGWidgets";

export default function AutoWebGPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const goToForm = () => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({
      ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
      ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
      ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
    });
    setSent(true);
    router.push(`/auto/app?${params.toString()}`);
  };

  const features = [
    { icon: ClipboardList, title: "Bitácora inteligente", desc: "Registra cargas, mantenimientos y repuestos con fotos. Calcula precio/galón solo.", accent: "#06b6d4" },
    { icon: Calculator, title: "7 calculadoras", desc: "Viaje, depreciación, llantas, presión, aceite, financiamiento y autonomía.", accent: "#8b5cf6" },
    { icon: TrendingUp, title: "Control de gastos", desc: "Gráficos de consumo y proyecciones para ahorrar todos los meses.", accent: "#10b981" },
    { icon: FileText, title: "Documentos al día", desc: "SOAT, revisión técnica y pólizas con alertas de vencimiento.", accent: "#f59e0b" },
    { icon: Store, title: "Marketplace", desc: "Compra y vende con perfil público verificado y carrito integrado.", accent: "#3b82f6" },
    { icon: MapPin, title: "Directorio + compartir", desc: "Guarda talleres y grifos, y compártelos con un enlace corto.", accent: "#06b6d4" },
    { icon: Sparkles, title: "ADN del vehículo", desc: "Tu ficha técnica (aceite, filtros, medidas) siempre a la mano.", accent: "#8b5cf6" },
    { icon: Camera, title: "Fotos y galería", desc: "Adjunta hasta 3 fotos por repuesto y ábrelas a pantalla completa.", accent: "#10b981" },
  ];

  return (
    <div className="relative overflow-hidden bg-auto-gradient min-h-[100dvh]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowOrb className="bg-emerald-500/20 -top-24 -left-24" size={420} float={1.2} />
        <GlowOrb className="bg-violet-600/20 top-40 -right-32" size={460} float={1} delay={0.6} />
        <GlowOrb className="bg-cyan-500/15 top-[70%] left-1/4" size={380} float={1.4} delay={1.1} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/auto/web" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg grad-auto flex items-center justify-center text-white font-extrabold text-sm">B</div>
            <span className="font-extrabold text-zinc-100 text-sm">Blis Auto</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#demos" className="hidden sm:block text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Demos</a>
            <a href="#funciones" className="hidden sm:block text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Funciones</a>
            <button onClick={goToForm} className="text-xs font-bold text-white bg-auto-600 hover:bg-auto-500 px-3.5 py-2 rounded-xl shadow-auto-glow transition-colors active:scale-95">
              Registro gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wide">Registro gratis · sin tarjeta</span>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-100 mb-5 leading-[1.05] tracking-tight">
                Tu auto, en
                <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  modo inteligente
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto lg:mx-0 mb-7">
                Bitácora, gastos, documentos, calculadoras, marketplace y directorio de talleres.
                Todo en una app que te ahorra tiempo y dinero.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={goToForm}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-auto-600 hover:bg-auto-500 text-white px-6 py-3.5 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] animate-btn-glow"
                >
                  <Zap className="w-4 h-4" /> Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#demos"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] border border-white/12 text-zinc-100 px-6 py-3.5 font-bold text-sm hover:bg-white/[0.1] transition-colors"
                >
                  Ver las demos
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex items-center gap-1 mt-7 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ))}
                <span className="text-sm font-bold text-zinc-200 ml-2">4.9/5</span>
                <span className="text-xs text-zinc-500 ml-2">· 800+ reseñas</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} y={30}>
            <ScrollParallax from={-16} to={16}>
              <TiltCard intensity={6}>
                <PhoneMock />
              </TiltCard>
            </ScrollParallax>
          </Reveal>
        </div>
      </section>

      {/* Marquee */}
      <section className="relative z-10 py-6 border-y border-white/6 bg-black/20">
        <Marquee
          items={[
            { i: <Fuel className="w-4 h-4 text-cyan-400" />, t: "Bitácora" },
            { i: <Calculator className="w-4 h-4 text-violet-400" />, t: "Calculadoras" },
            { i: <TrendingUp className="w-4 h-4 text-emerald-400" />, t: "Gastos" },
            { i: <FileText className="w-4 h-4 text-amber-400" />, t: "Documentos" },
            { i: <Store className="w-4 h-4 text-blue-400" />, t: "Marketplace" },
            { i: <MapPin className="w-4 h-4 text-cyan-400" />, t: "Talleres" },
            { i: <QrCode className="w-4 h-4 text-emerald-400" />, t: "Perfil QR" },
            { i: <Wrench className="w-4 h-4 text-violet-400" />, t: "Mantenimiento" },
          ].map((x, i) => (
            <span key={i} className="flex items-center gap-2 px-6 text-sm font-bold text-zinc-400">
              {x.i} {x.t}
            </span>
          ))}
          speed={26}
        />
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { v: "7", s: "", l: "Calculadoras" },
            { v: "8", s: "+", l: "Tipos de registro" },
            { v: "100", s: "%", l: "Gratis para empezar" },
            { v: "24", s: "h", l: "Soporte real" },
          ].map((st) => (
            <StaggerItem key={st.l}>
              <StatFlip value={Number(st.v)} label={st.l} suffix={st.s} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Demos */}
      <section id="demos" className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <Reveal className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5 mb-4 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Demos en vivo
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-100 mb-3">Así se ve por dentro</h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Prueba los widgets reales de la app: escribe, toca y mira cómo se calcula todo al instante.
          </p>
        </Reveal>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          {[FuelWidget, TripWidget, ChartsWidget, DocsWidget, MarketplaceWidget, CompareWidget, SpecsWidget, ShareTallerWidget].map((W, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <Reveal delay={(i % 3) * 0.06} y={26}>
                <TiltCard intensity={4}>
                  <W />
                </TiltCard>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <Reveal className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-100 mb-3">Todo lo que puedes hacer</h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Una sola app para mantener tu vehículo al día y bajo control.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <TiltCard intensity={5} className="h-full">
                  <div className="card-auto-dark rounded-3xl p-5 h-full border border-white/[0.08] hover:border-white/15 transition-colors">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: `${f.accent}1f`, color: f.accent, border: `1px solid ${f.accent}33` }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-zinc-100 mb-1.5">{f.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Registro */}
      <section id="registro" className="relative z-10 max-w-3xl mx-auto px-4 py-14">
        <Reveal>
          <div className="card-auto-dark-elevated rounded-[2rem] p-6 sm:p-8 border border-emerald-500/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-100 mb-2">Crea tu cuenta gratis</h2>
              <p className="text-sm text-zinc-400">Acceso completo a todas las funciones. Sin tarjeta de crédito.</p>
            </div>

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
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                  />
                </div>
                {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-auto-600 hover:bg-auto-500 text-white py-3.5 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" /> Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                  <Lock className="w-3 h-3" /> Sin tarjeta. Cancela cuando quieras.
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      {/* Trust */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-14">
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: "Sin tarjeta", desc: "No requiere método de pago. Solo tu correo.", accent: "#10b981" },
            { icon: Heart, title: "Soporte real", desc: "Respuesta en menos de 24 horas. Gente real, no bots.", accent: "#f43f5e" },
            { icon: ShieldCheck, title: "Todo incluido", desc: "Bitácora, calculadoras, documentos, marketplace y más.", accent: "#8b5cf6" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <StaggerItem key={t.title}>
                <div className="text-center p-6 rounded-3xl card-auto-dark border border-white/[0.08]">
                  <div
                    className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl"
                    style={{ background: `${t.accent}1f`, color: t.accent, border: `1px solid ${t.accent}33` }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-100 mb-2">{t.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{t.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] grad-auto p-8 sm:p-10 text-center shadow-auto-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
            <div className="relative">
              <Bell className="w-8 h-8 text-white/90 mx-auto mb-3" />
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Empieza hoy, gratis</h2>
              <p className="text-sm text-white/85 mb-6 max-w-lg mx-auto">
                Únete a los conductores que ya controlan su auto desde el celular.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={goToForm}
                  className="rounded-2xl bg-white text-emerald-700 px-6 py-3.5 font-black text-sm hover:bg-white/90 transition-colors active:scale-[0.98]"
                >
                  Crear cuenta gratis
                </button>
                <Link
                  href="/auto/web"
                  className="rounded-2xl bg-black/20 border border-white/30 text-white px-6 py-3.5 font-bold text-sm hover:bg-black/30 transition-colors"
                >
                  Ver planes pagos
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-24 sm:pb-12 text-center">
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500">
          <Link href="/legal/terminos" className="hover:text-emerald-400 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-emerald-400 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
      </footer>

      {/* CTA sticky móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden glass-nav border-t border-white/10 p-3">
        <button
          onClick={goToForm}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-auto-600 text-white py-3 font-bold text-sm shadow-auto-glow active:scale-[0.98]"
        >
          <Zap className="w-4 h-4" /> Crear cuenta gratis
        </button>
      </div>
    </div>
  );
}
