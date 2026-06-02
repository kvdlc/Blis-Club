/**
 * Sistema de Geobloqueo
 * Usa el header x-vercel-ip-country inyectado por Vercel Edge Network.
 */

import type { CachedGeobloqueoConfig } from "@/lib/security-config";

const GEOBLOCK_ENABLED =
  process.env.GEOBLOCK_ENABLED !== "false" && process.env.GEOBLOCK_ENABLED !== "0";

const IS_DEV = process.env.NODE_ENV === "development";

function log(msg: string, ...args: unknown[]) {
  if (IS_DEV) console.log(`[GeoBlock] ${msg}`, ...args);
}

export interface GeoBlockResult {
  blocked: boolean;
  country: string | null;
  reason: "blocklist" | "not_allowed" | "db_config" | null;
}

const HARD_BLOCKED_COUNTRIES = new Set([
  "CN", "RU", "KP", "IR", "SY", "SD", "LY", "IQ", "AF",
  "SO", "YE", "MM", "BY", "PK", "BD", "NG", "CU", "VN",
  "LA", "KH", "NP", "LK", "UZ", "TM", "KG", "TJ", "AZ",
  "AM", "GE", "MD", "MN",
]);

const HARD_ALLOWED_COUNTRIES = new Set([
  "AR", "BO", "CL", "CO", "CR", "DO", "EC", "SV", "GQ",
  "GT", "HN", "MX", "NI", "PA", "PY", "PE", "PR", "ES",
  "UY", "VE", "BR", "HT", "BZ", "US", "CA", "GB", "FR",
  "DE", "IT", "CH", "NL", "BE", "AT", "IE", "PT", "SE",
  "NO", "DK", "FI", "IS", "PL", "CZ", "SK", "HU", "RO",
  "BG", "HR", "SI", "EE", "LV", "LT", "GR", "CY", "MT",
  "LU", "AD", "MC", "LI", "SM", "VA", "JP", "KR", "TW",
  "SG", "AU", "NZ", "PH", "IL", "AE", "SA", "QA", "KW",
  "BH", "OM", "JO", "TR", "EG", "MA", "TN", "DZ", "ZA",
  "KE", "GH", "HK", "MO", "TH", "MY", "ID", "IN", "UA",
  "AL", "MK", "ME", "RS", "BA", "XK", "JM", "TT", "BB",
  "BS", "BM", "KY", "AW", "CW", "SX", "AG", "DM", "GD",
  "LC", "VC", "KN", "AI", "MS", "TC", "VG", "VI", "SR",
  "GY", "GF", "GP", "MQ", "RE", "YT", "BL", "MF", "PM",
  "WF", "PF", "NC", "FJ", "PG", "CK", "NU", "WS", "TO",
  "VU", "SB", "KI", "NR", "MH", "FM", "PW", "TL", "BN",
  "MV", "BT", "GL", "FO", "GI", "GG", "JE", "IM", "FK",
  "SH", "BQ", "BW", "NA", "MG", "SC", "MU", "KM",
]);

const UNKNOWN_COUNTRY_CODES = new Set(["XX", "T1", "A1", "A2", "O1", ""]);

function checkWithDBConfig(countryCode: string, config: CachedGeobloqueoConfig): GeoBlockResult {
  const code = countryCode.toUpperCase();

  if (config.modo === "bloquear_lista") {
    const blocked = config.paises_bloqueados.includes(code);
    log(`Modo bloquear_lista | país ${code} → ${blocked ? "BLOQUEADO" : "permitido"}`);
    if (blocked) return { blocked: true, country: code, reason: "db_config" };
    return { blocked: false, country: code, reason: null };
  }

  const allowed = config.paises_permitidos.includes(code);
  log(`Modo permitir_lista | país ${code} → ${allowed ? "permitido" : "BLOQUEADO"}`);
  if (!allowed) return { blocked: true, country: code, reason: "db_config" };
  return { blocked: false, country: code, reason: null };
}

function checkHardcoded(countryCode: string): GeoBlockResult {
  const code = countryCode.toUpperCase();
  if (HARD_BLOCKED_COUNTRIES.has(code)) {
    log(`Hardcoded | país ${code} → BLOQUEADO`);
    return { blocked: true, country: code, reason: "blocklist" };
  }
  if (!HARD_ALLOWED_COUNTRIES.has(code)) {
    log(`Hardcoded | país ${code} → BLOQUEADO (no en lista blanca)`);
    return { blocked: true, country: code, reason: "not_allowed" };
  }
  log(`Hardcoded | país ${code} → permitido`);
  return { blocked: false, country: code, reason: null };
}

export function getCountryFromRequest(request: {
  headers: { get: (name: string) => string | null };
}): string | null {
  const simulacro = process.env.GEOBLOCK_SIMULATE_COUNTRY;
  if (simulacro) {
    log("SIMULANDO país:", simulacro);
    return simulacro.toUpperCase();
  }
  return request.headers.get("x-vercel-ip-country");
}

export function checkGeoBlock(
  country: string,
  dbConfig: CachedGeobloqueoConfig | null
): GeoBlockResult {
  if (!GEOBLOCK_ENABLED) return { blocked: false, country: null, reason: null };
  if (!country || UNKNOWN_COUNTRY_CODES.has(country)) return { blocked: false, country, reason: null };

  log(`Verificando país: ${country}`);

  if (dbConfig?.habilitado) {
    return checkWithDBConfig(country, dbConfig);
  }

  return checkHardcoded(country);
}
