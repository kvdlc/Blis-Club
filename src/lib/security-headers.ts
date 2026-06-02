/**
 * Inyecta cabeceras de seguridad HTTP
 */

import type { CachedSecurityHeadersConfig } from "@/lib/security-config";

const HEADER_NAME_MAP: Record<string, string> = {
  "content-security-policy": "Content-Security-Policy",
  "strict-transport-security": "Strict-Transport-Security",
  "x-frame-options": "X-Frame-Options",
  "x-content-type-options": "X-Content-Type-Options",
  "referrer-policy": "Referrer-Policy",
  "permissions-policy": "Permissions-Policy",
};

export function injectHeaders(
  response: { headers: Headers },
  config: CachedSecurityHeadersConfig | null
): void {
  if (!config?.habilitado) return;

  for (const [key, header] of Object.entries(config.headers)) {
    if (header.habilitado && header.valor) {
      const headerName = HEADER_NAME_MAP[key];
      if (headerName) {
        response.headers.set(headerName, header.valor);
      }
    }
  }
}
