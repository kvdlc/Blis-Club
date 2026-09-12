"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, ArrowRight, Check, X, Wrench, Fuel, FileText, Store, Calculator,
  ShieldCheck, Lock, Star, Heart, ClipboardList, Sparkles, Bell, QrCode,
  TrendingUp, Camera, MapPin, Menu, ChevronDown, AlertTriangle, Clock,
  Wallet, Car, Smartphone, Users, CalendarClock, Quote,
  CheckCircle2, BadgeCheck,
} from "lucide-react";
import {
  Reveal, Stagger, StaggerItem, TiltCard, GlowOrb, Marquee, ScrollParallax,
} from "@/app/(app)/auto/app/marketplace/MarketplaceMotion";
import {
  FuelWidget, TripWidget, ChartsWidget, DocsWidget, MarketplaceWidget,
  CompareWidget, SpecsWidget, ShareTallerWidget, PhoneMock, StatFlip,
  OgPreviewMock, QrMock,
} from "./WebGWidgets";

function SectionHeading({
  eyebrow, title, subtitle, icon,
}: {
  eyebrow?: string; title: string; subtitle?: string; icon?: React.ReactNode;
}) {
  return (
    <Reveal className="text-center mb-9 px-2">
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5 mb-4 uppercase tracking-wider">
          {icon} {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-100 mb-3 leading-tight">{title}</h2>
      {subtitle && <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">{subtitle}</p>}
    </Reveal>
  );
}

export default function AutoWebGPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cycle, setCycle] = useState<"mensual" | "anual">("mensual");

  const goToForm = () => {
    setMenuOpen(false);
    document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });
  };

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

  const problems = [
    { icon: Wallet, title: "No sabes cuánto gastas", desc: "El combustible, los repuestos y los trámites se te escapan cada mes." },
    { icon: FileText, title: "Se te vencen los papeles", desc: "SOAT, revisión técnica o póliza vencida y llega la multa." },
    { icon: Wrench, title: "Olvidas el mantenimiento", desc: "¿Cuándo cambiaste el aceite? ¿Qué filtro usaba tu auto?" },
    { icon: Store, title: "Compras sin referencia", desc: "Precios, talleres y repuestos sin saber si es buena opción." },
  ];

  const steps = [
    { icon: Smartphone, title: "1. Crea tu cuenta", desc: "Regístrate gratis con tu correo. Sin tarjeta y en menos de un minuto." },
    { icon: ClipboardList, title: "2. Registra tu día a día", desc: "Cargas de combustible, mantenimientos, repuestos y documentos." },
    { icon: Bell, title: "3. Recibe alertas y ahorra", desc: "La app calcula, proyecta y te avisa antes de cada vencimiento." },
  ];

  const features = [
    { icon: ClipboardList, title: "Bitácora inteligente", desc: "Cargas, mantenimientos y repuestos con fotos y cálculo automático.", accent: "#06b6d4" },
    { icon: Calculator, title: "7 calculadoras", desc: "Viaje, depreciación, llantas, presión, aceite, financiamiento y autonomía.", accent: "#8b5cf6" },
    { icon: TrendingUp, title: "Control de gastos", desc: "Gráficos de consumo y proyecciones para ahorrar todos los meses.", accent: "#10b981" },
    { icon: FileText, title: "Documentos al día", desc: "SOAT, revisión técnica y pólizas con alertas de vencimiento.", accent: "#f59e0b" },
    { icon: Store, title: "Marketplace", desc: "Compra y vende con perfil público verificado y carrito integrado.", accent: "#3b82f6" },
    { icon: MapPin, title: "Directorio + compartir", desc: "Guarda talleres y grifos, y compártelos con un enlace corto.", accent: "#06b6d4" },
    { icon: Sparkles, title: "ADN del vehículo", desc: "Tu ficha técnica (aceite, filtros, medidas) siempre a la mano.", accent: "#8b5cf6" },
    { icon: Camera, title: "Fotos y galería", desc: "Adjunta hasta 3 fotos por repuesto y ábrelas a pantalla completa.", accent: "#10b981" },
    { icon: Car, title: "Multi-vehículo", desc: "Administra todos tus autos desde una sola cuenta.", accent: "#3b82f6" },
    { icon: QrCode, title: "Perfil público QR", desc: "Comparte el historial de tu auto con un solo escaneo.", accent: "#06b6d4" },
    { icon: ShieldCheck, title: "Historial verificado", desc: "Cada mantenimiento queda registrado para dar confianza al vender.", accent: "#10b981" },
    { icon: Users, title: "Comunidad", desc: "Aprende de otros conductores y comparte tus mejores talleres.", accent: "#8b5cf6" },
  ];

  const calcTools = [
    "Viaje y combustible", "Depreciación del auto", "Cambio de llantas",
    "Presión de neumáticos", "Cambio de aceite", "Financiamiento", "Autonomía",
  ];

  const testimonials = [
    { name: "Andrea M.", city: "Guayaquil", text: "Dejé de improvisar. Ahora sé exactamente cuánto gasto al mes en el auto y me avisa antes del SOAT." },
    { name: "Luis F.", city: "Quito", text: "La bitácora con fotos me salvó: cuando vendí el auto mostré todo el historial y me pagaron más." },
    { name: "Diego R.", city: "Cuenca", text: "Comparto el taller donde me atienden con mi familia por WhatsApp. El enlace se ve súper bien." },
  ];

  const faqs = [
    { q: "¿Realmente es gratis?", a: "Sí. Ahora mismo el plan completo es gratis para los primeros usuarios. Después tendrá un valor de $10/mes, pero tú lo mantienes sin costo." },
    { q: "¿Necesito tarjeta de crédito?", a: "No. Solo creas tu cuenta con tu correo y listo. No pedimos ningún método de pago." },
    { q: "¿Funciona para varios autos?", a: "Sí, puedes registrar y administrar varios vehículos desde la misma cuenta y cambiar entre ellos." },
    { q: "¿Puedo guardar fotos de mis repuestos?", a: "Sí. En cada repuesto puedes subir hasta 3 fotos para recordar exactamente qué compraste y dónde." },
    { q: "¿Mis datos están seguros?", a: "Sí. Tu información es privada y solo tú decides qué compartes con el perfil público o los enlaces de talleres." },
    { q: "¿Sirve si no sé de mecánica?", a: "Es justamente para eso. La app te dice qué revisar, cuándo y con qué medidas, en lenguaje simple." },
  ];

  const compareRows = [
    { label: "Sabes cuánto gastas al mes", sin: false, con: true },
    { label: "Avisos antes de que venza el SOAT", sin: false, con: true },
    { label: "Historial de mantenimiento con fotos", sin: false, con: true },
    { label: "Calculadoras de viaje y financiamiento", sin: false, con: true },
    { label: "Talleres y repuestos a la mano", sin: false, con: true },
    { label: "Papeles y anotaciones en el celular", sin: true, con: true },
  ];

  const planFeatures = [
    "Bitácora ilimitada de cargas y mantenimientos",
    "Las 7 calculadoras del auto",
    "Documentos con alertas de vencimiento",
    "Marketplace y carrito integrado",
    "Directorio de talleres con enlaces para compartir",
    "ADN del vehículo (ficha técnica)",
    "Perfil público con código QR",
    "Fotos en repuestos y galería",
    "Multi-vehículo",
    "Soporte real en menos de 24 horas",
  ];

  return (
    <div className="relative overflow-hidden bg-auto-gradient min-h-[100dvh]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowOrb className="bg-emerald-500/20 -top-24 -left-24" size={380} float={1.2} />
        <GlowOrb className="bg-violet-600/20 top-40 -right-32" size={420} float={1} delay={0.6} />
        <GlowOrb className="bg-cyan-500/15 top-[60%] -left-24" size={340} float={1.4} delay={1.1} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/auto/web" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg grad-auto flex items-center justify-center text-white font-extrabold text-sm">B</div>
            <span className="font-extrabold text-zinc-100 text-sm">Blis Auto</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <a href="#demos" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Demos</a>
            <a href="#como" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Cómo funciona</a>
            <a href="#funciones" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Funciones</a>
            <a href="#plan" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">Plan</a>
            <a href="#faq" className="text-xs font-bold text-zinc-400 hover:text-emerald-400 transition-colors">FAQ</a>
            <button onClick={goToForm} className="text-xs font-bold text-white bg-auto-600 hover:bg-auto-500 px-3.5 py-2 rounded-xl shadow-auto-glow transition-colors active:scale-95">
              Registro gratis
            </button>
          </div>

          <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl glass-card border border-white/10 flex items-center justify-center text-zinc-200" aria-label="Menú">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass-strong border-t border-white/8 px-4 py-3 space-y-1">
            {[
              { href: "#demos", label: "Demos" },
              { href: "#como", label: "Cómo funciona" },
              { href: "#funciones", label: "Funciones" },
              { href: "#plan", label: "Plan" },
              { href: "#faq", label: "Preguntas" },
            ].map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-200 hover:bg-white/[0.06]">
                {l.label}
              </a>
            ))}
            <button onClick={goToForm} className="w-full mt-1 rounded-xl bg-auto-600 text-white py-3 font-bold text-sm shadow-auto-glow">
              Crear cuenta gratis
            </button>
          </motion.div>
        )}
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-start">
                <button onClick={goToForm} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-auto-600 hover:bg-auto-500 text-white px-6 py-3.5 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] animate-btn-glow">
                  <Zap className="w-4 h-4" /> Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#demos" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] border border-white/12 text-zinc-100 px-6 py-3.5 font-bold text-sm hover:bg-white/[0.1] transition-colors">
                  Ver las demos
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex items-center gap-1 mt-7 justify-center lg:justify-start">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />)}
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
            <span key={i} className="flex items-center gap-2 px-6 text-sm font-bold text-zinc-400">{x.i} {x.t}</span>
          ))}
          speed={26}
        />
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <Stagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { v: "7", s: "", l: "Calculadoras" },
            { v: "12", s: "+", l: "Funciones" },
            { v: "100", s: "%", l: "Gratis para empezar" },
            { v: "24", s: "h", l: "Soporte real" },
          ].map((st) => (
            <StaggerItem key={st.l}><StatFlip value={Number(st.v)} label={st.l} suffix={st.s} /></StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* El problema */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <SectionHeading eyebrow="El problema" icon={<AlertTriangle className="w-3.5 h-3.5" />} title="Manejar un auto sin control cuesta caro" subtitle="La mayoría de conductores pierde dinero por cosas que se podrían evitar fácilmente." />
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="card-auto-dark rounded-3xl p-5 h-full border border-red-500/10">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-red-500/10 border border-red-500/20 text-red-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-zinc-100 mb-1.5">{p.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Demos */}
      <section id="demos" className="relative z-10 max-w-6xl mx-auto px-4 py-12 scroll-mt-16">
        <SectionHeading eyebrow="Demos en vivo" icon={<Sparkles className="w-3.5 h-3.5" />} title="Así se ve por dentro" subtitle="Prueba los widgets reales de la app: escribe, toca y mira cómo se calcula todo al instante." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {[FuelWidget, TripWidget, ChartsWidget, DocsWidget, MarketplaceWidget, CompareWidget, SpecsWidget, ShareTallerWidget].map((W, i) => (
            <Reveal key={i} delay={(i % 3) * 0.05} y={24}>
              <TiltCard intensity={4}><W /></TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="relative z-10 max-w-6xl mx-auto px-4 py-12 scroll-mt-16">
        <SectionHeading eyebrow="Cómo funciona" icon={<Sparkles className="w-3.5 h-3.5" />} title="Listo en 3 pasos" subtitle="Sin instalaciones complicadas. Empiezas a usarlo en minutos." />
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className="relative card-auto-dark rounded-3xl p-6 h-full border border-white/[0.08]">
                  <span className="absolute top-5 right-5 text-4xl font-black text-white/[0.05]">{i + 1}</span>
                  <div className="w-12 h-12 rounded-2xl grad-auto flex items-center justify-center text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-100 mb-1.5">{s.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Funciones */}
      <section id="funciones" className="relative z-10 max-w-6xl mx-auto px-4 py-12 scroll-mt-16">
        <SectionHeading eyebrow="Funciones" icon={<BadgeCheck className="w-3.5 h-3.5" />} title="Todo lo que puedes hacer" subtitle="Una sola app para mantener tu vehículo al día y bajo control." />
        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <TiltCard intensity={5} className="h-full">
                  <div className="card-auto-dark rounded-3xl p-5 h-full border border-white/[0.08] hover:border-white/15 transition-colors">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${f.accent}1f`, color: f.accent, border: `1px solid ${f.accent}33` }}>
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

      {/* Calculadoras */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3.5 py-1.5 mb-4 uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" /> 7 calculadoras
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-100 mb-3 leading-tight">Decisiones con números, no con dudas</h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6">¿Cuánto cuesta el viaje? ¿Cuándo cambio las llantas? ¿Me conviene financiar? Respuestas al instante.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {calcTools.map((t) => (
                <div key={t} className="flex items-center gap-2.5 rounded-2xl card-auto-dark border border-white/[0.08] px-3.5 py-3">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200">{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}><TiltCard intensity={4}><TripWidget /></TiltCard></Reveal>
        </div>
      </section>

      {/* Documentos */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Reveal delay={0.1} className="order-2 lg:order-1"><TiltCard intensity={4}><DocsWidget /></TiltCard></Reveal>
          <Reveal className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3.5 py-1.5 mb-4 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" /> Documentos
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-100 mb-3 leading-tight">Nunca más una multa por vencimiento</h2>
            <p className="text-sm sm:text-base text-zinc-400 mb-6">Guarda tu SOAT, revisión técnica y pólizas. Te avisamos con tiempo para que renueves sin estrés.</p>
            <div className="space-y-3">
              {[
                { icon: CalendarClock, t: "Alertas anticipadas de cada vencimiento" },
                { icon: Clock, t: "Días restantes siempre visibles" },
                { icon: ShieldCheck, t: "Todo respaldado y a la mano" },
              ].map((x) => (
                <div key={x.t} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0"><x.icon className="w-4 h-4" /></span>
                  <span className="text-sm text-zinc-300">{x.t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Marketplace */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <SectionHeading eyebrow="Marketplace" icon={<Store className="w-3.5 h-3.5" />} title="Compra y vende con confianza" subtitle="Repuestos, accesorios y autos con perfil verificado e historial completo." />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Reveal><TiltCard intensity={4}><MarketplaceWidget /></TiltCard></Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, t: "Perfiles verificados", d: "Compra a vendedores con historial y reputación." },
                { icon: Wallet, t: "Pago seguro", d: "Checkout integrado con tarjeta en segundos." },
                { icon: TrendingUp, t: "Precios de referencia", d: "Compara antes de comprar y evita pagar de más." },
                { icon: Camera, t: "Fotos reales", d: "Ve exactamente lo que compras antes de decidir." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-3.5 card-auto-dark rounded-2xl border border-white/[0.08] p-4">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0"><x.icon className="w-5 h-5" /></span>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">{x.t}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Directorio + QR */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <SectionHeading eyebrow="Talleres y perfil" icon={<MapPin className="w-3.5 h-3.5" />} title="Guarda, comparte y presume tu auto" subtitle="Un directorio de talleres con enlaces para compartir y un perfil público con QR." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <Reveal><TiltCard intensity={4}><ShareTallerWidget /></TiltCard></Reveal>
          <Reveal delay={0.05}><div className="card-auto-dark rounded-3xl p-5 border border-white/[0.08]"><OgPreviewMock /></div></Reveal>
          <Reveal delay={0.1}><div className="card-auto-dark rounded-3xl p-5 border border-white/[0.08]"><QrMock /></div></Reveal>
        </div>
      </section>

      {/* Testimonios */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <SectionHeading eyebrow="Testimonios" icon={<Heart className="w-3.5 h-3.5" />} title="Conductores que ya lo usan" subtitle="Miles de personas ya tienen su auto bajo control." />
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="card-auto-dark rounded-3xl p-5 h-full border border-white/[0.08]">
                <Quote className="w-6 h-6 text-emerald-400/60 mb-3" />
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">{t.text}</p>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full grad-auto flex items-center justify-center text-white font-black text-sm">{t.name[0]}</span>
                  <div>
                    <p className="text-xs font-bold text-zinc-100">{t.name}</p>
                    <p className="text-[10px] text-zinc-500">{t.city}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-emerald-400 fill-emerald-400" />)}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Comparativa */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <SectionHeading eyebrow="Comparativa" icon={<TrendingUp className="w-3.5 h-3.5" />} title="Con Blis Auto vs. a la antigua" />
        <Reveal>
          <div className="card-auto-dark rounded-3xl border border-white/[0.08] overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_90px_90px] items-center px-4 sm:px-6 py-3 border-b border-white/8 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span />
              <span className="text-center">Sin app</span>
              <span className="text-center text-emerald-400">Con Blis</span>
            </div>
            {compareRows.map((r, i) => (
              <div key={r.label} className={`grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_90px_90px] items-center px-4 sm:px-6 py-3.5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                <span className="text-xs sm:text-sm text-zinc-300 pr-3">{r.label}</span>
                <span className="flex justify-center">
                  {r.sin ? <Check className="w-4 h-4 text-zinc-500" /> : <X className="w-4 h-4 text-red-400/70" />}
                </span>
                <span className="flex justify-center"><Check className="w-4 h-4 text-emerald-400" /></span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-4 py-12 scroll-mt-16">
        <SectionHeading eyebrow="Preguntas" icon={<ClipboardList className="w-3.5 h-3.5" />} title="Preguntas frecuentes" />
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.03}>
              <div className="card-auto-dark rounded-2xl border border-white/[0.08] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left">
                  <span className="text-sm font-bold text-zinc-100">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 sm:px-5 pb-4 text-xs text-zinc-400 leading-relaxed">
                    {f.a}
                  </motion.p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Plan / Precio */}
      <section id="plan" className="relative z-10 max-w-lg mx-auto px-4 py-14 scroll-mt-16">
        <SectionHeading eyebrow="Plan" icon={<Sparkles className="w-3.5 h-3.5" />} title="Un solo plan, todo incluido" subtitle="El plan completo de Blis Auto. Ahora es gratis para los primeros usuarios." />
        <Reveal>
          <div className="relative card-auto-dark-elevated rounded-[2rem] p-6 sm:p-8 border border-emerald-500/25 overflow-hidden">
            <div className="absolute -top-24 -right-20 w-56 h-56 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-black text-zinc-100">Blis Auto <span className="text-emerald-400">Pro</span></span>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2.5 py-1">Oferta de lanzamiento</span>
              </div>

              {/* Toggle ciclo */}
              <div className="inline-flex p-1 rounded-xl bg-white/[0.05] border border-white/10 mb-5">
                {(["mensual", "anual"] as const).map((c) => (
                  <button key={c} onClick={() => setCycle(c)} className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors ${cycle === c ? "bg-auto-600 text-white" : "text-zinc-400"}`}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-3 mb-1">
                <span className="text-lg font-bold text-zinc-500 line-through">${cycle === "mensual" ? "10" : "120"}</span>
                <span className="text-xs text-zinc-500 line-through">/{cycle === "mensual" ? "mes" : "año"}</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">GRATIS</span>
                <span className="text-sm font-bold text-zinc-400 mb-1.5">ahora</span>
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Regalamos el plan completo a los primeros usuarios. <span className="text-emerald-300 font-semibold">Sin tarjeta, sin letra chica.</span>
              </p>

              <ul className="space-y-2.5 mb-7">
                {planFeatures.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-zinc-300">{p}</span>
                  </li>
                ))}
              </ul>

              <button onClick={goToForm} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-auto-600 hover:bg-auto-500 text-white py-3.5 font-black text-sm shadow-auto-glow transition-all active:scale-[0.98]">
                <Zap className="w-4 h-4" /> Activar gratis ahora
              </button>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 mt-3">
                <Lock className="w-3 h-3" /> Sin tarjeta de crédito. Cancela cuando quieras.
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Registro */}
      <section id="registro" className="relative z-10 max-w-3xl mx-auto px-4 py-10 scroll-mt-16">
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
                <input type="email" required placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all" />
                  <input type="text" required placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all" />
                </div>
                {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{error}</p>}
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-auto-600 hover:bg-auto-500 text-white py-3.5 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] disabled:opacity-50">
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
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl" style={{ background: `${t.accent}1f`, color: t.accent, border: `1px solid ${t.accent}33` }}>
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
              <p className="text-sm text-white/85 mb-6 max-w-lg mx-auto">Únete a los conductores que ya controlan su auto desde el celular.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={goToForm} className="rounded-2xl bg-white text-emerald-700 px-6 py-3.5 font-black text-sm hover:bg-white/90 transition-colors active:scale-[0.98]">Crear cuenta gratis</button>
                <Link href="/auto/web" className="rounded-2xl bg-black/20 border border-white/30 text-white px-6 py-3.5 font-bold text-sm hover:bg-black/30 transition-colors">Ver planes pagos</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-24 sm:pb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
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
        <button onClick={goToForm} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-auto-600 text-white py-3 font-bold text-sm shadow-auto-glow active:scale-[0.98]">
          <Zap className="w-4 h-4" /> Crear cuenta gratis
        </button>
      </div>
    </div>
  );
}
