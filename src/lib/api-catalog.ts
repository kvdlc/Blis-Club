import type { ApiCategory, ApiApp, ApiField } from "@/types/api-cloud";

export const API_CATALOG: ApiCategory[] = [
  {
    id: "pagos-peru",
    title: "Pagos Perú",
    icon: "CreditCard",
    color: "#ef4444",
    description: "Pasarelas de pago locales para Perú: tarjetas, Yape, Plin, QR.",
    apps: [
      {
        id: "izipay",
        name: "Izipay",
        icon: "CreditCard",
        color: "#ef4444",
        description: "Pasarela de pago peruana. Soporta tarjetas, Yape, Plin, PagoEfectivo. Integración vía Micuentaveb/Krypton.",
        website: "micuentaweb.pe",
        fields: [
          {
            id: "izipay_shop_id",
            label: "Shop ID (Usuario)",
            type: "text",
            description: "Identificador de tienda. Visible en Panel Micuentaveb → Claves.",
            getFrom: "secure.micuentaweb.pe → Configuración → Claves → Usuario",
            accessType: "Pública",
            cost: "pagado",
          },
          {
            id: "izipay_secret_key",
            label: "Contraseña (Secret Key)",
            type: "password",
            description: "Contraseña de test o producción para Basic Auth en backend. Solo backend.",
            getFrom: "secure.micuentaweb.pe → Configuración → Claves → Contraseña",
            accessType: "Privada",
            cost: "pagado",
          },
          {
            id: "izipay_public_key",
            label: "Clave Pública JS",
            type: "password",
            description: "Clave pública para el cliente JavaScript (KR). Formato: usuario:publickey_...",
            getFrom: "secure.micuentaweb.pe → Configuración → Claves → Clave pública",
            accessType: "Pública",
            cost: "pagado",
          },
          {
            id: "izipay_hmac_key",
            label: "Clave HMAC-SHA-256",
            type: "password",
            description: "Clave para verificar firma kr-hash en webhooks IPN. Solo backend.",
            getFrom: "secure.micuentaweb.pe → Configuración → Claves → Clave HMAC-SHA-256",
            accessType: "Privada",
            cost: "pagado",
          },
          {
            id: "izipay_environment",
            label: "Entorno",
            type: "select",
            description: "Sandbox para pruebas con tarjetas de test. Producción para transacciones reales.",
            getFrom: "Panel Micuentaveb",
            accessType: "Pública",
            cost: "pagado",
            options: [
              { value: "sandbox", label: "Sandbox (Pruebas)" },
              { value: "production", label: "Producción" },
            ],
          },
          {
            id: "izipay_display_mode",
            label: "Modo de visualización",
            type: "select",
            description: "Popup: formulario en ventana modal. Embebido: formulario incrustado en la página.",
            getFrom: "Preferencia de diseño",
            accessType: "Pública",
            cost: "pagado",
            options: [
              { value: "popup", label: "Popup (Ventana emergente)" },
              { value: "embedded", label: "Embebido (Integrado en página)" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "inteligencia-artificial",
    title: "Inteligencia Artificial",
    icon: "Brain",
    color: "#8b5cf6",
    description: "Modelos de lenguaje, generación de imágenes y análisis con IA.",
    apps: [
      {
        id: "gemini",
        name: "Google Gemini",
        icon: "Sparkles",
        color: "#3b82f6",
        description: "Modelo de lenguaje de Google. Generación de texto, análisis de imágenes, código. Tiene capa gratuita generosa.",
        website: "aistudio.google.com",
        fields: [
          {
            id: "gemini_key",
            label: "API Key",
            type: "password",
            description: "Clave para Gemini API. 15 RPM gratis, hasta 1500 RPD. Ideal para chatbots y análisis.",
            getFrom: "aistudio.google.com → Get API Key → Create API Key",
            accessType: "Pública",
            cost: "gratis",
            testEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
            testMethod: "POST",
          },
        ],
      },
      {
        id: "venice",
        name: "Venice",
        icon: "Image",
        color: "#f59e0b",
        description: "Generación de imágenes y texto con IA de Venice.",
        website: "venice.ai",
        fields: [
          {
            id: "venice_key",
            label: "API Key",
            type: "password",
            description: "Clave para la API de Venice. Generación de imágenes y texto con modelos de IA.",
            getFrom: "venice.ai/dashboard",
            accessType: "Pública",
            cost: "gratis",
            testEndpoint: "https://api.venice.ai/api/v1/models",
            testMethod: "GET",
          },
        ],
      },
    ],
  },
];

export function getAppById(appId: string): ApiApp | undefined {
  for (const cat of API_CATALOG) {
    const app = cat.apps.find((a) => a.id === appId);
    if (app) return app;
  }
  return undefined;
}

export function getFieldById(fieldId: string): ApiField | undefined {
  for (const cat of API_CATALOG) {
    for (const app of cat.apps) {
      const field = app.fields.find((f) => f.id === fieldId);
      if (field) return field;
    }
  }
  return undefined;
}

export function getCategoryByAppId(appId: string): ApiCategory | undefined {
  for (const cat of API_CATALOG) {
    if (cat.apps.some((a) => a.id === appId)) return cat;
  }
  return undefined;
}

export function getAllFieldIds(): string[] {
  const ids: string[] = [];
  for (const cat of API_CATALOG) {
    for (const app of cat.apps) {
      for (const field of app.fields) {
        ids.push(field.id);
      }
    }
  }
  return ids;
}

export function getTotalApps(): number {
  return API_CATALOG.reduce((sum, cat) => sum + cat.apps.length, 0);
}

export function getTotalFields(): number {
  return API_CATALOG.reduce((sum, cat) => sum + cat.apps.reduce((s, a) => s + a.fields.length, 0), 0);
}
