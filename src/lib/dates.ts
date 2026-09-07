/* ═══════════════════════ Utilidades de fechas y vencimientos ═══════════════════════ */

/** Hoy en formato YYYY-MM-DD (zona horaria local). Evita el bug de UTC (Perú/EC = UTC-5). */
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

export interface TiempoRestante {
  dias: number;
  meses: number;
  anios: number;
  vencido: boolean;
}

/** Calcula años, meses y días entre hoy y la fecha dada (formato YYYY-MM-DD). */
export function tiempoRestante(fecha: string): TiempoRestante {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha + "T12:00:00");
  fin.setHours(0, 0, 0, 0);

  let anios = fin.getFullYear() - hoy.getFullYear();
  let meses = fin.getMonth() - hoy.getMonth();
  let dias = fin.getDate() - hoy.getDate();

  if (dias < 0) {
    const ultimoMes = new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
    dias += ultimoMes;
    meses -= 1;
  }
  if (meses < 0) {
    meses += 12;
    anios -= 1;
  }

  const vencido = fin.getTime() < hoy.getTime();
  return { dias, meses, anios, vencido };
}

/**
 * Formato humano corto del tiempo restante.
 * Ej: "3 años 2 meses", "2 meses 5 días", "12 días", "Vencido".
 */
export function formatoRestante(fecha: string): string {
  const t = tiempoRestante(fecha);
  if (t.vencido) {
    // Normalmente el llamador maneja el estado "vencido" aparte.
    return "Vencido";
  }
  const partes: string[] = [];
  if (t.anios > 0) partes.push(t.anios === 1 ? "1 año" : `${t.anios} años`);
  if (t.meses > 0) partes.push(t.meses === 1 ? "1 mes" : `${t.meses} meses`);
  if (t.dias > 0) partes.push(t.dias === 1 ? "1 día" : `${t.dias} días`);
  if (partes.length === 0) return "Hoy vence";
  // Corto: si hay años, omitimos los días para no alargar la etiqueta
  return partes.length > 2 ? partes.slice(0, 2).join(" ") : partes.join(" ");
}

/** Días totales (firma antigua) para colores/umbrales. */
export function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha + "T12:00:00");
  return Math.round((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}
