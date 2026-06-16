"use client";

import { useState, useEffect, useMemo } from "react";
import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleSpecs } from "@/types/database";
import { Calendar, TrendingUp, ShieldCheck, Droplets, DollarSign, Wrench, Clock, Gauge, Trophy } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  ecoScore: number;
  nextDocExpiry: VehicleDocument | null;
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  specs: VehicleSpecs | null;
  badges?: string[];
}

const documentLabels: Record<string, string> = {
  soat: "SOAT",
  revision_tecnica: "Revisión Técnica",
  poliza_seguro: "Póliza de Seguro",
  matricula: "Matrícula",
  licencia_conducir: "Licencia",
};

function daysUntil(dateStr: string): number {
  if (typeof window === "undefined") return 999;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function DashboardWidgets({ vehicle, ecoScore, nextDocExpiry, fuelLogs, maintenances, specs, badges = [] }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Calcular gasto mensual promedio en combustible (solo cliente)
  const gastoMensual = useMemo(() => {
    if (!mounted || fuelLogs.length === 0) return 0;
    const ahora = Date.now();
    const unMesAtras = ahora - 30 * 24 * 60 * 60 * 1000;
    const logsRecientes = fuelLogs.filter((l) => new Date(l.fecha).getTime() > unMesAtras);
    return logsRecientes.reduce((sum, l) => sum + (l.litros / 3.78541) * l.precio_por_galon, 0);
  }, [mounted, fuelLogs]);

  // Rendimiento promedio general
  const rendimientoPromedio = (() => {
    if (fuelLogs.length < 2) return null;
    const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
    let totalKm = 0;
    let totalGal = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalKm += sorted[i].odometro - sorted[i - 1].odometro;
      totalGal += sorted[i - 1].litros / 3.78541;
    }
    return totalGal > 0 ? Math.round(totalKm / totalGal) : null;
  })();

  // Eco-score color - uniform emerald
  const ecoColor = "text-auto-500";
  const ecoDashOffset = 97.4 - (97.4 * ecoScore) / 100;

  return (
    <div className="space-y-3">
      {/* Próximos trámites */}
        <div className="card-auto-dark rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-auto-500" />
          </div>
          <h3 className="text-sm font-bold text-zinc-100">Trámites por vencer</h3>
        </div>

        {nextDocExpiry ? (
          (() => {
            const dias = daysUntil(nextDocExpiry.fecha_vencimiento);
            return (
              <div className={`rounded-xl p-3 flex items-center justify-between border ${
                dias <= 7 ? "bg-auto-900/30 border-auto-700/20" :
                dias <= 15 ? "bg-auto-700/10 border-auto-600/20" :
                "bg-auto-600/10 border-auto-600/20"
              }`}>
                <div>
                  <p className="text-sm font-bold text-zinc-100">{documentLabels[nextDocExpiry.tipo] || nextDocExpiry.tipo}</p>
                  <p className="text-xs text-zinc-500">Vence: {new Date(nextDocExpiry.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  dias <= 7 ? "bg-auto-900/30 text-auto-400 border-auto-700/20" :
                  dias <= 15 ? "bg-auto-700/10 text-auto-500 border-auto-600/20" :
                  "bg-auto-600/10 text-auto-500 border-auto-600/20"
                }`}>
                  {dias <= 0 ? "Vencido" : `${dias} días`}
                </span>
              </div>
            );
          })()
        ) : (
          <p className="text-xs text-zinc-500 text-center py-2">
            Registra tus documentos en Guantera para ver las fechas de vencimiento.
          </p>
        )}
      </div>

      {/* Grid inferior: Eco-Score, Estado, Gasto, Rendimiento */}
      <div className="grid grid-cols-2 gap-3">
        {/* Eco-Score */}
        <div className="card-auto-dark rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-auto-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Eco-Score</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  className={ecoColor} strokeDasharray="97.4" strokeDashoffset={ecoDashOffset} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${ecoColor}`}>
                {ecoScore}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1">
            {fuelLogs.length < 2 ? "Carga combustible para calcular" : "Basado en tus últimas cargas"}
          </p>
        </div>

        {/* Estado del vehículo */}
        <div className="card-auto-dark rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-auto-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Estado</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              vehicle.estado === "activo" ? "bg-auto-600/10 text-auto-500 border-auto-600/20" :
              vehicle.estado === "en venta" ? "bg-auto-700/10 text-auto-500 border-auto-600/20" :
              "bg-auto-900/30 text-auto-400 border-auto-700/20"
            }`}>
              {vehicle.estado === "activo" ? "Todo al día" :
               vehicle.estado === "en venta" ? "En venta" :
               vehicle.estado === "robado" ? "Robado" : "Vendido"}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1">
            {vehicle.estado === "activo" ? "Sin alertas" : "Requiere atención"}
          </p>
        </div>

        {/* Gasto mensual */}
        <div className="card-auto-dark rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-auto-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Gasto 30d</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="text-lg font-black text-zinc-100">
              S/ {Math.round(gastoMensual).toLocaleString("es-PE")}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1">
            {fuelLogs.length > 0 ? "Combustible últimos 30 días" : "Sin datos"}
          </p>
        </div>

        {/* Rendimiento promedio */}
        <div className="card-auto-dark rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-auto-500" />
            </div>
            <h3 className="text-xs font-bold text-zinc-300">Rendimiento</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="text-lg font-black text-zinc-100">
              {rendimientoPromedio != null ? `${rendimientoPromedio}` : "—"}
            </span>
            {rendimientoPromedio && <span className="text-xs text-zinc-500 ml-0.5">km/gal</span>}
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-1">
            {fuelLogs.length >= 2 ? "Promedio general" : "Registra 2+ cargas"}
          </p>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="card-auto-dark rounded-2xl p-4">
          <h3 className="text-xs font-extrabold text-zinc-300 mb-2 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Logros ({badges.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((key) => (
              <span key={key} className="text-[9px] font-bold bg-auto-600/10 text-auto-500 px-2 py-1 rounded-full border border-auto-600/20">
                {key.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── B1-B4: Nuevos widgets ── */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {/* B1: Próximo mantenimiento */}
        <MaintenanceWidget maintenances={maintenances} currentKm={vehicle.kilometraje} />

        {/* B2: Gasto vs mes pasado */}
        <CompareMonthWidget fuelLogs={fuelLogs} maintenances={maintenances} />

        {/* B3: Autonomía del tanque */}
        <AutonomiaWidget fuelLogs={fuelLogs} specs={specs} />

        {/* B4: Días sin cargar */}
        <LastFuelWidget fuelLogs={fuelLogs} />
      </div>
    </div>
  );
}

function MaintenanceWidget({ maintenances, currentKm }: { maintenances: MaintenanceLog[]; currentKm: number }) {
  const lastPreventivo = maintenances
    .filter((m) => m.tipo === "preventivo")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

  const intervalKm = 5000; // km entre servicios preventivos
  if (!lastPreventivo?.odometro) {
    return (
      <div className="card-auto-dark rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <h3 className="text-xs font-bold text-zinc-300">Próximo servicio</h3>
        </div>
        <p className="text-[10px] text-zinc-500 text-center py-2">Registra un mantenimiento preventivo</p>
      </div>
    );
  }

  const kmDesdeUltimo = currentKm - lastPreventivo.odometro;
  const kmRestantes = Math.max(0, intervalKm - kmDesdeUltimo);
  const pct = Math.min(100, (kmDesdeUltimo / intervalKm) * 100);

  return (
    <div className="card-auto-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Wrench className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <h3 className="text-xs font-bold text-zinc-300">Próximo servicio</h3>
      </div>
      <p className="text-lg font-black text-zinc-100">{kmRestantes.toLocaleString("es-PE")} km</p>
      <div className="h-2 bg-white/5 rounded-full mt-1 overflow-hidden">
        <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-violet-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-zinc-500 mt-1">{kmDesdeUltimo} km desde último · cada {intervalKm.toLocaleString("es-PE")} km</p>
    </div>
  );
}

function CompareMonthWidget({ fuelLogs, maintenances }: { fuelLogs: FuelLog[]; maintenances: MaintenanceLog[] }) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
  const añoActual = ahora.getFullYear();
  const añoMesPasado = mesActual === 0 ? añoActual - 1 : añoActual;

  const gastoMes = (logs: { fecha: string; costo: number }[]) =>
    logs.filter((l) => {
      const d = new Date(l.fecha);
      return d.getMonth() === mesActual && d.getFullYear() === añoActual;
    }).reduce((s, l) => s + l.costo, 0);

  const gastoMesPasado = (logs: { fecha: string; costo: number }[]) =>
    logs.filter((l) => {
      const d = new Date(l.fecha);
      return d.getMonth() === mesPasado && d.getFullYear() === añoMesPasado;
    }).reduce((s, l) => s + l.costo, 0);

  const actual = gastoMes(fuelLogs.map((f) => ({ fecha: f.fecha, costo: Math.round(f.precio_por_galon * (f.litros / 3.78541)) })))
    + gastoMes(maintenances.map((m) => ({ fecha: m.fecha, costo: Math.round(m.costo || 0) })));

  const pasado = gastoMesPasado(fuelLogs.map((f) => ({ fecha: f.fecha, costo: Math.round(f.precio_por_galon * (f.litros / 3.78541)) })))
    + gastoMesPasado(maintenances.map((m) => ({ fecha: m.fecha, costo: Math.round(m.costo || 0) })));

  const diff = actual - pasado;
  const pctCambio = pasado > 0 ? Math.round(Math.abs(diff / pasado) * 100) : 0;
  const subio = diff > 0;

  return (
    <div className="card-auto-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <h3 className="text-xs font-bold text-zinc-300">vs mes pasado</h3>
      </div>
      <p className="text-lg font-black text-zinc-100">S/ {actual.toLocaleString("es-PE")}</p>
      {pasado > 0 && (
        <p className={`text-[10px] font-bold mt-1 ${subio ? "text-red-400" : "text-emerald-400"}`}>
          {subio ? "↑" : "↓"} {pctCambio}% vs S/ {pasado.toLocaleString("es-PE")}
        </p>
      )}
      {pasado === 0 && <p className="text-[10px] text-zinc-500 mt-1">Sin datos del mes pasado</p>}
    </div>
  );
}

function AutonomiaWidget({ fuelLogs, specs }: { fuelLogs: FuelLog[]; specs: VehicleSpecs | null }) {
  const capacidad = specs?.capacidad_tanque_galones || 14;

  const rendimientoPromedio = (() => {
    if (fuelLogs.length < 2) return null;
    const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
    let totalKm = 0, totalGal = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalKm += sorted[i].odometro - sorted[i - 1].odometro;
      totalGal += sorted[i - 1].litros / 3.78541;
    }
    return totalGal > 0 ? Math.round(totalKm / totalGal) : null;
  })();

  const autonomia = rendimientoPromedio ? Math.round(capacidad * rendimientoPromedio) : null;

  return (
    <div className="card-auto-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Gauge className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <h3 className="text-xs font-bold text-zinc-300">Autonomía</h3>
      </div>
      <p className="text-lg font-black text-zinc-100">
        {autonomia ? `${autonomia.toLocaleString("es-PE")} km` : "—"}
      </p>
      <p className="text-[10px] text-zinc-500 mt-1">
        {autonomia ? `Tanque de ${capacidad} gal · ${rendimientoPromedio} km/gal` : "Registra 2+ cargas"}
      </p>
    </div>
  );
}

function LastFuelWidget({ fuelLogs }: { fuelLogs: FuelLog[] }) {
  const lastFuel = fuelLogs.length > 0
    ? fuelLogs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0]
    : null;

  const diasSinCargar = lastFuel
    ? Math.ceil((Date.now() - new Date(lastFuel.fecha).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="card-auto-dark rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <h3 className="text-xs font-bold text-zinc-300">Última carga</h3>
      </div>
      <p className="text-lg font-black text-zinc-100">
        {diasSinCargar != null ? `${diasSinCargar} días` : "—"}
      </p>
      <p className="text-[10px] text-zinc-500 mt-1">
        {lastFuel ? `${lastFuel.litros} L · S/ ${lastFuel.precio_por_galon}/gal` : "Sin cargas registradas"}
      </p>
    </div>
  );
}
