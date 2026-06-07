/**
 * Utilidades de fecha en zona horaria local.
 * Evita el bug de UTC: en Perú/Ecuador (UTC-5), las 22:05 del sábado
 * ya es domingo en UTC. new Date().toISOString() devuelve UTC.
 */

/** Hoy en formato YYYY-MM-DD (zona horaria local) */
export function getTodayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte un Date a YYYY-MM-DD en zona local */
export function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Convierte string YYYY-MM-DD a Date local (mediodía para evitar desborde) */
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}
