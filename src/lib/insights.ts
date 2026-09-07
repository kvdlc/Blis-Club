import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";
import { CHART } from "@/lib/chart-theme";

export const GAL = 3.78541;

export interface Alert {
  id: string;
  nivel: "alta" | "media";
  emoji: string;
  frase: string;
  href?: string;
}

export interface Insights {
  eficiencia: number;          // 0-100
  rendimientoKmGal: number | null;
  gasto30d: number;
  cargaMesActual: number;
  cargaMesPasado: number;
  diffMesPct: number | null;   // positivo = subió
  diasSinCargar: number | null;
  costoPorKm: number | null;
  autonomiaKm: number | null;
  kmProximoServicio: number | null;
  docsQueVencen: VehicleDocument[];
  proyeccionAnual: number;
  inversionMejoras: number;
  alertas: Alert[];
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr + "T12:00:00").getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Eficiencia 0-100 a partir del rendimiento real (km/gal). */
export function calcEficiencia(rendKmGal: number | null): number {
  if (rendKmGal == null) return 50;
  return Math.min(100, Math.max(0, Math.round(((rendKmGal - 15) / 30) * 100)));
}

/** Rendimiento promedio km/gal desde cargas consecutivas (correcto por tramo). */
export function rendimientoPromedio(fuelLogs: FuelLog[]): number | null {
  if (fuelLogs.length < 2) return null;
  const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
  let totalKm = 0, totalGal = 0;
  for (let i = 1; i < sorted.length; i++) {
    const km = sorted[i].odometro - sorted[i - 1].odometro;
    if (km < 0) continue;
    totalKm += km;
    totalGal += sorted[i - 1].litros / GAL;
  }
  return totalGal > 0 ? Math.round(totalKm / totalGal) : null;
}

export function computeInsights(opts: {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  documents: VehicleDocument[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
  specs: VehicleSpecs | null;
}): Insights {
  const { vehicle, fuelLogs, documents, maintenances, upgrades, specs } = opts;
  const ahora = new Date();
  const hoy = ahora.getDate();

  // Rendimiento / eficiencia
  const rendKmGal = rendimientoPromedio(fuelLogs);
  const eficiencia = calcEficiencia(rendKmGal);

  // Gasto últimos 30 días (combustible)
  const hace30 = Date.now() - 30 * 24 * 3600 * 1000;
  const gasto30d = fuelLogs
    .filter((f) => new Date(f.fecha).getTime() > hace30)
    .reduce((s, f) => s + (f.litros / GAL) * f.precio_por_galon, 0);

  // Cargas mes actual vs pasado
  const esMes = (d: Date, ref: Date) => d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
  const mesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const gastoMesF = (ref: Date) =>
    fuelLogs.filter((f) => esMes(new Date(f.fecha), ref)).reduce((s, f) => s + (f.litros / GAL) * f.precio_por_galon, 0);
  const cargaMesActual = gastoMesF(ahora);
  const cargaMesPasado = gastoMesF(mesPasado);
  const diffMesPct = cargaMesPasado > 0 ? Math.round(((cargaMesActual - cargaMesPasado) / cargaMesPasado) * 100) : null;

  // Días desde última carga
  const ultimaFecha = fuelLogs.length
    ? Math.max(...fuelLogs.map((f) => new Date(f.fecha).getTime()))
    : null;
  const diasSinCargar = ultimaFecha != null ? Math.max(0, Math.floor((Date.now() - ultimaFecha) / (1000 * 3600 * 24))) : null;

  // Costo por km (combustible)
  let costoPorKm: number | null = null;
  if (rendKmGal && fuelLogs.length && fuelLogs.length >= 1) {
    const ultimoPrecio = fuelLogs[0].precio_por_galon;
    costoPorKm = ultimoPrecio / rendKmGal;
  }

  // Autonomía real = tanque (gal) * rendimiento
  const capGal = specs?.capacidad_tanque_galones;
  const autonomiaKm = rendKmGal && capGal ? Math.round(capGal * rendKmGal) : null;

  // Próximo servicio preventivo
  let kmProximoServicio: number | null = null;
  const prev = maintenances
    .filter((m) => m.tipo === "preventivo" && m.odometro != null)
    .sort((a, b) => (b.odometro ?? 0) - (a.odometro ?? 0))[0];
  if (prev?.odometro != null) {
    const intervalo = 5000;
    const desde = vehicle.kilometraje - prev.odometro;
    kmProximoServicio = Math.max(0, intervalo - desde);
  }

  // Documentos que vencen (próximos 30 días o vencidos)
  const docsQueVencen = documents.filter((d) => daysUntil(d.fecha_vencimiento) <= 30);

  // Proyección anual: últimos 3 meses de gasto (combustible+mantenimiento) * 4
  const hace3m = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
  const gasto3m = fuelLogs
    .filter((f) => new Date(f.fecha) >= hace3m)
    .reduce((s, f) => s + (f.litros / GAL) * f.precio_por_galon, 0);
  const mant3m = maintenances.filter((m) => new Date(m.fecha) >= hace3m).reduce((s, m) => s + (m.costo || 0), 0);
  const proyeccionAnual = Math.round(((gasto3m + mant3m) / Math.max(1, 3)) * 12);

  // Inversión en mejoras
  const inversionMejoras = upgrades.reduce((s, u) => s + (u.costo || 0), 0);

  // ── Alertas ──
  const alertas: Alert[] = [];

  for (const doc of docsQueVencen) {
    const d = daysUntil(doc.fecha_vencimiento);
    const etiqueta = doc.tipo === "seguro_obligatorio" ? "seguro obligatorio" : doc.tipo === "revision_tecnica" ? "revisión técnica" : doc.tipo === "poliza_seguro" ? "póliza de seguro" : doc.tipo;
    if (d < 0) alertas.push({ id: "doc_" + doc.id, nivel: "alta", emoji: "🚨", frase: `Tu ${etiqueta} venció hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? "s" : ""}.`, href: "/auto/app/guantera" });
    else if (d === 0) alertas.push({ id: "doc_" + doc.id, nivel: "alta", emoji: "🚨", frase: `Tu ${etiqueta} vence HOY.`, href: "/auto/app/guantera" });
    else if (d <= 15) alertas.push({ id: "doc_" + doc.id, nivel: "alta", emoji: "🛡️", frase: `Tu ${etiqueta} vence en ${d} día${d !== 1 ? "s" : ""}.`, href: "/auto/app/guantera" });
    else alertas.push({ id: "doc_" + doc.id, nivel: "media", emoji: "🛡️", frase: `Tu ${etiqueta} vence en ${d} días.`, href: "/auto/app/guantera" });
  }

  if (kmProximoServicio != null) {
    if (kmProximoServicio === 0) alertas.push({ id: "servicio", nivel: "alta", emoji: "🔧", frase: "Te toca el mantenimiento del auto.", href: "/auto/app/bitacora" });
    else if (kmProximoServicio <= 500) alertas.push({ id: "servicio", nivel: "alta", emoji: "🔧", frase: `Faltan solo ${kmProximoServicio} km para el próximo servicio.`, href: "/auto/app/bitacora" });
  }

  if (diasSinCargar != null && diasSinCargar >= 20) {
    alertas.push({ id: "sin_carga", nivel: "media", emoji: "⛽", frase: `Hace ${diasSinCargar} días que no cargas combustible.`, href: "/auto/app/bitacora" });
  }

  if (diffMesPct != null && diffMesPct > 25) {
    alertas.push({ id: "gasto_alto", nivel: "media", emoji: "💸", frase: `Tu gasto de combustible subió ${diffMesPct}% este mes.`, href: "/auto/app/bitacora" });
  }

  return {
    eficiencia,
    rendimientoKmGal: rendKmGal,
    gasto30d,
    cargaMesActual,
    cargaMesPasado,
    diffMesPct,
    diasSinCargar,
    costoPorKm,
    autonomiaKm,
    kmProximoServicio,
    docsQueVencen,
    proyeccionAnual,
    inversionMejoras,
    alertas,
  };
}

export function saludoPorHora(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Estado general para el punto del asistente. */
export function nivelGeneral(alertas: Alert[]): "ok" | "media" | "alta" {
  if (alertas.some((a) => a.nivel === "alta")) return "alta";
  if (alertas.length) return "media";
  return "ok";
}

/* ══════════════ Series por rango de fechas (para gráficas) ══════════════ */

export interface SeriePoint { label: string; value: number; [k: string]: string | number; }

function inRange(fecha: string, start: string, end: string): boolean {
  return fecha >= start && fecha <= end;
}

function keyByBucket(fecha: string, granularity: "dia" | "semana" | "mes"): string {
  const d = new Date(fecha + "T12:00:00");
  if (granularity === "dia") return d.toISOString().slice(0, 10);
  if (granularity === "semana") {
    const m = new Date(d); m.setDate(m.getDate() - m.getDay()); return iso(m);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function iso(d: Date): string { return d.toISOString().slice(0, 10); }

function granularidadPara(rangoDias: number): "dia" | "semana" | "mes" {
  if (rangoDias <= 14) return "dia";
  if (rangoDias <= 90) return "semana";
  return "mes";
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function labelFor(key: string, granularity: "dia" | "semana" | "mes"): string {
  const d = new Date(key + "T12:00:00");
  if (granularity === "dia") return `${d.getDate()}/${d.getMonth() + 1}`;
  if (granularity === "semana") return `${d.getDate()}/${d.getMonth() + 1}`;
  return `${MESES[d.getMonth()]}`;
}

/** Serie de gasto de combustible en el rango, agrupada según duración. */
export function serieGasto(fuelLogs: FuelLog[], start: string, end: string): SeriePoint[] {
  const dias = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
  const g = granularidadPara(dias);
  const map = new Map<string, number>();
  for (const f of fuelLogs) {
    if (!inRange(f.fecha, start, end)) continue;
    const k = keyByBucket(f.fecha, g);
    map.set(k, (map.get(k) || 0) + (f.litros / GAL) * f.precio_por_galon);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({ label: labelFor(k, g), value: Math.round(v) }));
}

/** Serie de rendimiento (km/gal) en el rango, por carga. */
export function serieRendimiento(fuelLogs: FuelLog[], start: string, end: string): SeriePoint[] {
  const sorted = [...fuelLogs].filter((f) => inRange(f.fecha, start, end)).sort((a, b) => a.odometro - b.odometro);
  const out: SeriePoint[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const km = sorted[i].odometro - sorted[i - 1].odometro;
    const gal = sorted[i - 1].litros / GAL;
    if (km > 0 && gal > 0) {
      const d = new Date(sorted[i].fecha + "T12:00:00");
      out.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, value: Math.round(km / gal) });
    }
  }
  return out;
}

/** Composición de gasto por categoría en el rango. */
export function desgloseCategorias(fuelLogs: FuelLog[], maintenances: MaintenanceLog[], upgrades: VehicleUpgrade[], start: string, end: string) {
  const combustible = fuelLogs.filter((f) => inRange(f.fecha, start, end))
    .reduce((s, f) => s + (f.litros / GAL) * f.precio_por_galon, 0);
  const mantenimiento = maintenances.filter((m) => inRange(m.fecha, start, end))
    .reduce((s, m) => s + (m.costo || 0), 0);
  const mejoras = upgrades.filter((u) => inRange(u.fecha, start, end))
    .reduce((s, u) => s + (u.costo || 0), 0);
  return [
    { name: "Combustible", value: Math.round(combustible), color: CHART.amber },
    { name: "Mantenimiento", value: Math.round(mantenimiento), color: CHART.violet },
    { name: "Mejoras", value: Math.round(mejoras), color: CHART.blue },
  ].filter((x) => x.value >= 0) as { name: string; value: number; color: string }[];
}

/** Serie de gasto por mes (fuel+mantenimiento+mejoras) para bar chart comparativo. */
export function serieMensual(fuelLogs: FuelLog[], maintenances: MaintenanceLog[], upgrades: VehicleUpgrade[], start: string, end: string): { label: string; combustible: number; mantenimiento: number; mejoras: number }[] {
  const dias = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
  const g = granularidadPara(dias);
  const map = new Map<string, { combustible: number; mantenimiento: number; mejoras: number }>();
  const ensure = (k: string) => { if (!map.has(k)) map.set(k, { combustible: 0, mantenimiento: 0, mejoras: 0 }); return map.get(k)!; };
  for (const f of fuelLogs) if (inRange(f.fecha, start, end)) ensure(keyByBucket(f.fecha, g)).combustible += (f.litros / GAL) * f.precio_por_galon;
  for (const m of maintenances) if (inRange(m.fecha, start, end)) ensure(keyByBucket(m.fecha, g)).mantenimiento += (m.costo || 0);
  for (const u of upgrades) if (inRange(u.fecha, start, end)) ensure(keyByBucket(u.fecha, g)).mejoras += (u.costo || 0);
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({ label: labelFor(k, g), combustible: Math.round(v.combustible), mantenimiento: Math.round(v.mantenimiento), mejoras: Math.round(v.mejoras) }));
}
