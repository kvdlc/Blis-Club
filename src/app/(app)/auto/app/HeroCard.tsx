"use client";

import { useEffect, useState } from "react";
import type { Vehicle, FuelLog } from "@/types/database";
import { Car, Gauge, Calendar, Tag } from "lucide-react";
import { rendimientoPromedio, calcEficiencia } from "@/lib/insights";

interface Props {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  ecoScore: number; // 0-100 (eficiencia)
}

export function HeroCard({ vehicle, fuelLogs }: Props) {
  const [kmDisplay, setKmDisplay] = useState(0);
  const rendKmGal = rendimientoPromedio(fuelLogs);
  const eficiencia = calcEficiencia(rendKmGal);
  const targetKm = vehicle.kilometraje || 0;

  // Contador animado del odómetro
  useEffect(() => {
    let raf = 0;
    const dur = 900;
    const t0 = performance.now();
    const from = Math.max(0, targetKm - 600);
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setKmDisplay(Math.round(from + (targetKm - from) * ease));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetKm]);

  const estadoLabel =
    vehicle.estado === "activo" ? "Todo al día" :
    vehicle.estado === "en venta" ? "En venta" :
    vehicle.estado === "robado" ? "Robado" : "Vendido";

  const estadoPill =
    vehicle.estado === "activo" ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" :
    vehicle.estado === "en venta" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
    "text-red-400 border-red-500/30 bg-red-500/10";

  const eficienciaColor = eficiencia >= 70 ? "text-emerald-400" : eficiencia >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-white/[0.06] border border-white/10">
      {/* HUD corners */}
      <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-auto-500/60 rounded-tl-md pointer-events-none" />
      <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-auto-500/60 rounded-tr-md pointer-events-none" />
      <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-auto-500/60 rounded-bl-md pointer-events-none" />
      <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-auto-500/60 rounded-br-md pointer-events-none" />

      {/* carbon-ish top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-auto-600 via-auto-400 to-auto-600 opacity-80" />

      <div className="p-4">
        <div className="flex gap-4">
          {/* Foto */}
          <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
            {vehicle.foto_url ? (
              <img src={vehicle.foto_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Car className="w-8 h-8 text-zinc-500" />
            )}
          </div>

          {/* Nombre + estado + año */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-extrabold text-zinc-100 truncate leading-tight">{vehicle.marca} {vehicle.modelo}</h2>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${estadoPill}`}>{estadoLabel}</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500"><Calendar className="w-3 h-3" />{vehicle.año}</span>
            </div>

            {/* Placa estilo placa real */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-zinc-900 border border-zinc-700 px-2 py-0.5">
              <Tag className="w-3 h-3 text-zinc-500" />
              <span className="text-[11px] font-black tracking-[0.2em] text-zinc-100">{vehicle.placa}</span>
            </div>
          </div>
        </div>

        {/* Odómetro digital */}
        <div className="mt-3 flex items-end justify-between rounded-xl bg-black/40 border border-white/10 px-3 py-2">
          <div className="flex items-center gap-2 text-zinc-500">
            <Gauge className="w-4 h-4 text-auto-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Odómetro</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-digit text-2xl font-black text-white tabular-nums">{kmDisplay.toLocaleString("es-PE")}</span>
            <span className="text-[10px] text-zinc-500">km</span>
          </div>
        </div>

        {/* Eficiencia */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500">Eficiencia</span>
            <span className={`text-sm font-black ${eficienciaColor}`}>{eficiencia}%</span>
            <span className="text-[10px] text-zinc-600">de 100</span>
          </div>
          {rendKmGal != null && (
            <span className="text-[10px] text-zinc-500">{rendKmGal} km/gal</span>
          )}
        </div>
      </div>
    </div>
  );
}
