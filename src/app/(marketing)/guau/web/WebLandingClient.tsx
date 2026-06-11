"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
  Heart,
  ChevronDown,
  Dog,
  Bone,
  PawPrint,
  Activity,
  GraduationCap,
  MapPin,
  ScanLine,
  Scale,
  CalendarDays,
  Pill,
  Stethoscope,
  Smartphone,
  TrendingUp,
  Award,
  Users,
  Lock,
  MessageCircle,
  Flame,
  Target,
  X,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price_cents: number;
  billing_interval: string;
  features: string[];
}

interface Props {
  plans: Plan[];
}

/* ─── Data ─── */
const PAIN_POINTS = [
  { icon: <img src="/icons/problema-sobrepeso-canino.webp" alt="Sobrepeso canino" className="w-20 h-20 object-contain" />, title: "Sobrepeso canino", desc: "El 56% de los perros en Latinoamérica tienen sobrepeso por croquetas procesadas." },
  { icon: <img src="/icons/problema-enfermedades-evitables.webp" alt="Enfermedades evitables" className="w-20 h-20 object-contain" />, title: "Enfermedades evitables", desc: "Diabetes, alergias y problemas renales causados por mala alimentación." },
  { icon: <img src="/icons/problema-falta-ejercicio.webp" alt="Falta de ejercicio" className="w-20 h-20 object-contain" />, title: "Falta de ejercicio", desc: "Paseos sin control que no ejercitan correctamente a tu perro." },
  { icon: <img src="/icons/problema-vet-caro.webp" alt="Vet caro e impredecible" className="w-20 h-20 object-contain" />, title: "Vet caro e impredecible", desc: "Visitas de emergencia que podrían evitarse con prevención." },
];

const SOLUTION_PILLARS = [
  { icon: <img src="/icons/solucion-nutricion-mixta.webp" alt="Nutrición Mixta" className="w-24 h-24 object-contain" />, title: "Nutrición Mixta Inteligente", desc: "150+ recetas personalizadas. Calculadora automática que ajusta la ración según peso, edad y actividad.", color: "from-secondary-400 to-secondary-600" },
  { icon: <img src="/icons/solucion-academia-canina.webp" alt="Academia Canina" className="w-24 h-24 object-contain" />, title: "Academia Canina Pro", desc: "Entrenamiento gamificado estilo Duolingo. Obediencia, agilidad, seguridad y socialización paso a paso.", color: "from-primary-400 to-primary-600" },
  { icon: <img src="/icons/solucion-tracker-salud.webp" alt="Tracker de Salud" className="w-24 h-24 object-contain" />, title: "Tracker de Salud 360°", desc: "Vacunas, peso, visitas, medicamentos y veterinarios. Todo el historial médico en un solo lugar.", color: "from-accent-400 to-accent-600" },
];

const SCREENSHOTS = [
  { src: "/icons/screen Home pantalla principal.png", title: "Dashboard Principal", desc: "Vista general del día: peso actual, ración Mixta de hoy, próximas tareas y alertas de salud. Todo lo importante al abrir la app.", wide: false },
  { src: "/icons/screen seleccion de mascotas.png", title: "Selector de Mascotas", desc: "Cambia de perfil en un toque. Cada perro con su propia dieta, entrenamiento y calendario de salud independiente. Úsalo hasta en 4 perros.", wide: true },
  { src: "/icons/screen de nutricion.png", title: "Nutrición Mixta", desc: "Menús personalizados con gramos exactos, macros diarios y calculadora inteligente que ajusta la ración según peso y actividad.", wide: false },
  { src: "/icons/screen de perfil.png", title: "Perfil de tu Perro", desc: "Ficha completa con edad, raza, peso histórico, objetivos y recordatorios médicos en un solo lugar.", wide: false },
  { src: "/icons/Screen de academia.png", title: "Academia de Entrenamiento", desc: "Lecciones gamificadas estilo Duolingo. Obediencia, agilidad, seguridad y socialización paso a paso.", wide: false },
];

const EXPANDABLE_FEATURES = [
  {
    icon: <img src="/icons/feature-hasta-4-perros.webp" alt="Hasta 4 perros" className="w-20 h-20 object-contain" />,
    title: "Hasta 4 perros",
    has: "Registra todos tus perros sin restricciones. Cada uno con perfil propio de salud, nutrición y entrenamiento.",
    before: "Tienes 2 o 3 perros y usas notas de papel o apps separadas. Se te olvida quién ya comió o cuándo le toca vacuna a cada uno.",
    after: "Controlas a toda la manada desde un solo lugar. Un cambio de perfil y ves exactamente lo que necesita ese perro hoy.",
    win: "Lograrás tranquilidad doméstica. Nada de caos ni olvidos: cada perro recibe lo que le corresponde exactamente cuando le toca.",
  },
  {
    icon: <img src="/icons/feature-150-recetas.webp" alt="150+ recetas" className="w-20 h-20 object-contain" />,
    title: "150+ recetas Mixta",
    has: "Recetario completo con menús personalizados según edad, raza, peso y nivel de actividad física.",
    before: "Das croquetas porque no sabes qué cantidad de carne, hueso o verdura necesita. Temes que le falte calcio o proteína.",
    after: "Tienes menús semanales listos para comprar y preparar. Gramos exactos, proporciones balanceadas y variación real.",
    win: "Verás a tu perro con energía de sobra, pelaje brillante y digestión perfecta. Dejarás de tirar dinero en comida procesada que lo enferma.",
  },
  {
    icon: <img src="/icons/feature-reto-transicion.webp" alt="Reto de transición" className="w-20 h-20 object-contain" />,
    title: "Reto de Transición de Comida",
    has: "Transición guiada de croquetas a alimentación natural con seguimiento diario y checklists automáticas.",
    before: "Cambias de dieta de golpe y tu perro tiene diarrea o vómitos. No sabes si es normal o peligroso, así que vuelves a las croquetas.",
    after: "Una ruta paso a paso que respeta el sistema digestivo de tu perro. Monitoreas heces, energía y sed día a día.",
    win: "Tu perro dejará de oler mal, tendrá aliento fresco y heces compactas y sin olor. Notarás el cambio en días, no en meses.",
  },
  {
    icon: <img src="/icons/feature-academia-canina.webp" alt="Academia canina" className="w-20 h-20 object-contain" />,
    title: "Academia Canina completa",
    has: "Obediencia básica, agilidad, seguridad y socialización. Lecciones en video paso a paso como un Duolingo para perros.",
    before: "Intentas con videos de YouTube pero cada entrenador dice algo distinto. Tu perro se confunde, tú te frustras y abandonas.",
    after: "Una ruta de aprendizaje progresiva y gamificada. Sabes exactamente qué practicar hoy, durante cuánto tiempo y cómo reforzarlo.",
    win: "Tendrás un perro que obedece en el parque, que no tira de la correa y que te mira buscando instrucciones. La relación cambia por completo.",
  },
  {
    icon: <img src="/icons/feature-graficos-avanzados.webp" alt="Gráficos avanzados" className="w-20 h-20 object-contain" />,
    title: "Gráficos avanzados",
    has: "Análisis visual de salud, evolución de peso, estadísticas de paseos y progreso de entrenamiento.",
    before: "No sabes si tu perro está subiendo o bajando de peso de forma saludable. Todo es a ojo y suposición.",
    after: "Curvas claras de evolución. Ves tendencias antes de que se vuelvan problemas. Tomas decisiones con datos, no con intuición.",
    win: "Detectarás sobrepeso o deshidratación semanas antes de que sea un problema. Ahorrarás cientos en visitas veterinarias de emergencia.",
  },
  {
    icon: <img src="/icons/feature-escaner-alimentos.webp" alt="Escáner de alimentos" className="w-20 h-20 object-contain" />,
    title: "Escáner de alimentos",
    has: "Verifica en segundos si un alimento es seguro, tóxico o debe darse con precaución.",
    before: "Le das un pedazo de lo que comes sin saber si es veneno para él. Uvas, chocolate, cebolla... un descuido puede costar miles o su vida.",
    after: "Escaneas o buscas el alimento antes de compartir. La app te dice sí, no o cuidado, con explicación médica.",
    win: "Eliminarás el riesgo de intoxicación alimentaria. Dormirás tranquilo sabiendo que nada en tu casa puede dañarlo por accidente.",
  },
  {
    icon: <img src="/icons/feature-tracker-salud.webp" alt="Tracker de salud" className="w-20 h-20 object-contain" />,
    title: "Tracker de salud 360°",
    has: "Vacunas, peso, visitas veterinarias, medicamentos y desparasitaciones con recordatorios automáticos.",
    before: "Olvidas la vacuna anual hasta que el vet te llama, o peor, hasta que tu perro se enferma de algo prevenible.",
    after: "Alertas automáticas antes de que venza cualquier protección. Historial médico completo siempre a mano, incluso de viaje.",
    win: "Tu perro estará protegido siempre a tiempo. Un historial completo también ayuda al veterinario a diagnosticar más rápido y mejor.",
  },
  {
    icon: <img src="/icons/feature-mapa-paseos.webp" alt="Mapa de paseos" className="w-20 h-20 object-contain" />,
    title: "Mapa de paseos",
    has: "Registra rutas, distancia, tiempo y calorías. Encuentra parques dog-friendly cerca de ti.",
    before: "Paseas 'lo que da la gana'. Un día 10 minutos, otro 40. No sabes si realmente se está ejercitando lo suficiente.",
    after: "Rutas trazadas, metas semanales de kilometraje y descubrimiento de zonas seguras para soltarlo.",
    win: "Un perro cansado es un perro feliz y obediente. Reducirás drásticamente comportamientos destructivos en casa por exceso de energía.",
  },
  {
    icon: <img src="/icons/feature-badges-logros.webp" alt="Badges y logros" className="w-20 h-20 object-contain" />,
    title: "Badges y logros",
    has: "Sistema de gamificación que premia la constancia en alimentación, paseos y entrenamiento.",
    before: "Empiezas motivado pero a los 5 días olvidas el entrenamiento. No hay nadie que te pregunte por tu progreso.",
    after: "Rachas diarias, niveles desbloqueados y recompensas visibles que te empujan a no romper el hábito.",
    win: "Crearás una rutina sólida sin depender solo de fuerza de voluntad. La app se convierte en tu compañera de disciplina.",
  },
  {
    icon: <img src="/icons/feature-objetivos-personalizados.webp" alt="Objetivos personalizados" className="w-20 h-20 object-contain" />,
    title: "Objetivos personalizados",
    has: "Define metas de peso, paseos y entrenamiento con seguimiento automático de tu avance.",
    before: "Dices 'este mes lo pongo a dieta' pero no hay plan, ni número, ni fecha límite. Fracaso seguro.",
    after: "Metas SMART para tu perro: bajar 2kg en 8 semanas, 15 minutos de obediencia diaria, 12km de paseo semanal.",
    win: "Cada pequeño logro visible te mantendrá motivado. Verás resultados reales y medibles en vez de promesas vacías.",
  },
  {
    icon: <img src="/icons/feature-disponible-todos-lados.webp" alt="Disponible en todos lados" className="w-20 h-20 object-contain" />,
    title: "Disponible en todos lados",
    has: "Aplicación web. Ábrela desde cualquier navegador en tu computadora, tablet o celular. Sin instalar nada.",
    before: "Tus datos quedan en el celular de tu pareja o se pierden si cambias de teléfono. Nadie más puede ayudarte a pasearlo.",
    after: "Accedes desde cualquier dispositivo. Tu pareja, tu hijo o el paseador pueden ver la misma información actualizada al instante.",
    win: "Toda la familia participa en el cuidado del perro. No hay más 'yo no sabía que ya comió' o 'se me olvidó su medicina'.",
  },
];

const SUCCESS_STORIES = [
  {
    tag: "Obediencia básica",
    title: "De paseos vergonzosos a caminatas orgullosas",
    story: "Jorge tenía vergüenza de sacar a su Pitbull, Thor. Tiraba de la correa, ladraba a otros perros y no le hacía caso ni sentado. Sentía que lo juzgaban. Con la Academia Canina de Blis, siguió la ruta de Obediencia I durante 21 días. Empezó con 'mira' y 'sentado' en casa, sin distracciones. A la semana 3, Thor caminaba al pie sin tirar. Ahora pasean por el parque todos los días y otros dueños le preguntan quién lo entrenó.",
    reflection: "Si tu perro no te obedece en casa, no te obedecerá en la calle. La obediencia básica no es un lujo: es seguridad para él y tranquilidad para ti. Imagina cruzar la calle sabiendo que tu perro se quedará quieto al primer comando.",
    icon: <img src="/icons/historia-obediencia-basica.webp" alt="Obediencia básica" className="w-24 h-24 object-contain" />,
  },
  {
    tag: "Perro de seguridad",
    title: "Un guardián que obedece antes de proteger",
    story: "La familia de Ana adoptó un Pastor Alemán para protección, pero Bruno creció desconfiado y reactivo. Ladraba a todos, incluso a los visitantes amigos. Ana usó el módulo de Seguridad de Blis y descubrió que primero debía enseñarle obediencia firme. Tras dominar 'quieto', 'deja' y 'a tu lugar', Bruno pudo aprender a distinguir entre visita normal e intruso. Hoy es un perro seguro y predecible.",
    reflection: "Un perro agresivo sin control no protege: pone en riesgo a todos. La seguridad canina empieza por el autocontrol. Si sueñas con un perro que cuide tu hogar, primero necesitas un perro que te escuche.",
    icon: <img src="/icons/historia-perro-seguridad.webp" alt="Perro de seguridad" className="w-24 h-24 object-contain" />,
  },
  {
    tag: "Agilidad y deporte",
    title: "De perro ansioso a atleta feliz",
    story: "Luna, una Frenchie hiperactiva, destruía zapatos y muebles por aburrimiento. Su dueña, Lucía, pensaba que los paseos bastaban. En Blis descubrió el módulo de Agilidad: túnel, slalom y saltos bajos adaptados para razas pequeñas. Empezaron con 10 minutos diarios en el patio. A las 4 semanas, Luna dormía tranquila toda la noche. El vínculo entre ellas cambió por completo.",
    reflection: "Un perro físicamente cansado es un perro mentalmente calmado. La agilidad no es solo para competencias: es terapia física y emocional. Imagina llegar a casa y que tu perro te reciba contento, no con ansiedad destructiva.",
    icon: <img src="/icons/historia-agilidad-deporte.webp" alt="Agilidad y deporte" className="w-24 h-24 object-contain" />,
  },
  {
    tag: "El entrenador primero",
    title: "Cuando el dueño cambia, el perro transforma",
    story: "María llevaba 6 meses intentando que Max, su Labrador, bajara de peso. Compraba comida 'light' pero seguía dándole trozos de pan en la cena. En Blis entendió que el problema no era la dieta del perro, era su propia disciplina. El Reto de Transición de Comida le enseñó a ella, no solo a Max, a crear horarios reales. María bajó 3kg de sobrepeso en 2 meses, pero lo más valioso fue que ella se convirtió en la líder que Max necesitaba.",
    reflection: "El perro refleja al dueño. Si tú no tienes rutina, paciencia o constancia, tu perro tampoco las tendrá. La app no solo entrena perros: te entrena a TI para que seas el guía que tu compañero merece.",
    icon: <img src="/icons/historia-entrenador-primero.webp" alt="Entrenador primero" className="w-24 h-24 object-contain" />,
  },
];

const TESTIMONIALS = [
  { name: "María G.", dog: "Max (Labrador)", text: "Mi perro bajó 3kg en 2 meses con las recetas Mixta. Increíble app.", stars: 5, metric: "-3kg", metricLabel: "de peso en 2 meses" },
  { name: "Carlos R.", dog: "Thor (Pitbull)", text: "La academia me ayudó a entrenar a mi pitbull. Antes no obedecía ni sentado.", stars: 5, metric: "100%", metricLabel: "obediencia básica" },
  { name: "Lucía M.", dog: "Luna (Frenchie)", text: "El escáner de alimentos me salvó de darle uvas a mi perrita. Gracias Blis.", stars: 5, metric: "1", metricLabel: "emergencia evitada" },
  { name: "Diego F.", dog: "Rocky (Golden)", text: "El tracker de salud me recordó la vacuna anual justo a tiempo. Es mi veterinario digital.", stars: 5, metric: "0", metricLabel: "vacunas atrasadas" },
  { name: "Ana P.", dog: "Coco (Mestizo)", text: "El reto detox cambió la digestión de Coco. No más gases ni heces blandas.", stars: 5, metric: "100%", metricLabel: "digestión mejorada" },
  { name: "Jorge L.", dog: "Simba (Pastor)", text: "Los gráficos de peso y actividad me ayudaron a bajarle 2kg a Simba de forma saludable.", stars: 5, metric: "-2kg", metricLabel: "peso saludable" },
];

const BEFORE_AFTER = [
  { label: "Antes", title: "Alimentación desordenada", desc: "Croquetas procesadas, sobrealimentación por ansiedad, golosinas sin control y un perro con sobrepeso, mal aliento y heces enormes.", bad: true, icon: <img src="/icons/antes-despues-alimentacion-desordenada.webp" alt="Alimentación desordenada" className="w-20 h-20 object-contain" /> },
  { label: "Después", title: "Dieta Mixta estructurada", desc: "Recetas balanceadas con gramos exactos, menús semanales claros y un perro con energía estable, pelaje brillante y digestión perfecta.", bad: false, icon: <img src="/icons/antes-despues-dieta-mixta.webp" alt="Dieta Mixta" className="w-20 h-20 object-contain" /> },
  { label: "Antes", title: "Entrenamiento caótico", desc: "Videos contradictorios, métodos que no se adaptan a tu raza, frustración diaria y un perro que te ignora hasta con premio en la mano.", bad: true, icon: <img src="/icons/antes-despues-entrenamiento-caotico.webp" alt="Entrenamiento caótico" className="w-20 h-20 object-contain" /> },
  { label: "Después", title: "Academia gamificada", desc: "Lecciones diarias progresivas, seguimiento visual de avance, logros desbloqueables y un perro que obedece en casa y en la calle.", bad: false, icon: <img src="/icons/antes-despues-academia-gamificada.webp" alt="Academia gamificada" className="w-20 h-20 object-contain" /> },
  { label: "Antes", title: "Salud reactiva", desc: "Vet solo en emergencias costosas, vacunas olvidadas, historial disperso en papeles y un perro expuesto a enfermedades prevenibles.", bad: true, icon: <img src="/icons/antes-despues-salud-reactiva.webp" alt="Salud reactiva" className="w-20 h-20 object-contain" /> },
  { label: "Después", title: "Salud preventiva", desc: "Recordatorios automáticos, historial completo siempre en el celular, alertas inteligentes y un perro protegido antes de que algo pase.", bad: false, icon: <img src="/icons/antes-despues-salud-preventiva.webp" alt="Salud preventiva" className="w-20 h-20 object-contain" /> },
];

const FAQS = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Cancelas desde tu perfil y sigues usando Blis hasta el final del período pagado. Sin preguntas, sin letra chica." },
  { q: "¿Qué pasa si tengo más de un perro?", a: "Puedes registrar hasta 4 perros. Cada uno con su propio perfil de salud, nutrición y entrenamiento independiente." },
  { q: "¿Las recetas son difíciles de preparar?", a: "No. Te damos ingredientes exactos en gramos, paso a paso, y tiempo de preparación. Desde principiantes hasta expertos en alimentación mixta." },
  { q: "¿Es seguro pagar con tarjeta?", a: "Sí. Usamos una pasarela de pago segura y privada. Tus datos nunca tocan nuestros servidores." },
  { q: "¿Necesito saber de nutrición para usar las herramientas?", a: "No. Solo ingresas el peso de tu perro y su nivel de actividad. Blis calcula automáticamente la ración diaria ideal." },
  { q: "¿La academia funciona para cualquier raza?", a: "Sí. Los programas se adaptan al tamaño, edad y temperamento de tu perro. Desde cachorros hasta adultos mayores." },
];

/* ─── Component ─── */
export function WebLandingClient({ plans }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          firstName: registerFirstName,
          lastName: registerLastName,
          sourceApp: "guau",
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.existing) {
          setRegisterError(data.message || "Ya tienes una cuenta. Inicia sesión para continuar.");
        } else {
          router.push(`/guau/web/checkout?plan=${planId}`);
        }
      } else {
        setRegisterError(data.error || "Error al crear la cuenta. Intenta de nuevo.");
      }
    } catch {
      setRegisterError("Error de conexión. Verifica tu internet.");
    }
    setRegisterLoading(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setTimeout(() => {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const target = 2847;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const quarterly = plans.find((p) => p.billing_interval === "quarter");
  const planId = quarterly?.id ?? "quarterly";

  /* ─── Renders ─── */
  const renderStars = (n: number) =>
    [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < n ? "text-warning-400 fill-warning-400" : "text-zinc-300"}`} />
    ));

  return (
    <div className="relative overflow-hidden bg-primary-50" style={{ minHeight: "100dvh" }}>

      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { type: "bone", top: "3%", left: "5%", delay: "0s", size: 44, rotate: 15 },
          { type: "paw", top: "8%", left: "28%", delay: "0.4s", size: 40, rotate: -10 },
          { type: "dog-head", top: "5%", left: "55%", delay: "0.8s", size: 52, rotate: 5 },
          { type: "dog-body", top: "12%", left: "82%", delay: "1.2s", size: 42, rotate: -5 },
          { type: "bone", top: "18%", left: "15%", delay: "1.6s", size: 36, rotate: 25 },
          { type: "paw", top: "22%", left: "42%", delay: "2s", size: 48, rotate: 12 },
          { type: "dog-head", top: "16%", left: "72%", delay: "2.4s", size: 38, rotate: -8 },
          { type: "dog-body", top: "28%", left: "8%", delay: "2.8s", size: 46, rotate: 18 },
          { type: "bone", top: "32%", left: "35%", delay: "3.2s", size: 40, rotate: -15 },
          { type: "paw", top: "26%", left: "62%", delay: "0.2s", size: 36, rotate: 8 },
          { type: "dog-head", top: "38%", left: "88%", delay: "0.6s", size: 44, rotate: -12 },
          { type: "dog-body", top: "42%", left: "18%", delay: "1s", size: 50, rotate: 6 },
          { type: "bone", top: "48%", left: "48%", delay: "1.4s", size: 42, rotate: -20 },
          { type: "paw", top: "52%", left: "75%", delay: "1.8s", size: 38, rotate: 15 },
          { type: "dog-head", top: "58%", left: "5%", delay: "2.2s", size: 46, rotate: -6 },
          { type: "dog-body", top: "62%", left: "32%", delay: "2.6s", size: 40, rotate: 10 },
          { type: "bone", top: "68%", left: "58%", delay: "3s", size: 48, rotate: -18 },
          { type: "paw", top: "72%", left: "85%", delay: "0.1s", size: 44, rotate: 22 },
          { type: "dog-head", top: "78%", left: "22%", delay: "0.5s", size: 36, rotate: -15 },
          { type: "dog-body", top: "82%", left: "50%", delay: "0.9s", size: 42, rotate: 8 },
          { type: "bone", top: "88%", left: "70%", delay: "1.3s", size: 40, rotate: -12 },
          { type: "paw", top: "92%", left: "12%", delay: "1.7s", size: 46, rotate: 18 },
          { type: "dog-head", top: "95%", left: "38%", delay: "2.1s", size: 38, rotate: -8 },
          { type: "dog-body", top: "35%", left: "92%", delay: "2.5s", size: 44, rotate: 5 },
          { type: "bone", top: "45%", left: "2%", delay: "2.9s", size: 36, rotate: 25 },
          { type: "paw", top: "15%", left: "95%", delay: "3.3s", size: 40, rotate: -5 },
          { type: "dog-head", top: "65%", left: "45%", delay: "0.3s", size: 50, rotate: 12 },
          { type: "dog-body", top: "85%", left: "78%", delay: "0.7s", size: 36, rotate: -10 },
          { type: "bone", top: "55%", left: "25%", delay: "1.1s", size: 42, rotate: 8 },
          { type: "paw", top: "75%", left: "60%", delay: "1.5s", size: 38, rotate: -18 },
        ].map((item, i) => {
          const iconSVGs: Record<string, React.ReactNode> = {
            bone: (
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
                <path d="m59.68062 19.54655c-2.55522-6.55865-9.77192-6.23484-13.60662-4.75463a.888.888 0 0 1 -.64867-1.65317 17.55409 17.55409 0 0 1 5.3768-.96869c-.70208-2.16851-2.70173-6.89659-7.07435-7.94529-4.17906-1.1676-9.60714 2.604-8.85174 7.14551.62211 4.2125-.02671 7.58968-1.93745 10.0337-2.15074 2.75511-9.73159 10.32709-11.5891 11.58024a13.94224 13.94224 0 0 1 -9.98937 1.9019c-4.54112-.74606-8.31419 4.66788-7.14528 8.85178 1.05747 4.38144 5.79444 6.38109 7.95406 7.08323a17.8057 17.8057 0 0 1 .9598-5.38573.888.888 0 0 1 1.65307.6488 14.97573 14.97573 0 0 0 -.84434 6.02571 8.614 8.614 0 0 0 5.64349 7.59856 7.23224 7.23224 0 0 0 5.80346-.79988 8.11376 8.11376 0 0 0 3.66162-6.96765v-3.17279a10.14762 10.14762 0 0 1 2.995-7.24321l9.47388-9.47388a10.14772 10.14772 0 0 1 7.24321-2.995h3.17279c6.05349.01531 9.10939-5.50306 7.74974-9.50951z" />
              </svg>
            ),
            paw: (
              <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
                <path d="m272.142 239.877c25.95 25.945 39.652 62.674 38.573 103.424-.985 39.23-15.626 80.567-41.154 116.39-15.392 21.539-38.62 33.819-63.913 33.819-.422 0-.845 0-1.267-.009-26.513-.422-48.099-14.04-59.173-37.353-9.15-19.356-21.633-36.977-37.024-52.36-15.345-15.368-32.989-27.827-52.322-37.02-23.322-11.061-36.931-32.628-37.353-59.169-.422-25.781 11.919-49.521 33.787-65.142 35.852-25.546 77.146-40.178 116.423-41.187 40.73-1.04 77.473 12.662 103.423 38.607zm-192.161-75.738c7.039 3.942 14.876 5.903 22.994 5.903 7.931 0 16.143-1.854 24.354-5.579 15.298-6.964 28.719-19.822 37.822-36.222 9.15-16.391 12.998-34.603 10.84-51.271-2.346-18.081-11.309-32.299-25.246-40.061-13.937-7.761-30.783-7.869-47.348-.319-15.298 6.96-28.765 19.831-37.869 36.222-9.104 16.386-12.952 34.598-10.793 51.266 2.3 18.081 11.262 32.304 25.246 40.061zm187.703 12.342c4.599-.01 9.432-.46 14.359-1.38 19.897-3.731 39.887-14.819 56.311-31.243 16.377-16.41 27.499-36.41 31.206-56.306 4.083-21.633-.892-40.722-13.937-53.753-12.999-13.031-32.098-17.987-53.73-13.927-19.896 3.721-39.887 14.819-56.311 31.229s-27.499 36.409-31.253 56.311c-4.035 21.628.892 40.718 13.938 53.758 10.089 10.06 23.744 15.311 39.417 15.311zm207.412 184.779c-7.743-13.937-22.008-22.909-40.075-25.241-16.659-2.149-34.866 1.689-51.243 10.802-16.424 9.118-29.282 22.572-36.227 37.869-7.555 16.579-7.461 33.402.329 47.348 7.743 13.942 21.961 22.909 40.027 25.241 3.051.389 6.101.582 9.245.582 13.983 0 28.625-3.923 42.045-11.38 16.377-9.122 29.235-22.571 36.227-37.874 7.555-16.579 7.415-33.397-.328-47.339 0 .002 0 .002 0-.008zm3.097-204.901c-12.999-13.031-32.098-17.977-53.73-13.928-19.896 3.731-39.887 14.819-56.311 31.229-16.424 16.419-27.499 36.419-31.252 56.321-4.036 21.628.892 40.717 13.937 53.749 10.089 10.07 23.744 15.312 39.417 15.312 4.599 0 9.432-.46 14.312-1.38 19.896-3.73 39.934-14.819 56.357-31.229 16.377-16.424 27.499-36.424 31.206-56.32 4.036-21.633-.891-40.713-13.936-53.754z" />
              </svg>
            ),
            "dog-head": (
              <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full">
                <path d="m341.6 224.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.7-1.4-1.4-1.4z" />
                <path d="m291.7 296.9v-15.4c0-2.5-2.1-4.6-4.6-4.6h-62.2c-2.5 0-4.6 2.1-4.6 4.6v15.4c0 19.7 16 35.7 35.7 35.7 19.7 0 35.7-16 35.7-35.7z" />
                <path d="m170.4 224.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4z" />
                <path d="m136.3 78.1c-75 6.2-108.5 26.4-123.4 43.8-13 15-13.9 30.2-12.3 40.3 6.6 43.5 17.7 104.5 23.7 137 .2 1 .8 1.4 1.3 1.6s1.3.3 2.1-.3c6.8-5.5 11.9-9.1 17.4-13 5.1-3.6 10.4-7.3 17.6-13.1 0-1.7 0-3.4 0-5.2 0-43.5 12.3-95.4 32.2-135.4 11.9-24.2 26-43 41.4-55.7z" />
                <path d="m376.1 78.1c15.3 12.6 29.2 31 41 54.7 19.9 39.7 32.2 92 32.2 136.4v7.1c6.9 5.4 12.1 8.6 17.1 11.7 5.3 3.3 10.8 6.7 17.9 12.4.8.6 1.5.5 2.1.3.5-.2 1.2-.6 1.3-1.6 6-32.5 17.1-93.5 23.7-137 1.5-10.1.6-25.3-12.3-40.3-14.9-17.3-48.3-37.5-123-43.7z" />
                <path d="m326.1 76.1h-70.1-70.1c-37.3 0-63.2 41-75.4 65.4-18.7 37.8-30.4 86.7-30.4 127.6 0 103.3 8.5 166.7 175.8 166.7s175.8-63.3 175.8-166.7c0-41.8-11.6-91.1-30.4-128.5-11.9-24-37.7-64.5-75.2-64.5zm-174.7 150.1c0-10.5 8.5-19 19-19s19 8.5 19 19-8.5 19-19 19c-10.4 0-19-8.5-19-19zm168.5 159.3c-31.4 0-51.6-9.7-63.9-19.2-12.3 9.5-32.5 19.2-63.9 19.2-4.9 0-8.8-3.9-8.8-8.8s3.9-8.8 8.8-8.8c25.2 0 41.4-7.1 51.3-14.1-2.3-3-3.4-5.1-3.6-5.4-.1-.2-.2-.5-.3-.7-21.3-7-36.8-27.1-36.8-50.7v-15.4c0-12.2 10-22.2 22.2-22.2h62.2c12.2 0 22.2 10 22.2 22.2v15.4c0 23.6-15.5 43.7-36.8 50.7-.1.2-.2.5-.3.7-.2.3-1.3 2.4-3.6 5.4 9.9 7 26 14.1 51.3 14.1 4.9 0 8.8 3.9 8.8 8.8-.1 4.8-4 8.8-8.8 8.8zm21.7-140.3c-10.5 0-19-8.5-19-19s8.5-19 19-19 19 8.5 19 19-8.6 19-19 19z" />
              </svg>
            ),
            "dog-body": (
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
                <path d="m17.61 50.9a1.689 1.689 0 0 0 .34-.1l-.65-4.77a5.154 5.154 0 0 0 -1.58-2.97 10.367 10.367 0 0 1 -1.8-2.31 47.485 47.485 0 0 1 -.52 8.95c-.21 1.4-1.97 1.3-2.13 1.29a2.5 2.5 0 0 0 .26 4.98h3.91a2.992 2.992 0 0 1 -.8-2.13 3.038 3.038 0 0 1 2.97-2.94z" />
                <path d="m53.57 51.32-.14-1.96a1.688 1.688 0 0 0 -1-1.41c-2.23-1.03-5.2-2.85-6.76-5.7a4.471 4.471 0 0 0 -3.91-2.29c.98 2.3 3.47 6.94 8.22 8.95a.623.623 0 0 1 .23.55v1.76a.781.781 0 0 1 -.78.78h-.67a1.985 1.985 0 0 0 0 3.97h2.93a2.808 2.808 0 0 1 -.68-1.83 2.842 2.842 0 0 1 2.56-2.82z" />
                <path d="m62.476 32.259c-.8-2.476-2.046-4.147-3.7-4.964a5.343 5.343 0 0 0 -3.508-.418 11.331 11.331 0 0 0 -12.806-4.7c-5.39 1.5-14.18.27-15.16-.68a13.318 13.318 0 0 1 -4.26-7.3c-.525-3.324-3.747-6.423-6.77-6.16-2.26.1-4.14 1.18-6.69 3.84-1.55 1.61-4.5 2.42-6.13 2.76a2.417 2.417 0 0 0 -1.91 2.79 5.429 5.429 0 0 0 3.51 4.49 24.175 24.175 0 0 0 6.55 1.35 52.594 52.594 0 0 1 1.45 6.92c-.29 3.03-.24 8.65 3.37 12.16a6.1 6.1 0 0 1 1.87 3.54l.67 4.9a.862.862 0 0 1 -.19.64 1.939 1.939 0 0 1 -1.09.47 2.033 2.033 0 0 0 -2.04 1.96 2.055 2.055 0 0 0 2.04 2.11h3.11a3.134 3.134 0 0 0 2.97-2.12 18.3 18.3 0 0 0 .74-8.88 3.324 3.324 0 0 1 2.05-3.64c.06-.03 5.68-2.37 15.17-2.37a5.488 5.488 0 0 1 4.83 2.81c1.43 2.62 4.21 4.31 6.29 5.27a2.683 2.683 0 0 1 1.59 2.25l.16 2.21a.762.762 0 0 1 -.75.81 1.83 1.83 0 0 0 0 3.66h2.78a2.657 2.657 0 0 0 2.66-2.65v-6.337a6.874 6.874 0 0 0 -.5-2.65c-1.43-3.42-1.45-10.31-1.45-10.4a13.152 13.152 0 0 0 -1.532-6.13 4.354 4.354 0 0 1 2.544.4c1.4.7 2.466 2.165 3.177 4.366a.5.5 0 0 0 .952-.307zm-49.208-18.348-.513.512a.5.5 0 0 1 -.707-.707l.513-.512a.5.5 0 0 1 .707.707zm9.094 9.628a1.994 1.994 0 0 1 -1.254 1.633c-3.25 1.137-6.46-1.282-5.889-6.141a.5.5 0 1 1 .993.12c-.634 3.231 1.751 6.138 4.481 5.111a1.028 1.028 0 0 0 .673-.806c.191-2.291-2.282-7.268-2.306-7.318a.5.5 0 0 1 .894-.448c.107.215 2.622 5.279 2.408 7.849z" />
              </svg>
            ),
          };
          return (
            <span
              key={i}
              className="absolute animate-icon-pulse select-none text-zinc-400"
              style={{
                top: item.top,
                left: item.left,
                width: item.size,
                height: item.size,
                animationDelay: item.delay,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              {iconSVGs[item.type]}
            </span>
          );
        })}
      </div>

      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-zinc-100" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/guau/web" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-extrabold text-sm">B</div>
            <span className="font-extrabold text-zinc-900 text-sm">Blis Club</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-zinc-500">
            <a href="#features" className="hover:text-primary-500 transition-colors">Funciones</a>
            <a href="#screenshots" className="hover:text-primary-500 transition-colors">App</a>
            <a href="#pricing" className="hover:text-primary-500 transition-colors">Precios</a>
            <a href="#faq" className="hover:text-primary-500 transition-colors">FAQ</a>
          </div>
          <a href="#pricing" className="text-xs font-bold bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all active:scale-[0.97]">
            Comenzar
          </a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 text-center pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full px-4 py-1.5 mb-6 animate-fade-in shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
          </span>
          <span className="text-[11px] font-bold text-primary-700 tracking-wide">
            {count.toLocaleString()} Mejoraron la vida de sus mascotas
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-900 mb-5 leading-[1.1] animate-slide-up">
          Tu perro merece vivir
          <span className="block bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(107,99,243,0.3)]">
            MEJOR
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          La alimentación natural, el entrenamiento profesional y el seguimiento de salud que necesita tu perro, todo en una sola app. Únete a miles de dueños que ya cambiaron la vida de sus mascotas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <button
            type="button"
            onClick={handleShowRegister}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-4 px-8 font-extrabold text-sm shadow-xl shadow-primary-500/30 transition-all active:scale-[0.97] animate-glow-brand"
          >
            <Zap className="w-4 h-4" />
            Empezar ahora — Oferta especial
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#screenshots"
            className="flex items-center gap-2 rounded-2xl bg-white text-zinc-700 py-4 px-6 font-bold text-sm border border-zinc-200 transition-all hover:bg-zinc-50 active:scale-[0.97]"
          >
            Ver la app por dentro
          </a>
        </div>

        <div className="flex items-center justify-center gap-1 mb-2 animate-slide-up" style={{ animationDelay: "0.25s" }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-warning-400 fill-warning-400 animate-pulse-star" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
          <span className="text-sm font-bold text-zinc-700 ml-2">4.9/5</span>
        </div>
        <p className="text-xs text-zinc-400 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          Basado en 1,200+ reseñas de dueños de perros
        </p>

        {/* Phone mockup */}
        <div className="relative mt-12 max-w-xs mx-auto animate-scale-in" style={{ animationDelay: "0.4s" }}>
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-[3rem] blur-2xl" />
          <div className="relative bg-zinc-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-zinc-800">
            <div className="bg-primary-50 rounded-[2rem] overflow-hidden aspect-[9/19]">
              <img src="/icons/screen Home pantalla principal.png" alt="Dashboard Blis Club" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PAIN POINTS ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">El problema</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            ¿Te suena familiar?
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Millones de dueños enfrentan los mismos problemas. No es tu culpa, es falta de herramientas.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className="card-soft rounded-2xl p-5 hover:border-primary-200 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-800 mb-1">{p.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SCREENSHOTS ═══ */}
      <section id="screenshots" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Así se ve por dentro</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Conoce la app antes de unirte
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Estos son pantallazos reales de la app. Cada sección resuelve un problema concreto de tu día a día con tu perro.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCREENSHOTS.map((s, i) => (
            <div key={i} className={`group relative ${i === 0 ? "sm:col-span-2 lg:col-span-3" : ""}`}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[1.5rem] blur opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white rounded-[1.5rem] p-3 border border-zinc-100 h-full">
                <div className={`rounded-xl overflow-hidden bg-zinc-100 mb-3 mx-auto ${i === 0 ? "max-w-md" : ""} ${s.wide ? "aspect-[406/210] max-h-48" : "aspect-[9/16] max-h-[500px]"}`}>
                  <img src={s.src} alt={s.title} className="w-full h-full object-contain" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-900 mb-1">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SOLUTION ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">La solución</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Blis es todo lo que necesitas
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Tres pilares que trabajan juntos para que tu perro viva más, mejor y más feliz.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SOLUTION_PILLARS.map((s, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${s.color} rounded-[1.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity`} />
              <div className="relative bg-white rounded-[1.5rem] p-6 border border-zinc-100 h-full text-center">
                <div className="w-24 h-24 mb-4 mx-auto flex items-center justify-center">
                  {s.icon}
                </div>
                <h3 className="text-base font-extrabold text-zinc-900 mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ BEFORE/AFTER ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Antes vs Después</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Esto es lo que cambia con Blis
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BEFORE_AFTER.map((item, i) => (
            <div key={i} className={`rounded-2xl p-5 border transition-all ${ item.bad ? "bg-danger-50 border-danger-200" : "bg-emerald-50 border-emerald-200 shadow-lg" }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${ item.bad ? "bg-danger-100 text-danger-700" : "bg-emerald-100 text-emerald-700" }`}>
                  {item.bad ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  {item.label}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-800 mb-1">{item.title}</h4>
                  <p className={`text-xs leading-relaxed ${item.bad ? "text-zinc-500" : "text-emerald-700"}`}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EXPANDABLE FEATURES ═══ */}
      <section id="features" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Todo incluido</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Una app, once superpoderes
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Toca cada función para ver qué incluye, qué problema resuelve y qué vas a lograr con ella.
          </p>
        </div>
        <div className="space-y-2">
          {EXPANDABLE_FEATURES.map((f, i) => {
            const isOpen = openFeature === i;
            return (
              <div key={i} className="card-soft rounded-2xl overflow-hidden transition-all border border-zinc-100">
                <button onClick={() => setOpenFeature(isOpen ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                      {f.icon}
                    </div>
                    <span className="text-sm font-bold text-zinc-800 pr-4">{f.title}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-primary-500 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">Lo que incluye</p>
                      <p className="text-xs text-zinc-600 leading-relaxed">{f.has}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 bg-danger-50 border border-danger-100">
                        <p className="text-[10px] font-bold text-danger-600 mb-1">Antes (sin Blis)</p>
                        <p className="text-xs text-zinc-600 leading-relaxed">{f.before}</p>
                      </div>
                      <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 mb-1">Después (con Blis)</p>
                        <p className="text-xs text-zinc-600 leading-relaxed">{f.after}</p>
                      </div>
                    </div>
                    <div className="rounded-xl p-3 bg-primary-50 border border-primary-100">
                      <p className="text-[10px] font-bold text-primary-600 mb-1">¿Qué vas a lograr?</p>
                      <p className="text-xs text-zinc-700 leading-relaxed font-medium">{f.win}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SUCCESS STORIES ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Historias de éxito</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Refléjate en estos dueños
          </h2>
          <p className="text-sm text-zinc-500 mt-2 max-w-lg mx-auto">
            Cada historia representa un camino posible para ti y tu perro. Lee, siente y decide cuál quieres recorrer.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUCCESS_STORIES.map((s, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[1.5rem] blur opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white rounded-[1.5rem] p-6 border border-zinc-100 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{s.tag}</span>
                    <h3 className="text-sm font-extrabold text-zinc-900">{s.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4 flex-1">{s.story}</p>
                <div className="rounded-xl p-3 bg-accent-50 border border-accent-100">
                  <p className="text-[10px] font-bold text-accent-600 mb-1">Reflexión para ti</p>
                  <p className="text-xs text-zinc-700 leading-relaxed italic">"{s.reflection}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Historias reales</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Lo que dicen los dueños
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[280px] bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm"
            >
              <div className="flex gap-0.5 mb-3">{renderStars(t.stars)}</div>
              <p className="text-sm text-zinc-700 mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-800">{t.name}</p>
                  <p className="text-[10px] text-zinc-400">{t.dog}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-primary-600">{t.metric}</p>
                  <p className="text-[9px] text-zinc-400">{t.metricLabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TRUST / GUARANTEE ═══ */}
      <section className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Compra con confianza</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Te respaldamos en cada paso
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck className="w-10 h-10" />, title: "Garantía 14 días", desc: "No te convence? Te devolvemos el 100% de tu dinero sin una sola pregunta. Así de seguros estamos de que Blis cambiará la vida de tu perro." },
            { icon: <Lock className="w-10 h-10" />, title: "Pago seguro", desc: "Utilizamos una pasarela de pago segura y privada certificada. Tu información financiera está cifrada y nunca la almacenamos en nuestros servidores." },
            { icon: <MessageCircle className="w-10 h-10" />, title: "Soporte 24/7", desc: "Nuestro equipo de expertos caninos responde en menos de 24 horas. No bots, no respuestas genéricas: gente real que entiende de perros." },
          ].map((t, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white border border-zinc-100">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {t.icon}
              </div>
              <h3 className="text-base font-extrabold text-zinc-800 mb-2">{t.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Precios</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Menos de lo que cuesta un café al día
          </h2>
          <p className="text-sm text-zinc-500 mt-2">Inversión real en la salud y felicidad de tu perro.</p>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="relative group animate-scale-in">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-[1.5rem] blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative bg-white rounded-[1.5rem] p-6 border border-zinc-100 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Oferta especial</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-warning-400 animate-pulse-glow" />
                  <span className="text-[10px] font-bold text-warning-600">Ahorra 80%</span>
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 mb-1">Pro Trimestral</h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-zinc-400 line-through decoration-danger-400">$49.99</span>
                <span className="text-5xl font-extrabold text-zinc-900 tracking-tight">$1.00</span>
                <span className="text-zinc-400 font-medium">/trimestre</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Precio real $49.99. Hoy solo $1.00 trimestral. Cancela cuando quieras.</p>

              {/* ═══ REGISTER FORM (dentro de la tarjeta) ═══ */}
              <AnimatePresence>
                {showRegister && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-zinc-100 pt-4 mt-1 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-extrabold text-zinc-800">Datos de cliente</p>
                        <button
                          type="button"
                          onClick={() => setShowRegister(false)}
                          className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-3">
                        <input
                          type="email"
                          required
                          placeholder="Correo electrónico"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="Nombre"
                            value={registerFirstName}
                            onChange={(e) => setRegisterFirstName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Apellido"
                            value={registerLastName}
                            onChange={(e) => setRegisterLastName(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
                          />
                        </div>

                        {registerError && (
                          <p className="text-xs text-red-600 bg-red-50 rounded-xl p-2.5">{registerError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={registerLoading}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3 font-bold text-sm shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                          {registerLoading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Creando cuenta...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Continuar al pago seguro
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showRegister && (
                <button
                  type="button"
                  onClick={handleShowRegister}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] relative overflow-hidden group/btn animate-glow-brand"
                >
                  <Zap className="w-4 h-4" />Suscribirme ahora<ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-zinc-400">
                <Lock className="w-3 h-3 text-zinc-400" />
                Pasarela de pago segura y privada
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative z-10 px-4 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Preguntas</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-2">
            Todo lo que necesitas saber
          </h2>
        </div>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="card-soft rounded-2xl overflow-hidden transition-all">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-bold text-zinc-800 pr-4">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary-500 transition-transform duration-300 shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="px-4 pb-4 text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-lg mx-auto text-center relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-primary-600/10 blur-2xl" />
          <div className="relative rounded-[2rem] p-8 text-white border border-primary-200/50 overflow-hidden" style={{ background: "linear-gradient(135deg, #6b63f3 0%, #8b5cf6 50%, #a855f7 100%)" }}>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-extrabold">¿Qué estás esperando?</h2>
              <p className="text-sm text-white/80">
                Miles de perros ya viven mejor gracias a Blis Pro. El tuyo puede ser el siguiente.
              </p>
              <button
                type="button"
                onClick={handleShowRegister}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white py-4 px-8 font-extrabold text-sm shadow-xl transition-all active:scale-[0.98] hover:bg-zinc-50 animate-glow-gold"
                style={{ color: "#6b63f3" }}
              >
                <Heart className="w-4 h-4 fill-current" />Suscribirme ahora
              </button>
              <p className="text-[10px] text-white/60">Cancela cuando quieras. Sin compromiso.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 px-4 pb-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-primary-500" />Garantía 14 días
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <Lock className="w-3 h-3 text-primary-500" />Pago seguro
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] text-zinc-400">
          <Link href="/legal/terminos" className="hover:text-primary-500 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-primary-500 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-primary-500 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-400 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
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
          0%, 100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.4)); }
          50% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.9)); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(251,191,36,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(251,191,36,0.8)); }
        }
        @keyframes glow-brand {
          0%, 100% { box-shadow: 0 0 20px rgba(107,99,243,0.3), 0 4px 15px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 35px rgba(107,99,243,0.5), 0 0 50px rgba(139,92,246,0.2), 0 4px 15px rgba(0,0,0,0.1); }
        }
        @keyframes glow-gold {
          0%, 100% { box-shadow: 0 0 15px rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 30px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.2); }
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
        .animate-glow-gold {
          animation: glow-gold 2.5s ease-in-out infinite;
        }
        .animate-icon-pulse {
          animation: icon-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
