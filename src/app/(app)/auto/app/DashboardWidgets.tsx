"use client";

import { useState, useEffect, useMemo } from "react";
import type { Vehicle, FuelLog, VehicleDocument } from "@/types/database";
import { Calendar, TrendingUp, ShieldCheck, Droplets, DollarSign } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  ecoScore: number;
  nextDocExpiry: VehicleDocument | null;
  fuelLogs: FuelLog[];
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

export function DashboardWidgets({ vehicle, ecoScore, nextDocExpiry, fuelLogs }: Props) {
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

  // Eco-score color
  const ecoColor = ecoScore >= 70 ? "text-emerald-600" : ecoScore >= 40 ? "text-amber-600" : "text-red-600";
  const ecoBg = ecoScore >= 70 ? "bg-emerald-500" : ecoScore >= 40 ? "bg-amber-500" : "bg-red-500";
  const ecoDashOffset = 97.4 - (97.4 * ecoScore) / 100;

  return (
    <div className="space-y-3">
      {/* Próximos trámites */}
      <div className="card-soft rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">Trámites por vencer</h3>
        </div>

        {nextDocExpiry ? (
          (() => {
            const dias = daysUntil(nextDocExpiry.fecha_vencimiento);
            return (
              <div className={`rounded-xl p-3 flex items-center justify-between ${
                dias <= 7 ? "bg-red-50 border border-red-200" :
                dias <= 15 ? "bg-amber-50 border border-amber-200" :
                "bg-emerald-50 border border-emerald-200"
              }`}>
                <div>
                  <p className="text-sm font-bold text-zinc-800">{documentLabels[nextDocExpiry.tipo] || nextDocExpiry.tipo}</p>
                  <p className="text-xs text-zinc-500">Vence: {new Date(nextDocExpiry.fecha_vencimiento + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  dias <= 7 ? "bg-red-100 text-red-700" :
                  dias <= 15 ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                }`}>
                  {dias <= 0 ? "Vencido" : `${dias} días`}
                </span>
              </div>
            );
          })()
        ) : (
          <p className="text-xs text-zinc-400 text-center py-2">
            Registra tus documentos en Guantera para ver las fechas de vencimiento.
          </p>
        )}
      </div>

      {/* Grid inferior: Eco-Score, Estado, Gasto, Rendimiento */}
      <div className="grid grid-cols-2 gap-3">
        {/* Eco-Score */}
        <div className="card-soft rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-zinc-700">Eco-Score</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  className={ecoColor} strokeDasharray="97.4" strokeDashoffset={ecoDashOffset} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-sm font-black ${ecoColor}`}>
                {ecoScore}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-1">
            {fuelLogs.length < 2 ? "Carga combustible para calcular" : "Basado en tus últimas cargas"}
          </p>
        </div>

        {/* Estado del vehículo */}
        <div className="card-soft rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-auto-100 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-auto-600" />
            </div>
            <h3 className="text-xs font-bold text-zinc-700">Estado</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              vehicle.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
              vehicle.estado === "en venta" ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            }`}>
              {vehicle.estado === "activo" ? "Todo al día" :
               vehicle.estado === "en venta" ? "En venta" :
               vehicle.estado === "robado" ? "Robado" : "Vendido"}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-1">
            {vehicle.estado === "activo" ? "Sin alertas" : "Requiere atención"}
          </p>
        </div>

        {/* Gasto mensual */}
        <div className="card-soft rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-xs font-bold text-zinc-700">Gasto 30d</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="text-lg font-black text-zinc-800">
              S/ {Math.round(gastoMensual).toLocaleString("es-PE")}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-1">
            {fuelLogs.length > 0 ? "Combustible últimos 30 días" : "Sin datos"}
          </p>
        </div>

        {/* Rendimiento promedio */}
        <div className="card-soft rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <h3 className="text-xs font-bold text-zinc-700">Rendimiento</h3>
          </div>
          <div className="flex items-center justify-center py-1">
            <span className="text-lg font-black text-zinc-800">
              {rendimientoPromedio != null ? `${rendimientoPromedio}` : "—"}
            </span>
            {rendimientoPromedio && <span className="text-xs text-zinc-500 ml-0.5">km/gal</span>}
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-1">
            {fuelLogs.length >= 2 ? "Promedio general" : "Registra 2+ cargas"}
          </p>
        </div>
      </div>
    </div>
  );
}
