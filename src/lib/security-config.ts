/**
 * Configuración unificada de seguridad — consulta única a BD con caché compartido
 * Adaptado de blis-corp para Blis Club
 */

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Tipos exportados
// ============================================================================
export interface CachedGeobloqueoConfig {
  habilitado: boolean;
  modo: "bloquear_lista" | "permitir_lista";
  paises_bloqueados: string[];
  paises_permitidos: string[];
  mensaje_bloqueo: string;
}

export interface CachedSecurityHeadersConfig {
  habilitado: boolean;
  headers: Record<string, { habilitado: boolean; valor: string }>;
}

export interface CachedRateLimitConfig {
  habilitado: boolean;
  mensaje_limite: string;
  reglas: Array<{
    ruta: string;
    metodo: string;
    limite: number;
    ventana_segundos: number;
    habilitado: boolean;
    descripcion: string;
    protege_contra: string;
  }>;
}

export interface AlertsConfig {
  habilitado: boolean;
  email_destino: string;
  webhook_url: string;
  reglas: Array<{
    id: string;
    nombre: string;
    tipo: string;
    nivel: string;
    umbral: number;
    ventana_minutos: number;
    habilitado: boolean;
    notificar_email: boolean;
    notificar_webhook: boolean;
  }>;
}

export interface UnifiedSecurityConfig {
  geobloqueo: CachedGeobloqueoConfig | null;
  security_headers: CachedSecurityHeadersConfig | null;
  rate_limiting: CachedRateLimitConfig | null;
  alerts: AlertsConfig | null;
}

// ============================================================================
// Caché unificado (TTL 30s)
// ============================================================================
let cachedConfig: UnifiedSecurityConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000;

function parseSecurityConfig(data: unknown): UnifiedSecurityConfig {
  const sc = (data || {}) as Record<string, unknown>;
  const geo = sc?.geobloqueo as Record<string, unknown> | undefined;
  const headers = sc?.security_headers as Record<string, unknown> | undefined;
  const rl = sc?.rate_limiting as Record<string, unknown> | undefined;
  const alerts = sc?.alerts as Record<string, unknown> | undefined;

  return {
    geobloqueo:
      geo && typeof geo === "object" && geo.habilitado === true
        ? {
            habilitado: true,
            modo: geo.modo === "permitir_lista" ? "permitir_lista" : "bloquear_lista",
            paises_bloqueados: Array.isArray(geo.paises_bloqueados) ? geo.paises_bloqueados as string[] : [],
            paises_permitidos: Array.isArray(geo.paises_permitidos) ? geo.paises_permitidos as string[] : [],
            mensaje_bloqueo: typeof geo.mensaje_bloqueo === "string" ? geo.mensaje_bloqueo : "Acceso denegado",
          }
        : null,

    security_headers:
      headers && typeof headers === "object" && headers.habilitado === true
        ? (headers as unknown as CachedSecurityHeadersConfig)
        : null,

    rate_limiting:
      rl && typeof rl === "object" && rl.habilitado === true
        ? (rl as unknown as CachedRateLimitConfig)
        : null,

    alerts:
      alerts && typeof alerts === "object" && alerts.habilitado === true
        ? (alerts as unknown as AlertsConfig)
        : null,
  };
}

export async function getSecurityConfig(): Promise<UnifiedSecurityConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return { geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar app_settings de la app "guau" via join
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("security_config, applications!inner(slug)")
      .eq("applications.slug", "guau")
      .maybeSingle();

    // Fallback: cualquier app_settings con security_config
    if (!appSettings?.security_config) {
      const { data: fallback } = await supabase
        .from("app_settings")
        .select("security_config")
        .not("security_config", "is", null)
        .limit(1)
        .maybeSingle();

      cachedConfig = parseSecurityConfig(fallback?.security_config);
    } else {
      cachedConfig = parseSecurityConfig(appSettings.security_config);
    }

    cacheTimestamp = now;
    return cachedConfig;
  } catch {
    return { geobloqueo: null, security_headers: null, rate_limiting: null, alerts: null };
  }
}

export function invalidateSecurityConfigCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}
