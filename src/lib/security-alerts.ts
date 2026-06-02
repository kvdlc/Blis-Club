/**
 * Detección de alertas de seguridad in-memory
 * Contadores por minuto para cada patrón. Sin consultas a BD.
 * Solo escribe en BD cuando se cruza un umbral.
 */

import { createClient } from "@supabase/supabase-js";

interface TimeBucket {
  count: number;
  windowStart: number;
}

const geoCounters = new Map<string, TimeBucket>();
const rateCounters = new Map<string, TimeBucket>();
const routeCounters = new Map<string, TimeBucket>();
let globalCounter = 0;
let globalWindowStart = 0;
const AVG_HOURLY = 50;

const FIRED_ALERTS = new Set<string>();

interface AlertRuleDef {
  id: string;
  tipo: string;
  nivel: string;
  umbral: number;
  ventana_minutos: number;
  habilitado: boolean;
  notificar_email: boolean;
  notificar_webhook: boolean;
  nombre: string;
}

interface AlertsConfigDef {
  habilitado: boolean;
  email_destino: string;
  webhook_url: string;
  reglas: AlertRuleDef[];
}

function getBucket(counters: Map<string, TimeBucket>, key: string, windowMs: number): number {
  const now = Date.now();
  let bucket = counters.get(key);
  if (!bucket || now > bucket.windowStart + windowMs) {
    bucket = { count: 0, windowStart: now };
    counters.set(key, bucket);
  }
  bucket.count++;
  return bucket.count;
}

function alertKey(ruleId: string, windowStart: number): string {
  return `${ruleId}:${Math.floor(windowStart / 60000)}`;
}

export function checkAlerts(
  motivo: string,
  pais: string,
  ip: string,
  ruta: string,
  config: AlertsConfigDef | null
): Array<{
  tipo: string;
  nivel: string;
  titulo: string;
  detalle: string;
  metadata: Record<string, unknown>;
}> | null {
  if (!config?.habilitado) return null;

  const now = Date.now();
  const disparos: Array<{
    tipo: string;
    nivel: string;
    titulo: string;
    detalle: string;
    metadata: Record<string, unknown>;
  }> = [];

  if (now > globalWindowStart + 3600000) {
    globalWindowStart = now;
    globalCounter = 0;
    FIRED_ALERTS.clear();
  }
  globalCounter++;

  for (const regla of config.reglas) {
    if (!regla.habilitado) continue;
    const windowMs = regla.ventana_minutos * 60000;
    let count = 0;
    const metadata: Record<string, unknown> = {};

    switch (regla.tipo) {
      case "geo_spike": {
        count = getBucket(geoCounters, pais, windowMs);
        metadata.pais = pais;
        metadata.total = count;
        break;
      }
      case "rate_spike": {
        if (motivo !== "rate_limit") continue;
        count = getBucket(rateCounters, ip, windowMs);
        metadata.ip = ip;
        metadata.total = count;
        break;
      }
      case "route_attack": {
        count = getBucket(routeCounters, ruta, windowMs);
        metadata.ruta = ruta;
        metadata.total = count;
        break;
      }
      case "traffic_anomaly": {
        count = globalCounter;
        metadata.total = count;
        metadata.promedio = AVG_HOURLY;
        metadata.veces = Math.round((count / AVG_HOURLY) * 10) / 10;
        break;
      }
    }

    if (count >= regla.umbral) {
      const key = alertKey(regla.id, now - (now % windowMs));
      if (FIRED_ALERTS.has(key)) continue;
      FIRED_ALERTS.add(key);

      disparos.push({
        tipo: regla.tipo,
        nivel: regla.nivel,
        titulo: `[${regla.nombre}] ${count} eventos en ${regla.ventana_minutos}min`,
        detalle: JSON.stringify(metadata),
        metadata,
      });
    }
  }

  return disparos.length > 0 ? disparos : null;
}

export function dispatchAlerts(
  disparos: Array<{
    tipo: string;
    nivel: string;
    titulo: string;
    detalle: string;
    metadata: Record<string, unknown>;
  }>,
  config: AlertsConfigDef
): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  const supabase = createClient(supabaseUrl, supabaseKey);

  for (const alerta of disparos) {
    supabase
      .from("security_alerts")
      .insert({
        tipo: alerta.tipo,
        nivel: alerta.nivel,
        titulo: alerta.titulo,
        detalle: alerta.detalle,
        metadata: alerta.metadata,
      })
      .then(({ error }) => {
        if (error && process.env.NODE_ENV === "development") {
          console.error("[Alerts] Error insertando:", error.message);
        }
      });

    const regla = config.reglas.find((r) => r.tipo === alerta.tipo);
    if (regla?.notificar_webhook && config.webhook_url) {
      fetch(config.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: alerta.titulo,
              description: alerta.detalle,
              color: alerta.nivel === "critical" ? 16711680 : 16776960,
            },
          ],
        }),
      }).catch(() => {});
    }
  }
}
