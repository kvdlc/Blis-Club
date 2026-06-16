"use client";

import type { Vehicle, FuelLog } from "@/types/database";
import { MapPin, Calendar, Activity, TrendingUp, Link as LinkIcon, Car } from "lucide-react";

interface Props {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  ecoScore: number;
}

export function HeroCard({ vehicle, fuelLogs, ecoScore }: Props) {
  const kmFormatted = vehicle.kilometraje.toLocaleString("es-PE");
  const estadoLabel =
    vehicle.estado === "activo" ? "Todo al día" :
    vehicle.estado === "en venta" ? "En venta" :
    vehicle.estado === "robado" ? "Robado" : "Vendido";

  const estadoColor =
    vehicle.estado === "activo" ? "bg-emerald-500" :
    vehicle.estado === "en venta" ? "bg-amber-500" : "bg-red-600";

  // Último rendimiento
  let lastRendimiento: string | null = null;
  if (fuelLogs.length >= 2) {
    const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const kmRecorridos = last.odometro - prev.odometro;
    const galones = last.litros / 3.78541;
    if (galones > 0) lastRendimiento = `${Math.round(kmRecorridos / galones)} km/gal`;
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] card-auto-dark-elevated p-5 text-zinc-100">
      {/* Decorative glows */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-auto-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-auto-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex gap-4">
        {/* Vehicle photo */}
        <div className="w-28 h-28 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 overflow-hidden shrink-0 shadow-inner">
          {vehicle.foto_url ? (
            <img src={vehicle.foto_url} alt="" className="w-full h-full object-cover object-center" />
          ) : (
            <Car className="w-8 h-8 text-zinc-400" />
          )}
        </div>

        {/* Vehicle info */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold truncate text-zinc-100">{vehicle.marca} {vehicle.modelo}</h2>
            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${
              vehicle.estado === "activo" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              vehicle.estado === "en venta" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
              "bg-red-500/10 text-red-400 border-red-500/20"
            }`}>
              {estadoLabel}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            <p className="text-zinc-400 text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 shrink-0 text-auto-500" />
              <span className="text-zinc-200 font-semibold">{kmFormatted}</span> km
            </p>
            <p className="text-zinc-400 text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-auto-500" />
              <span className="text-zinc-200 font-semibold">{vehicle.año}</span>
            </p>
            <p className="text-zinc-400 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-auto-500" />
              <span className="text-zinc-200 font-semibold">{vehicle.placa}</span>
            </p>
            {lastRendimiento && (
              <p className="text-zinc-400 text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 shrink-0 text-auto-500" />
                <span className="text-zinc-200 font-semibold">{lastRendimiento}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Eco-score minibadge */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/5 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 border border-white/10">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
          ecoScore >= 70 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
          ecoScore >= 40 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
          "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {ecoScore}
        </div>
        <span className="text-[9px] font-semibold text-zinc-400">Eco</span>
      </div>

      {/* Public profile link */}
      <a
        href={`/auto/vehiculo/${vehicle.id}`}
        target="_blank"
        rel="noopener"
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-colors"
        title="Perfil público del vehículo"
      >
        <LinkIcon className="w-4 h-4 text-zinc-300" />
      </a>
    </div>
  );
}
