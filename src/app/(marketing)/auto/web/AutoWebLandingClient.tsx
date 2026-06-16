"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
  Heart,
  ChevronDown,
  Car,
  Wrench,
  Fuel,
  FileText,
  Store,
  Calculator,
  ClipboardList,
  Wallet,
  TrendingDown,
  Lock,
  MessageCircle,
  Gauge,
  AlertTriangle,
  X,
  CircleCheck,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  original_price_cents: number | null;
  billing_interval: string;
  features: string[];
  landing_visible: boolean;
  landing_order: number;
  landing_slug: string | null;
  description: string | null;
  badge: string | null;
  payment_provider: string;
  cta_text: string | null;
}

interface Props {
  plans: Plan[];
}

/* ─── Data ─── */
const PAIN_POINTS = [
  { icon: Wallet, title: "Gastos sin control", desc: "No sabes cuánto gastas en tu auto cada mes. Los consumos se acumulan y no hay forma de visualizarlos." },
  { icon: Wrench, title: "Mantenimientos olvidados", desc: "Te enteras de un problema cuando ya es costoso. Sin recordatorios, todo pasa desapercibido." },
  { icon: FileText, title: "Documentos vencidos", desc: "Multas por SOAT o revisión técnica atrasada. El papeleo se pierde entre archivos y correos." },
  { icon: TrendingDown, title: "Sin historial de valor", desc: "No tienes registro para vender tu auto a buen precio. El comprador no confía sin historial." },
];

const SOLUTION_PILLARS = [
  { icon: ClipboardList, title: "Bitácora Inteligente", desc: "Registra mantenimientos, gastos, documentos y upgrades. Nunca olvides nada. Todo queda archivado y ordenado.", color: "from-emerald-400 to-emerald-600" },
  { icon: Calculator, title: "7 Calculadoras", desc: "Costo de viaje, depreciación, llantas, presión, aceite, financiamiento, autonomía. Datos exactos en segundos.", color: "from-teal-400 to-teal-600" },
  { icon: Store, title: "Marketplace & Perfil", desc: "Compra, vende y muestra tu auto con historial completo. Genera confianza con un perfil público profesional.", color: "from-green-400 to-green-600" },
];

const APP_MOCKUPS = [
  {
    title: "Dashboard",
    desc: "Resumen visual del estado de tu auto: próximos mantenimientos, gastos del mes, documentos por vencer y alertas importantes.",
    wide: true,
    render: () => (
      <div className="w-full h-full flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="w-20 h-3 rounded-full bg-white/10" />
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-3">
            <div className="text-[10px] text-zinc-500 mb-1">Gastos mes</div>
            <div className="text-lg font-bold text-emerald-400">S/ 840</div>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-3">
            <div className="text-[10px] text-zinc-500 mb-1">Kilometraje</div>
            <div className="text-lg font-bold text-zinc-100">42,350</div>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/6 p-3 flex-1">
          <div className="text-[10px] text-zinc-500 mb-2">Próximos mantenimientos</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-24 h-2 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <div className="w-32 h-2 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
              <div className="w-20 h-2 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Bitácora",
    desc: "Timeline cronológico de cada evento: cambio de aceite, nuevas llantas, pago de SOAT, upgrades y reparaciones.",
    wide: false,
    render: () => (
      <div className="w-full h-full flex flex-col gap-3 p-4">
        <div className="w-20 h-3 rounded-full bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-px flex-1 bg-white/10" />
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.04] border border-white/6 p-2">
              <div className="w-16 h-2 rounded-full bg-white/10 mb-1" />
              <div className="w-24 h-2 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <div className="w-px flex-1 bg-white/10" />
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.04] border border-white/6 p-2">
              <div className="w-20 h-2 rounded-full bg-white/10 mb-1" />
              <div className="w-28 h-2 rounded-full bg-white/5" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
              <div className="w-px flex-1 bg-white/10" />
            </div>
            <div className="flex-1 rounded-lg bg-white/[0.04] border border-white/6 p-2">
              <div className="w-14 h-2 rounded-full bg-white/10 mb-1" />
              <div className="w-20 h-2 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Herramientas",
    desc: "Acceso rápido a las 7 calculadoras: viaje, depreciación, llantas, presión, aceite, financiamiento y autonomía.",
    wide: false,
    render: () => (
      <div className="w-full h-full flex flex-col gap-3 p-4">
        <div className="w-20 h-3 rounded-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-2 flex flex-col items-center justify-center gap-1">
            <Fuel className="w-5 h-5 text-emerald-400" />
            <div className="w-12 h-2 rounded-full bg-white/10" />
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-2 flex flex-col items-center justify-center gap-1">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <div className="w-12 h-2 rounded-full bg-white/10" />
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-2 flex flex-col items-center justify-center gap-1">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <div className="w-12 h-2 rounded-full bg-white/10" />
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/6 p-2 flex flex-col items-center justify-center gap-1">
            <Car className="w-5 h-5 text-emerald-400" />
            <div className="w-12 h-2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    ),
  },
];

const EXPANDABLE_FEATURES = [
  {
    icon: ClipboardList,
    title: "Bitácora completa",
    has: "Registro cronológico de mantenimientos, reparaciones, upgrades, gastos y documentos. Alertas automáticas por vencimiento.",
    before: "Llevas un cuaderno o notas sueltas en el celular. Pierdes facturas, olvidas fechas y no tienes evidencia de nada.",
    after: "Todo queda archivado en la nube. Facturas, fechas, costos y recordatorios en un solo lugar. Accesible desde cualquier dispositivo.",
    win: "Venderás tu auto más rápido y a mejor precio porque tendrás un historial completo que genera confianza al comprador.",
  },
  {
    icon: FileText,
    title: "Guantera digital",
    has: "SOAT, revisión técnica, tarjeta de propiedad, pólizas y otros documentos escaneados y organizados por fecha.",
    before: "Buscas papeles en cajones, correos y fotos del celular. Cada trámite es un dolor de cabeza de media hora.",
    after: "Tus documentos están siempre a mano. La app te avisa 30 días antes de cada vencimiento para que renueves a tiempo.",
    win: "Cero multas por documentos vencidos. Trámites más rápidos y una paz mental que no tiene precio.",
  },
  {
    icon: Calculator,
    title: "7 Calculadoras",
    has: "Costo de viaje, depreciación, llantas, presión de aire, aceite, financiamiento y autonomía. Con fórmulas actualizadas.",
    before: "Buscas en Google, usas Excel o haces cuentas a mano. Cada vez que necesitas un dato, pierdes 15 minutos.",
    after: "Ingresas 3 datos y obtienes el resultado exacto en segundos. Guardas cada cálculo en tu bitácora automáticamente.",
    win: "Tomarás decisiones inteligentes: sabrás si un viaje en auto es más barato que volar, o si conviene vender ahora o esperar.",
  },
  {
    icon: Store,
    title: "Marketplace",
    has: "Publica tu auto con perfil profesional, historial de mantenimiento y fotos organizadas. Compra con filtros avanzados.",
    before: "Publicas en grupos de Facebook donde nadie confía. Te piden mil fotos y al final no compran. Pierdes tiempo y paciencia.",
    after: "Tu perfil público muestra el historial completo. Los compradores confían desde el primer mensaje. Negociación más rápida.",
    win: "Venderás tu auto hasta un 15% más caro porque el historial demostrable justifica el precio y elimina dudas.",
  },
  {
    icon: Wallet,
    title: "Finanzas y gráficos",
    has: "Gráficos de gastos por categoría, evolución mensual, comparativas por año y proyecciones de mantenimiento.",
    before: "No sabes si gastas más en combustible o en reparaciones. Tu presupuesto automotriz es una caja negra.",
    after: "Visualizas cada peso. Identificas patrones, reduces gastos innecesarios y planificas con anticipación.",
    win: "Ahorrarás un promedio de S/ 1,200 al año solo por tener visibilidad real de tus gastos automotrices.",
  },
  {
    icon: Car,
    title: "Perfil público del vehículo",
    has: "QR único con historial verificado. Cualquiera escanea y ve mantenimientos, documentos y estado actual del auto.",
    before: "El comprador duda de tu palabra. No tiene forma de verificar que el auto está bien cuidado.",
    after: "Compartes un link o QR con toda la historia de tu auto. Transparencia total desde el primer contacto.",
    win: "Cerrarás ventas más rápido y con menos negociación agresiva. Tu auto se diferencia de los demás en el mercado.",
  },
];

const TESTIMONIALS = [
  { name: "Carlos R.", car: "Toyota Corolla", text: "Llevaba 3 años sin saber cuánto gastaba en mi auto. Con Blis descubrí que el 40% era en reparaciones evitables.", stars: 5, metric: "S/ 1,200", metricLabel: "ahorrados al año" },
  { name: "María G.", car: "Mazda CX-5", text: "El recordatorio del SOAT me salvó de una multa. Ahora renovó todo con 15 días de anticipación.", stars: 5, metric: "0 multas", metricLabel: "en 2 años" },
  { name: "Diego F.", car: "Honda Civic", text: "Vendí mi Civic en 8 días gracias al perfil público. El comprador dijo que el historial fue la clave.", stars: 5, metric: "+S/ 3,000", metricLabel: "en la venta" },
  { name: "Ana P.", car: "Kia Sportage", text: "Las calculadoras me ayudaron a decidir si viajar en auto o avión a Cusco. Ahorramos S/ 400 en familia.", stars: 5, metric: "S/ 400", metricLabel: "ahorrados en viaje" },
  { name: "Jorge L.", car: "Nissan Sentra", text: "La bitácora me recordó el cambio de aceite justo a tiempo. El mecánico dijo que evité una reparación mayor.", stars: 5, metric: "1 reparación", metricLabel: "evitada" },
  { name: "Lucía M.", car: "Hyundai Tucson", text: "Ahora llevo el control de 2 autos familiares desde una sola cuenta. Todo organizado y sin estrés.", stars: 5, metric: "2 autos", metricLabel: "gestionados" },
];

const FAQS = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Cancelas desde tu perfil y sigues usando Blis hasta el final del período pagado. Sin preguntas, sin letra chica." },
  { q: "¿Puedo registrar más de un auto?", a: "Sí. Puedes gestionar múltiples vehículos desde una sola cuenta. Cada auto tiene su propia bitácora, documentos y perfil independiente." },
  { q: "¿Las calculadoras funcionan offline?", a: "Las calculadoras básicas funcionan sin conexión. Los resultados se sincronizan cuando recuperas internet." },
  { q: "¿Qué tan seguros están mis datos?", a: "Tus datos se almacenan en la nube con cifrado de nivel bancario. Nunca compartimos tu información con terceros." },
  { q: "¿Necesito saber de mecánica para usar la app?", a: "No. Blis está diseñada para conductores comunes. Solo ingresas fechas, montos y kilómetros. Nosotros hacemos el resto." },
  { q: "¿El perfil público tiene costo extra?", a: "No. Generar tu perfil público y QR de historial está incluido en todos los planes. Es una herramienta de venta, no un add-on." },
];

/* ─── Component ─── */
export function AutoWebLandingClient({ plans }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail.trim()) {
      setRegisterError("Ingresa tu correo electrónico.");
      return;
    }

    const params = new URLSearchParams({
      ...(selectedPlan ? { plan: selectedPlan } : {}),
      ...(registerEmail.trim() ? { email: registerEmail.trim().toLowerCase() } : {}),
      ...(registerFirstName.trim() ? { firstName: registerFirstName.trim() } : {}),
      ...(registerLastName.trim() ? { lastName: registerLastName.trim() } : {}),
    });

    router.push(`/auto/app?${params.toString()}`);
  };

  const handleShowRegister = (planId: string) => {
    setSelectedPlan(planId);
    setRegisterEmail("");
    setRegisterFirstName("");
    setRegisterLastName("");
    setRegisterError("");
    setTimeout(() => {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const intervalLabel: Record<string, string> = {
    month: "mes",
    quarter: "trimestre",
    year: "año",
  };

  const formatPrice = (cents: number) => {
    const dollars = cents / 100;
    return dollars % 1 === 0
      ? `S/ ${Math.round(dollars).toLocaleString("es-PE")}`
      : `S/ ${dollars.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const planId = plans[0]?.id ?? "free";

  /* ─── Renders ─── */
  const renderStars = (n: number) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < n ? "text-emerald-600 fill-emerald-600" : "text-zinc-400"}`} />
    ));

  return (
    <div className="relative overflow-hidden bg-auto-gradient" style={{ minHeight: "100dvh" }}>

      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: "5%", left: "8%", delay: "0s", size: 32, rotate: 12 },
          { top: "12%", left: "25%", delay: "0.6s", size: 28, rotate: -8 },
          { top: "8%", left: "55%", delay: "1.2s", size: 36, rotate: 5 },
          { top: "18%", left: "80%", delay: "1.8s", size: 24, rotate: -15 },
          { top: "28%", left: "12%", delay: "2.4s", size: 30, rotate: 20 },
          { top: "35%", left: "45%", delay: "3s", size: 26, rotate: -10 },
          { top: "22%", left: "70%", delay: "0.3s", size: 34, rotate: 8 },
          { top: "45%", left: "5%", delay: "0.9s", size: 28, rotate: -5 },
          { top: "52%", left: "35%", delay: "1.5s", size: 32, rotate: 15 },
          { top: "48%", left: "65%", delay: "2.1s", size: 22, rotate: -12 },
          { top: "58%", left: "88%", delay: "2.7s", size: 30, rotate: 6 },
          { top: "68%", left: "20%", delay: "0.2s", size: 26, rotate: -18 },
          { top: "72%", left: "50%", delay: "0.8s", size: 34, rotate: 10 },
          { top: "78%", left: "75%", delay: "1.4s", size: 28, rotate: -6 },
          { top: "85%", left: "15%", delay: "2s", size: 24, rotate: 14 },
          { top: "88%", left: "40%", delay: "2.6s", size: 30, rotate: -4 },
          { top: "92%", left: "60%", delay: "0.4s", size: 32, rotate: 9 },
          { top: "65%", left: "92%", delay: "1s", size: 26, rotate: -14 },
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
              transform: `rotate(${item.rotate}deg)`,
              opacity: 0.15,
            }}
          >
            <Car className="w-full h-full" />
          </span>
        ))}
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/70 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/auto/web" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">B</div>
            <span className="font-extrabold text-zinc-100 text-sm">Blis Auto</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Funciones</a>
            <a href="#app" className="hover:text-emerald-400 transition-colors">App</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Precios</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </div>
          <a href="#pricing" className="text-xs font-bold bg-auto-600 hover:bg-auto-500 text-white px-4 py-2 rounded-xl shadow-auto-glow transition-all active:scale-[0.97]">
            Probar gratis
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 text-center pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/[0.03] backdrop-blur-sm border border-white/6 rounded-full px-4 py-1.5 mb-6 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold text-emerald-400 tracking-wide">
            60 días de prueba gratuita
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-100 mb-5 leading-[1.1]"
        >
          Tu auto, bajo control
          <span className="block bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            MEJOR
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8"
        >
          La bitácora inteligente, calculadoras automotrices y marketplace que todo conductor necesita. Todo en una sola app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          <button
            type="button"
            onClick={() => handleShowRegister(planId)}
            className="flex items-center gap-2 rounded-2xl bg-auto-600 hover:bg-auto-500 text-white py-4 px-8 font-extrabold text-sm shadow-auto-glow transition-all active:scale-[0.97] animate-glow-brand"
          >
            <Zap className="w-4 h-4" />
            Probar gratis — 60 días
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#app"
            className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 py-4 px-6 font-bold text-sm transition-all active:scale-[0.97]"
          >
            Ver la app
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-1 mb-2"
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse-star" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <span className="text-sm font-bold text-zinc-200 ml-2">4.9/5</span>
        </motion.div>
        <p className="text-xs text-zinc-500">
          Basado en 800+ reseñas de conductores
        </p>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative mt-12 max-w-xs mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 rounded-[3rem] blur-2xl" />
          <div className="relative bg-zinc-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-zinc-800/80">
            <div className="bg-black rounded-[2rem] overflow-hidden aspect-[9/19]">
              <div className="w-full h-full flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-3 rounded-full bg-white/10" />
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Car className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/6 p-4">
                  <div className="text-[10px] text-zinc-500 mb-1">Estado general</div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-emerald-400">94%</div>
                        <div className="text-[8px] text-zinc-500">Salud</div>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-[85%] h-full bg-emerald-500 rounded-full" />
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-[60%] h-full bg-emerald-500/60 rounded-full" />
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-[92%] h-full bg-emerald-500/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3">
                    <div className="text-[10px] text-zinc-500 mb-1">Gastos mes</div>
                    <div className="text-lg font-bold text-emerald-400">S/ 840</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3">
                    <div className="text-[10px] text-zinc-500 mb-1">Kilometraje</div>
                    <div className="text-lg font-bold text-zinc-100">42,350</div>
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/6 p-3 flex-1">
                  <div className="text-[10px] text-zinc-500 mb-2">Alertas</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <div className="w-28 h-2 rounded-full bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-emerald-500" />
                      <div className="w-20 h-2 rounded-full bg-white/10" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleCheck className="w-3 h-3 text-emerald-500" />
                      <div className="w-24 h-2 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ LIGHT SECTION: PAIN POINTS + SOLUTION PILLARS ═══ */}
      <div className="bg-zinc-50 relative">
        {/* ═══ PAIN POINTS ═══ */}
        <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">El problema</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
              ¿Te suena familiar?
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
              Millones de conductores enfrentan los mismos problemas. No es tu culpa, es falta de herramientas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAIN_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 hover:border-zinc-300 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <Icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 mb-1">{p.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ SOLUTION PILLARS ═══ */}
        <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">La solución</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
              Blis es todo lo que necesitas
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
              Tres pilares que trabajan juntos para que tu auto dure más, valga más y te cueste menos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SOLUTION_PILLARS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${s.color} rounded-[1.5rem] blur opacity-10 group-hover:opacity-25 transition-opacity`} />
                  <div className="relative bg-white rounded-[1.5rem] border border-zinc-200 shadow-sm p-6 h-full text-center">
                    <div className="w-14 h-14 mb-4 mx-auto flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-900 mb-2">{s.title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ═══ APP MOCKUPS ═══ */}
      <section id="app" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Así se ve por dentro</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2">
            Conoce la app antes de probarla
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-lg mx-auto">
            Tres vistas principales que resuelven los problemas cotidianos de todo conductor.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_MOCKUPS.map((s, i) => (
            <div key={i} className={`group relative ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[1.5rem] blur opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative card-auto-dark rounded-[1.5rem] p-3 border border-white/6 h-full overflow-hidden">
                <div className={`rounded-xl overflow-hidden bg-black mb-3 mx-auto border border-white/6 ${s.wide ? "aspect-[16/10] max-h-48" : "aspect-[9/16] max-h-[320px]"}`}>
                  {s.render()}
                </div>
                <h3 className="text-sm font-extrabold text-zinc-100 mb-1">{s.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EXPANDABLE FEATURES ═══ */}
      <section id="features" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Todo incluido</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2">
            Una app, seis superpoderes
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-lg mx-auto">
            Toca cada función para ver qué incluye, qué problema resuelve y qué vas a lograr con ella.
          </p>
        </div>
        <div className="space-y-2">
          {EXPANDABLE_FEATURES.map((f, i) => {
            const isOpen = openFeature === i;
            const Icon = f.icon;
            return (
              <div key={i} className="card-auto-dark rounded-2xl overflow-hidden transition-all border border-white/6">
                <button onClick={() => setOpenFeature(isOpen ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-sm font-bold text-zinc-100 pr-4">{f.title}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Lo que incluye</p>
                      <p className="text-xs text-zinc-300 leading-relaxed">{f.has}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 bg-white/[0.03] border border-white/6">
                        <p className="text-[10px] font-bold text-amber-500 mb-1 flex items-center gap-1">
                          <X className="w-3 h-3" /> Antes (sin Blis)
                        </p>
                        <p className="text-xs text-zinc-400 leading-relaxed">{f.before}</p>
                      </div>
                      <div className="rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                          <CircleCheck className="w-3 h-3" /> Después (con Blis)
                        </p>
                        <p className="text-xs text-zinc-300 leading-relaxed">{f.after}</p>
                      </div>
                    </div>
                    <div className="rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] font-bold text-emerald-400 mb-1">¿Qué vas a lograr?</p>
                      <p className="text-xs text-zinc-100 leading-relaxed font-medium">{f.win}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ LIGHT SECTION: TESTIMONIALS + TRUST ═══ */}
      <div className="bg-zinc-50 relative">
        {/* ═══ TESTIMONIALS ═══ */}
        <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Historias reales</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
              Lo que dicen los conductores
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[280px] bg-white rounded-2xl border border-zinc-200 shadow-sm p-5"
              >
                <div className="flex gap-0.5 mb-3">{renderStars(t.stars)}</div>
                <p className="text-sm text-zinc-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{t.name}</p>
                    <p className="text-[10px] text-zinc-500">{t.car}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-emerald-600">{t.metric}</p>
                    <p className="text-[9px] text-zinc-500">{t.metricLabel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ TRUST / GUARANTEE ═══ */}
        <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Compra con confianza</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
              Te respaldamos en cada paso
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: "Garantía 14 días", desc: "No te convence? Te devolvemos el 100% de tu dinero sin una sola pregunta. Así de seguros estamos de que Blis cambiará la forma de cuidar tu auto." },
              { icon: Lock, title: "Pago seguro", desc: "Utilizamos una pasarela de pago segura y privada certificada. Tu información financiera está cifrada y nunca la almacenamos en nuestros servidores." },
              { icon: MessageCircle, title: "Soporte 24/7", desc: "Nuestro equipo responde en menos de 24 horas. No bots, no respuestas genéricas: gente real que entiende de autos y tecnología." },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} className="text-center p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 mb-2">{t.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Precios</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2">
            Elige el plan ideal para tu auto
          </h2>
          <p className="text-sm text-zinc-400 mt-2">Inversión real en el valor y la tranquilidad de tu vehículo.</p>
        </div>

        {plans.length === 0 ? (
          <div className="text-center max-w-md mx-auto">
            <div className="card-auto-dark-elevated rounded-2xl p-8 border border-emerald-500/15">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-extrabold text-zinc-100 mb-2">Prueba gratis 60 días</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Empieza hoy sin tarjeta de crédito. Accede a todas las funciones premium y decide luego.
              </p>
              <a
                href="/auto/app"
                className="inline-flex items-center gap-2 rounded-2xl bg-auto-600 hover:bg-auto-500 text-white py-4 px-8 font-extrabold text-sm shadow-auto-glow transition-all active:scale-[0.97]"
              >
                <Zap className="w-4 h-4" />
                Probar gratis — 60 días
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className={`grid gap-5 ${plans.length === 1 ? "max-w-sm mx-auto" : plans.length === 2 ? "max-w-2xl mx-auto grid-cols-1 sm:grid-cols-2" : "max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
            {plans.map((plan, idx) => {
              const isFeatured = idx === 0;
              const price = formatPrice(plan.price_cents);
              const interval = intervalLabel[plan.billing_interval] || plan.billing_interval;

              return (
                <div key={plan.id} className={`relative group animate-scale-in ${isFeatured ? "sm:scale-105 z-10" : ""}`}>
                  {isFeatured && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[1.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  )}
                  <div className={`relative card-auto-dark rounded-[1.5rem] p-6 border overflow-hidden ${isFeatured ? "border-emerald-500/20" : "border-white/6"}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">{isFeatured ? "Oferta especial" : "Plan"}</span>
                      {plan.badge ? (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse-glow" />
                          <span className="text-[10px] font-bold text-amber-400">{plan.badge}</span>
                        </div>
                      ) : isFeatured ? (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse-glow" />
                          <span className="text-[10px] font-bold text-amber-400">Popular</span>
                        </div>
                      ) : null}
                    </div>
                    <h3 className="text-2xl font-extrabold text-zinc-100 mb-1">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-zinc-500 mb-2">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-2 mb-1">
                      {plan.original_price_cents && plan.original_price_cents > plan.price_cents && (
                        <span className="text-xl font-bold text-zinc-500 line-through decoration-red-400">{formatPrice(plan.original_price_cents)}</span>
                      )}
                      <span className="text-5xl font-extrabold text-zinc-100 tracking-tight">{price}</span>
                      <span className="text-zinc-500 font-medium">/{interval}</span>
                    </div>
                    {plan.original_price_cents && plan.original_price_cents > plan.price_cents && (
                      <p className="text-xs text-zinc-500 mb-1">Precio real {formatPrice(plan.original_price_cents)}. Hoy solo {price}. Cancela cuando quieras.</p>
                    )}

                    {plan.features.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {plan.features.slice(0, 6).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {selectedPlan === plan.id ? (
                      <form onSubmit={handleRegister} className="mt-5 space-y-3">
                        <div className="border-t border-white/6 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-extrabold text-zinc-100">Datos de cliente</p>
                            <button
                              type="button"
                              onClick={() => setSelectedPlan(null)}
                              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="email"
                              required
                              placeholder="Correo electrónico"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                required
                                placeholder="Nombre"
                                value={registerFirstName}
                                onChange={(e) => setRegisterFirstName(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                              />
                              <input
                                type="text"
                                required
                                placeholder="Apellido"
                                value={registerLastName}
                                onChange={(e) => setRegisterLastName(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                              />
                            </div>
                            {registerError && (
                              <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{registerError}</p>
                            )}
                            <button
                              type="submit"
                              disabled={registerLoading}
                              className="w-full flex items-center justify-center gap-2 rounded-xl bg-auto-600 hover:bg-auto-500 text-white py-3 font-bold text-sm shadow-auto-glow transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                              {registerLoading ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Creando cuenta...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4" />
                                  Empezar prueba gratis
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlan(plan.id);
                          setRegisterEmail("");
                          setRegisterFirstName("");
                          setRegisterLastName("");
                          setRegisterError("");
                        }}
                        className={`flex items-center justify-center gap-2 w-full rounded-xl py-3.5 font-bold text-sm shadow-lg transition-all active:scale-[0.98] relative overflow-hidden group/btn mt-5 ${isFeatured ? "bg-auto-600 hover:bg-auto-500 text-white shadow-auto-glow animate-glow-brand" : "bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10"}`}
                      >
                        <Zap className="w-4 h-4" />{plan.cta_text || "Suscribirme ahora"}<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}

                    <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                      <Lock className="w-3 h-3 text-zinc-500" />
                      Pago seguro y privado
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative z-10 px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Preguntas</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 mt-2">
            Todo lo que necesitas saber
          </h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="card-auto-dark rounded-2xl overflow-hidden transition-all border border-white/6">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-bold text-zinc-100 pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-emerald-500 transition-transform duration-300 shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-lg mx-auto text-center relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-emerald-600/10 to-emerald-500/10 blur-2xl" />
          <div className="relative rounded-[2rem] p-8 text-white border border-emerald-500/20 overflow-hidden" style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)" }}>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-extrabold">¿Qué estás esperando?</h2>
              <p className="text-sm text-white/80">
                Miles de autos ya están mejor cuidados gracias a Blis Auto. El tuyo puede ser el siguiente.
              </p>
              <button
                type="button"
                onClick={() => handleShowRegister(planId)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-4 px-8 font-extrabold text-sm shadow-xl transition-all active:scale-[0.98] hover:bg-zinc-50 animate-glow-emerald"
                style={{ color: "#065f46" }}
              >
                <Heart className="w-4 h-4 fill-current" />Prueba Blis Auto gratis por 60 días
              </button>
              <p className="text-[10px] text-white/60">Cancela cuando quieras. Sin compromiso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 px-4 pb-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />Garantía 14 días
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Lock className="w-3 h-3 text-emerald-500" />Pago seguro
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-500">
          <Link href="/legal/terminos" className="hover:text-emerald-400 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-emerald-400 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-emerald-400 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
      </footer>

      {/* ═══ CUSTOM CSS ═══ */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse-star {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(16,185,129,0.4)); }
          50% { filter: drop-shadow(0 0 8px rgba(16,185,129,0.9)); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(16,185,129,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(16,185,129,0.8)); }
        }
        @keyframes glow-brand {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3), 0 4px 15px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 35px rgba(16,185,129,0.5), 0 0 50px rgba(5,150,105,0.2), 0 4px 15px rgba(0,0,0,0.1); }
        }
        @keyframes glow-emerald {
          0%, 100% { box-shadow: 0 0 15px rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 30px rgba(16,185,129,0.6), 0 0 50px rgba(16,185,129,0.2); }
        }
        @keyframes icon-pulse {
          0%, 100% { opacity: 0.12; transform: scale(0.92); }
          50% { opacity: 0.32; transform: scale(1.12); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        .animate-pulse-star {
          animation: pulse-star 2s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-glow-brand {
          animation: glow-brand 3s ease-in-out infinite;
        }
        .animate-glow-emerald {
          animation: glow-emerald 2.5s ease-in-out infinite;
        }
        .animate-icon-pulse {
          animation: icon-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
