import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  Coffee,
  Ticket,
  type LucideIcon,
} from "lucide-react"

export interface Speaker {
  id: string
  name: string
  title: string
  bio: string
  topic: string
  image: string
  social: { linkedin?: string; instagram?: string }
}

export interface ScheduleItem {
  time: string
  title: string
  description?: string
  icon: LucideIcon
  isBreak?: boolean
  speakerId?: string
  details?: string[]
  methodology?: string
  targetAudience?: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  iva: boolean
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export interface Testimonial {
  id: string
  name: string
  company: string
  text: string
  stars: number
  image: string
}

export interface FAQItem {
  question: string
  answer: string
}

export const EVENT_DATE = new Date("2026-08-13T15:30:00-05:00")

export const speakers: Speaker[] = [
  {
    id: "diego-padilla",
    name: "Arq. Diego Padilla",
    title: "Arquitecto Urbano",
    bio: "Especialista en planificación territorial con 15 años liderando proyectos de urbanización en Ecuador. Ha gestionado más de 30 proyectos aprobados en municipios de la región.",
    topic: "Del Papel a la Realidad: Trámites Municipales para Urbanizaciones Exitosas",
    image: "/images/speakers/diego-padilla.jpg",
    social: { linkedin: "#", instagram: "#" },
  },
  {
    id: "graciela-galvan",
    name: "Ing. Graciela Galván",
    title: "Ingeniera Civil & Broker",
    bio: "Experta en estructuras y comercialización inmobiliaria. Combinación única de visión técnica y estrategia de ventas para cerrar negocios en 1er y 2do uso.",
    topic: "Más allá de la Estructura: Venta Estratégica de Inmuebles Residenciales",
    image: "/images/speakers/graciela-galvan.jpg",
    social: { linkedin: "#", instagram: "#" },
  },
  {
    id: "kevin-valdez",
    name: "Kevin Valdez",
    title: "Desarrollador Inmobiliario",
    bio: "Emprendedor que ha escalado 3 proyectos inmobiliarios desde cero usando automatización y marketing digital. Creyente de que la tecnología es el nuevo ladrillo.",
    topic: "Digitalización Inmobiliaria: Sistemas y Marketing para Proyectos que Venden",
    image: "/images/speakers/kevin-valdez.jpg",
    social: { linkedin: "#", instagram: "#" },
  },
  {
    id: "paco-licta",
    name: "Paco Licta",
    title: "Desarrollador Inmobiliario",
    bio: "Visionario con 10+ años en desarrollo de proyectos desde la adquisición de terrenos hasta la entrega final. Mentor de nuevos desarrolladores.",
    topic: "De la Idea al Entregable: El Mapa de un Desarrollo Inmobiliario Rentable",
    image: "/images/speakers/paco-licta.jpg",
    social: { linkedin: "#", instagram: "#" },
  },
]

export const schedule: ScheduleItem[] = [
  {
    time: "15:30",
    title: "Recepción y Acreditación",
    description: "Registro de asistentes, entrega de kit de bienvenida con material exclusivo del evento y welcome coffee de cortesía.",
    icon: Coffee,
    targetAudience: "Todos los asistentes",
  },
  {
    time: "16:00 - 16:45",
    title: "Arq. Diego Padilla",
    description: "Del Papel a la Realidad: Trámites Municipales para Urbanizaciones Exitosas",
    speakerId: "diego-padilla",
    icon: Mic,
    details: [
      "Cómo estructurar un expediente municipal que sea aprobado en la primera revisión",
      "Los 5 errores más costosos en trámites de fraccionamiento y licencias de construcción",
      "Checklist práctico: documentos, planos y estudios técnicos obligatorios por tipo de proyecto",
      "Casos reales de proyectos aprobados en Ambato, Latacunga y Riobamba: qué hicieron bien y qué hicieron mal",
      "Tiempos estimados por municipio y cómo acelerar procesos sin comprometer la legalidad",
    ],
    methodology: "Exposición magistral con estudios de caso, material descargable y sesión de 10 min de preguntas al final.",
    targetAudience: "Desarrolladores, arquitectos, constructores y tramitadores",
  },
  {
    time: "16:45 - 17:15",
    title: "Break & Networking",
    description: "Coffee break premium con estaciones temáticas: financiamiento, legal, construcción y ventas. Conecta con colegas que comparten tus mismos desafíos.",
    icon: Coffee,
    isBreak: true,
  },
  {
    time: "17:15 - 18:00",
    title: "Ing. Graciela Galván",
    description: "Más allá de la Estructura: Venta Estratégica de Inmuebles Residenciales",
    speakerId: "graciela-galvan",
    icon: Mic,
    details: [
      "Cómo estructurar tu argumento de venta usando los atributos técnicos de la propiedad como diferenciadores",
      "Psicología del comprador de primera vivienda vs inversionista: dos discursos distintos",
      "Estrategias de pricing psicológico y cómo presentar incrementos sin perder leads",
      "Manejo de objeciones frecuentes: 'está muy caro', 'me gusta pero...', 'voy a pensarlo'",
      "Cómo cerrar una venta en la primera visita usando el método de los 3 síes progresivos",
    ],
    methodology: "Workshop interactivo: trae tu proyecto actual y trabajaremos un pitch de venta en vivo.",
    targetAudience: "Brokers, agentes inmobiliarios, gerentes de ventas y dueños de inmobiliarias",
  },
  {
    time: "18:00 - 18:30",
    title: "Break",
    description: "Pausa para recargar. Aprovecha para visitar los stands de nuestros aliados y explorar herramientas y servicios para tu negocio.",
    icon: Coffee,
    isBreak: true,
  },
  {
    time: "18:30 - 19:15",
    title: "Kevin Valdez",
    description: "Digitalización Inmobiliaria: Sistemas y Marketing para Proyectos que Venden",
    speakerId: "kevin-valdez",
    icon: Mic,
    details: [
      "El stack tecnológico mínimo que necesitas para automatizar la captación de leads calificados",
      "Cómo crear un embudo de ventas digital que funcione 24/7: Meta Ads + WhatsApp Automation + CRM",
      "Estrategias de contenido orgánico que posicionan tu proyecto antes de lanzar preventa",
      "Tour virtual 360 y renders hiperrealistas: cuándo invertir y cuándo usar alternativas de bajo costo",
      "Métricas que realmente importan: CPL, CPA, tasa de conversión y retorno por lead — con ejemplos reales de proyectos ecuatorianos",
    ],
    methodology: "Demostración en vivo de herramientas (Meta Business Suite, WhatsApp Cloud API, HubSpot) y workshop de configuración de campañas.",
    targetAudience: "Desarrolladores, gerentes de marketing, emprendedores inmobiliarios y community managers del sector",
  },
  {
    time: "19:15 - 19:45",
    title: "Break & Networking VIP",
    description: "Networking estructurado con dinámica de speed networking. Conoce a 5 profesionales nuevos en 30 minutos con preguntas guiadas para generar conexiones reales.",
    icon: Coffee,
    isBreak: true,
  },
  {
    time: "19:45 - 20:30",
    title: "Paco Licta",
    description: "De la Idea al Entregable: El Mapa de un Desarrollo Inmobiliario Rentable",
    speakerId: "paco-licta",
    icon: Mic,
    details: [
      "Evaluación de terrenos: los 7 criterios que determinan si un lote es viable o una trampa financiera",
      "Modelo financiero paso a paso: desde la adquisición hasta el retorno de inversión proyectado",
      "Cómo estructurar la preventa para financiar la construcción sin recurrir a créditos bancarios tradicionales",
      "Gestión de riesgos: proveedores, plazos, sobrecostos ocultos y cómo blindar tu margen",
      "Checklist de entrega: documentación legal, actas de entrega-recepción y garantías post-venta que fidelizan al comprador",
    ],
    methodology: "Masterclass con modelo financiero en Excel descargable. Análisis de un caso real con números, riesgos y lecciones aprendidas.",
    targetAudience: "Desarrolladores, inversionistas, gerentes de proyecto y constructores",
  },
  {
    time: "21:00",
    title: "Agradecimiento y Cierre",
    description: "Palabras de cierre, rifa de una consultoría personalizada 1-a-1 con cada ponente (4 ganadores), entrega de certificados digitales y foto grupal del evento.",
    icon: Users,
    targetAudience: "Todos los asistentes",
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    id: "equipos",
    name: "Equipos",
    price: 70,
    iva: true,
    description: "Por persona, mínimo 3 personas del mismo equipo o empresa.",
    features: [
      "Acceso a todas las ponencias",
      "Material digital de apoyo",
      "Certificado de asistencia grupal",
      "Coffee break incluido",
      "Networking prioritario",
    ],
    cta: "Reservar Ahora",
  },
  {
    id: "premium",
    name: "Premium",
    price: 115,
    iva: true,
    description: "Cena exclusiva con ponentes + asistencia completa al evento.",
    features: [
      "Todo lo del pase Unitario",
      "Cena privada con los 4 ponentes",
      "Asiento reservado en primera fila",
      "Acceso a grupo VIP de WhatsApp",
      "Consultoría personalizada de 15 min",
      "Certificado Premium firmado",
    ],
    highlighted: true,
    cta: "Reservar Ahora",
  },
  {
    id: "unitario",
    name: "Unitario",
    price: 85,
    iva: true,
    description: "Asistencia individual. Vive la experiencia completa del evento.",
    features: [
      "Acceso a todas las ponencias",
      "Material digital de apoyo",
      "Certificado de asistencia",
      "Coffee break incluido",
      "Acceso a sala de networking",
    ],
    cta: "Reservar Ahora",
  },
]

export const testimonials: Testimonial[] = [
  // ── Diego Padilla testimonials ──
  {
    id: "diana-r",
    name: "Diana R.",
    company: "Inmobiliaria del Valle",
    text: "Diego Padilla fue clarísimo explicando los trámites municipales. En mi proyecto en Latacunga ahorramos 4 meses de permisos aplicando su checklist. Imprescindible para cualquier desarrollador.",
    stars: 5,
    image: "/images/testimonials/diana.jpg",
  },
  {
    id: "carlos-m",
    name: "Carlos M.",
    company: "Constructora Andina",
    text: "Llevo 20 años en construcción y pensé que ya sabía todo de trámites. Diego me demostró que estaba perdiendo tiempo y plata en cada proyecto. Sus casos reales son oro puro.",
    stars: 5,
    image: "/images/testimonials/carlos.jpg",
  },
  {
    id: "fernanda-v",
    name: "Fernanda V.",
    company: "Arquitecta Independiente",
    text: "El checklist de Diego Padilla para expedientes municipales me salvó de un rechazo seguro en el municipio de Ambato. Ahora lo uso en todos mis proyectos. Debería ser lectura obligatoria.",
    stars: 5,
    image: "/images/testimonials/fernanda.jpg",
  },

  // ── Graciela Galván testimonials ──
  {
    id: "andres-sofia",
    name: "Andrés & Sofía",
    company: "Desarrollos del Sur",
    text: "Graciela Galván nos enseñó a estructurar nuestras ventas desde lo técnico, no desde el precio. En 3 semanas cerramos 5 unidades que llevaban meses estancadas. Su método de los 3 síes es infalible.",
    stars: 5,
    image: "/images/testimonials/andres-sofia.jpg",
  },
  {
    id: "maria-e",
    name: "María Elena V.",
    company: "Broker Independiente",
    text: "Yo vendía por intuición. Graciela me dio un framework para cada conversación. Ahora manejo objeciones con confianza y mi tasa de cierre subió un 40%. La mejor inversión de mi carrera.",
    stars: 5,
    image: "/images/testimonials/maria.jpg",
  },
  {
    id: "gustavo-p",
    name: "Gustavo P.",
    company: "Inmobiliaria Torres & Asociados",
    text: "El workshop de Graciela donde trabajamos nuestro pitch de venta en vivo fue transformador. Salí con un discurso completamente nuevo. Mis clientes notan la diferencia desde el primer contacto.",
    stars: 5,
    image: "/images/testimonials/gustavo.jpg",
  },

  // ── Kevin Valdez testimonials ──
  {
    id: "lucia-m",
    name: "Lucía M.",
    company: "Desarrolladora Digital",
    text: "Kevin Valdez abrió mis ojos al marketing digital inmobiliario. Implementé su stack de WhatsApp + CRM y en un mes tenía 80 leads calificados sin gastar un centavo extra en publicidad.",
    stars: 5,
    image: "/images/testimonials/lucia.jpg",
  },
  {
    id: "roberto-c",
    name: "Roberto C.",
    company: "Constructora Montebello",
    text: "Siempre pensé que el marketing digital era para productos, no para bienes raíces. Kevin me demostró lo contrario con métricas reales. Su demo en vivo de Meta Ads me hizo replantear todo mi presupuesto.",
    stars: 5,
    image: "/images/testimonials/roberto.jpg",
  },
  {
    id: "alejandra-n",
    name: "Alejandra N.",
    company: "Proyectos Urbanos EC",
    text: "El tour virtual 360 que aprendí con Kevin ya está generando visitas a mi proyecto desde otras provincias. La tecnología no es el futuro del sector, es el presente. Kevin lo explica como nadie.",
    stars: 5,
    image: "/images/testimonials/alejandra.jpg",
  },

  // ── Paco Licta testimonials ──
  {
    id: "jorge-h",
    name: "Jorge H.",
    company: "Inversionista Inmobiliario",
    text: "Paco Licta compartió su modelo financiero completo, con números reales. Apliqué sus criterios de evaluación de terrenos y evité comprar un lote que hubiera sido un desastre financiero. Me ahorró $50,000.",
    stars: 5,
    image: "/images/testimonials/jorge.jpg",
  },
  {
    id: "patricia-s",
    name: "Patricia S.",
    company: "Gerente de Proyectos",
    text: "La masterclass de Paco sobre gestión de riesgos y proveedores es lo más práctico que he visto. Su checklist de entrega post-venta nos ayudó a reducir reclamos en un 70%. Un crack absoluto.",
    stars: 5,
    image: "/images/testimonials/patricia.jpg",
  },
  {
    id: "miguel-a",
    name: "Miguel Ángel T.",
    company: "Desarrollador Junior",
    text: "Como nuevo en el sector, el mapa de Paco desde la adquisición hasta la entrega me dio claridad total. Ya no navego a ciegas. Su modelo de preventa para financiar construcción sin banco es genial.",
    stars: 5,
    image: "/images/testimonials/miguel.jpg",
  },

  // ── General event testimonials ──
  {
    id: "valeria-l",
    name: "Valeria L.",
    company: "Constructora Familiar",
    text: "Vine por un ponente y me quedé por los cuatro. El nivel es altísimo. El networking del break fue tan valioso como las ponencias mismas. Ya tengo 3 colaboraciones nuevas gracias a este evento.",
    stars: 5,
    image: "/images/testimonials/valeria.jpg",
  },
  {
    id: "eduardo-r",
    name: "Eduardo R.",
    company: "Agente Inmobiliario Senior",
    text: "20 años en el sector y Cafecito Inmobiliario me recordó por qué amo esto. La energía, los contactos, el conocimiento práctico. No es un evento más, es una comunidad que está transformando la industria en Ecuador.",
    stars: 5,
    image: "/images/testimonials/eduardo.jpg",
  },
  {
    id: "camila-g",
    name: "Camila G.",
    company: "Emprendedora Inmobiliaria",
    text: "El pase Premium valió cada centavo. La cena con los ponentes fue donde realmente ocurrió la magia. Conversaciones que no tendrías en ningún otro formato. Salí con mentoría, contactos y un plan claro para 2026.",
    stars: 5,
    image: "/images/testimonials/camila.jpg",
  },
]

export const faqs: FAQItem[] = [
  {
    question: "¿A qué hora empieza el evento?",
    answer: "La recepción y acreditación comienza a las 15:30. La primera ponencia inicia puntualmente a las 16:00. Te recomendamos llegar con anticipación para registrarte y disfrutar del welcome coffee.",
  },
  {
    question: "¿El precio incluye IVA?",
    answer: "No, todos los precios publicados son más IVA. Al momento de realizar tu transferencia, deberás añadir el 15% correspondiente. Ejemplo: Pase Unitario = $85 + $12.75 (IVA) = $97.75.",
  },
  {
    question: "¿Cómo confirmo mi asistencia tras transferir?",
    answer: "Una vez realizada la transferencia bancaria, envía tu comprobante al WhatsApp oficial. Nuestro equipo verificará el pago en un plazo de 2 a 4 horas y te enviará la confirmación de tu cupo con un código QR de acceso.",
  },
  {
    question: "¿Puedo llevar acompañante con precio de equipo?",
    answer: "El pase de Equipos requiere un mínimo de 3 personas de la misma organización o empresa. Si son menos de 3, te recomendamos adquirir pases Unitarios individuales.",
  },
  {
    question: "¿Habrá estacionamiento?",
    answer: "Sí, el lugar del evento contará con estacionamiento. La ubicación exacta (auditorio) se confirmará unos días antes del evento a través de nuestro grupo de WhatsApp y correo electrónico.",
  },
  {
    question: "¿Se entregará certificado de asistencia?",
    answer: "Sí, todos los asistentes recibirán un certificado digital de participación al finalizar el evento. Los participantes del pase Premium recibirán un certificado firmado por los 4 ponentes.",
  },
]

export const sponsors = [
  { name: "Aliado 1", logo: "/images/sponsors/sponsor-1.png" },
  { name: "Aliado 2", logo: "/images/sponsors/sponsor-2.png" },
  { name: "Aliado 3", logo: "/images/sponsors/sponsor-3.png" },
  { name: "Aliado 4", logo: "/images/sponsors/sponsor-4.png" },
  { name: "Aliado 5", logo: "/images/sponsors/sponsor-5.png" },
  { name: "Aliado 6", logo: "/images/sponsors/sponsor-6.png" },
]

export const transferData = {
  bank: "Banco Pichincha",
  accountType: "Cuenta de Ahorros",
  accountNumber: "XXXXXXXX",
  holder: "Cafecito Inmobiliario",
  idNumber: "XXXXXXXXX",
  email: "pagos@cafecitoinmobiliario.com",
  instructions:
    "Envía tu comprobante al WhatsApp para confirmar tu cupo. Verificaremos tu pago en 2-4 horas.",
}

export const eventInfo = {
  city: "Ambato, Ecuador",
  date: "Jueves 13 de Agosto 2026",
  venue: "Auditorio por confirmar",
  metrics: {
    speakers: 4,
    days: 1,
    hours: 5,
    attendees: 100,
  },
}

export const videoUrls = {
  hero: "/videos/hero.mp4",
  testimonials: "https://adilo.bigcommand.com/watch/wn4d2fRf",
  pastConference: "https://adilo.bigcommand.com/watch/CPLGVpv_",
  interviews: "",
}

export interface GalleryImage {
  src: string
  alt: string
}

export const galleryImages: GalleryImage[] = [
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030310.png", alt: "Ponentes compartiendo en el escenario" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030348.png", alt: "Sesión de networking entre asistentes" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030414.png", alt: "Workshop interactivo con los asistentes" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030436.png", alt: "Invitados conversando durante el coffee break" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030453.png", alt: "Sala llena en la edición anterior" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030509.png", alt: "Ponente respondiendo preguntas del público" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030549.png", alt: "Entrega de certificados a los asistentes" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030602.png", alt: "Dinámica grupal durante la capacitación" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030623.png", alt: "Cena premium con ponentes" },
  { src: "/image%20cafecito/Captura%20de%20pantalla%202026-06-11%20030641.png", alt: "Foto grupal de cierre del evento" },
]

export interface BonusMaterial {
  id: string
  icon: string
  title: string
  speaker: string
  description: string
}

export const bonusMaterials: BonusMaterial[] = [
  {
    id: "checklist-tramites",
    icon: "📋",
    title: "Checklist de Trámites Municipales",
    speaker: "Arq. Diego Padilla",
    description: "Guía paso a paso con los 12 documentos obligatorios para aprobar tu anteproyecto en la primera revisión. Incluye plantillas de oficios y solicitudes.",
  },
  {
    id: "modelo-financiero",
    icon: "📊",
    title: "Modelo Financiero en Excel",
    speaker: "Paco Licta",
    description: "Plantilla descargable con fórmulas para evaluar terrenos, proyectar flujos, calcular márgenes y simular escenarios de preventa. Listo para usar.",
  },
  {
    id: "kit-whatsapp",
    icon: "🤖",
    title: "Kit WhatsApp Automation",
    speaker: "Kevin Valdez",
    description: "Guía de configuración de WhatsApp Cloud API + templates de mensajes automatizados + embudo de leads calificados probado en proyectos ecuatorianos.",
  },
  {
    id: "guia-ventas",
    icon: "📖",
    title: "Guía de Venta Estratégica",
    speaker: "Ing. Graciela Galván",
    description: "Framework de los 3 síes progresivos con scripts de conversación, manejo de 20 objeciones frecuentes y plantilla de presentación de alto cierre.",
  },
]

export interface EventDayItem {
  icon: string
  label: string
}

export const eventDayInfo = {
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25545.081411319546!2d-78.629159984375!3d-1.2416448999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d3818d9c3e3a11%3A0x2c6b15b3c3c3c3c3!2sAmbato!5e0!3m2!1ses!2sec!4v1620000000000",
  thingsToBring: [
    { icon: "💻", label: "Laptop o tablet para los workshops interactivos" },
    { icon: "📇", label: "Tarjetas de presentación (mínimo 30 unidades)" },
    { icon: "📓", label: "Libreta y lapicero para tomar notas" },
    { icon: "📱", label: "Celular con batería y WhatsApp instalado" },
    { icon: "👔", label: "Vestimenta casual de negocios (smart casual)" },
    { icon: "💳", label: "Método de pago por si deseas adquirir material adicional en los stands" },
  ],
  expressSchedule: [
    { time: "15:00", label: "Apertura de puertas y registro" },
    { time: "16:00", label: "Inicio de ponencias" },
    { time: "16:45", label: "Primer break & networking" },
    { time: "18:00", label: "Segundo break" },
    { time: "19:45", label: "Última ponencia" },
    { time: "21:00", label: "Cierre, rifas y foto grupal" },
  ],
}

export const shareData = {
  url: "https://www.blis.club/cafecito",
  text: "Te invito a Cafecito Inmobiliario en Ambato — 13 de Agosto 2026. 4 ponentes expertos, networking y estrategias aplicables. ¡Nos vemos allá!",
  hashtags: "CafecitoInmobiliario,Ambato,Inmobiliaria,Ecuador",
}
