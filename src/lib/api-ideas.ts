import type { ApiIdeasData } from "@/types/api-cloud";

export const API_IDEAS: Record<string, ApiIdeasData> = {
  pagos_mascotas: {
    title: "💡 Ideas para Pagos de Mascotas",
    categories: [
      {
        emoji: "💳",
        title: "Suscripciones y Pagos Recurrentes",
        items: [
          "Suscripciones mensuales de nutrición personalizada: cobro automático de planes de comida BARF o croquetas.",
          "Pagos por servicios veterinarios: dividir el pago en cuotas para cirugías o tratamientos costosos.",
          "Tokenización de tarjetas: guardar tarjeta para pagos recurrentes de paseos o academia.",
          "Links de pago por WhatsApp/Email: enviar recordatorios de pago a tutores con un solo clic.",
        ],
      },
      {
        emoji: "🤝",
        title: "Comisiones y Referidos",
        items: [
          "Comisiones de referidos: cuando un tutor invita a otro, genera comisión automática en su billetera.",
          "Split Payments: dividir el pago automáticamente entre el tutor (90%) y la comisión de plataforma (10%).",
          "Cashback automático: devolver un porcentaje del pago en BLIS Coins para fidelización.",
        ],
      },
      {
        emoji: "🛡️",
        title: "Seguridad y Control",
        items: [
          "Bloqueo de seguridad: evitar chargebacks pidiendo autenticación 3D Secure para compras altas.",
          "Dashboards en tiempo real: ver el flujo de caja de suscripciones desde el panel administrativo.",
          "Alertas de pago fallido: notificar al tutor por email/WhatsApp cuando un pago recurrente falle.",
        ],
      },
    ],
  },
  ia_mascotas: {
    title: "💡 Ideas para IA en Mascotas",
    categories: [
      {
        emoji: "🤖",
        title: "Asistentes Virtuales",
        items: [
          "Chatbot 24/7 de nutrición canina: responder dudas sobre dietas, alérgenos y porciones según la raza.",
          "Agente de entrenamiento: sugerir ejercicios de agilidad personalizados según el progreso del perro.",
          "Traducción de ladridos: análisis de audio para detectar estrés, ansiedad o alerta en el perro.",
        ],
      },
      {
        emoji: "✍️",
        title: "Generación de Contenido",
        items: [
          "Generación automática de recetas: crear recetas BARF personalizadas según edad, peso y objetivo del perro.",
          "Redacción de descripciones para perros perdidos: generar textos claros y emotivos para difusión en redes.",
          "Resúmenes de progreso: analizar datos de paseos y entrenamientos para crear reportes semanales.",
        ],
      },
      {
        emoji: "🎯",
        title: "Up-Selling y Personalización",
        items: [
          "Agente de up-selling: si un tutor mira recetas básicas, sugerirle el plan premium con nutricionista IA.",
          "Recomendaciones de productos: analizar el perfil del perro y sugerir suplementos o juguetes.",
          "Recordatorios inteligentes: detectar cuándo un perro necesita vacuna o revisión y notificar al tutor.",
        ],
      },
    ],
  },
  imagenes_mascotas: {
    title: "💡 Ideas para Imágenes de Mascotas",
    categories: [
      {
        emoji: "🎨",
        title: "Arte y Creatividad",
        items: [
          "Portraits artísticos de mascotas: convertir fotos de perros en ilustraciones de estilo Disney o acuarela.",
          "Fotos de entrenamiento: generar imágenes motivacionales con el perro como protagonista.",
          "Tarjetas de cumpleaños: crear invitaciones personalizadas con la foto del perro.",
        ],
      },
      {
        emoji: "📊",
        title: "Infografías y Educación",
        items: [
          "Generación de infografías de nutrición: crear imágenes explicativas sobre alimentos tóxicos vs seguros.",
          "Diagramas de entrenamiento: crear ilustraciones visuales de circuitos de agilidad.",
          "Guías de primeros auxilios: infografías paso a paso para emergencias caninas.",
        ],
      },
      {
        emoji: "📱",
        title: "Contenido para Redes",
        items: [
          "Contenido para redes sociales: generar banners promocionales para planes de suscripción.",
          "Stories animadas: crear carruseles de imágenes sobre el progreso del perro en la academia.",
          "Memes de mascotas: generar contenido viral relacionado con perros y su cuidado.",
        ],
      },
    ],
  },
};

export const APP_IDEAS_MAP: Record<string, string> = {
  izipay: "pagos_mascotas",
  gemini: "ia_mascotas",
  venice: "imagenes_mascotas",
};

export function getAppIdeas(appId: string): ApiIdeasData | undefined {
  const key = APP_IDEAS_MAP[appId];
  if (!key) return undefined;
  return API_IDEAS[key];
}
