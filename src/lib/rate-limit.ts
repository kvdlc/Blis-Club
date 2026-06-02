/**
 * Rate Limiting in-memory token bucket
 */

import type { CachedRateLimitConfig } from "@/lib/security-config";

export interface RateLimitRule {
  ruta: string;
  metodo: string;
  limite: number;
  ventana_segundos: number;
  habilitado: boolean;
  descripcion: string;
  protege_contra: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

interface CounterEntry {
  count: number;
  resetAt: number;
}

const counters = new Map<string, CounterEntry>();

function getKey(ip: string, ruta: string, metodo: string, ventanaSegundos: number): string {
  const bucket = Math.floor(Date.now() / (ventanaSegundos * 1000));
  return `rl:${ip}:${metodo}:${ruta}:${bucket}`;
}

export function checkInMemory(
  ip: string,
  ruta: string,
  metodo: string,
  limite: number,
  ventanaSegundos: number
): RateLimitResult {
  const key = getKey(ip, ruta, metodo, ventanaSegundos);
  const now = Date.now();
  let entry = counters.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + ventanaSegundos * 1000 };
    counters.set(key, entry);
    return { allowed: true, remaining: limite - 1, limit: limite, resetMs: ventanaSegundos * 1000 };
  }

  entry.count++;
  const remaining = limite - entry.count;
  return {
    allowed: remaining >= 0,
    remaining: Math.max(0, remaining),
    limit: limite,
    resetMs: entry.resetAt - now,
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of counters) {
    if (now > entry.resetAt) counters.delete(key);
  }
}, 5 * 60 * 1000);

export function matchRateLimit(
  config: CachedRateLimitConfig,
  pathname: string,
  method: string
): RateLimitRule | null {
  for (const regla of config.reglas) {
    if (!regla.habilitado) continue;
    if (regla.metodo !== method) continue;
    if (pathname === regla.ruta || pathname.startsWith(regla.ruta + "/")) {
      return regla;
    }
  }
  return null;
}
