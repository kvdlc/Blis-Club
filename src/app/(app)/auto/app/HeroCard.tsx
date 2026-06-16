"use client";

import type { Vehicle, FuelLog } from "@/types/database";
import { MapPin, Calendar, Activity, TrendingUp, Link as LinkIcon } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-auto-500 to-auto-800 p-4 text-white shadow-lg shadow-auto-600/20">
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

      <div className="relative z-10 flex gap-4">
        {/* Vehicle photo */}
        <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/20 overflow-hidden shrink-0">
          {vehicle.foto_url ? (
            <img src={vehicle.foto_url} alt="" className="w-full h-full object-cover object-center" />
          ) : (
            <span className="text-3xl">🚗</span>
          )}
        </div>

        {/* Vehicle info */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold truncate">{vehicle.marca} {vehicle.modelo}</h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${estadoColor} backdrop-blur-sm shrink-0`}>
              {estadoLabel}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
            <p className="text-white/85 text-xs flex items-center gap-1">
              <Activity className="w-3 h-3 shrink-0" />
              {kmFormatted} km
            </p>
            <p className="text-white/85 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" />
              {vehicle.año}
            </p>
            <p className="text-white/85 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {vehicle.placa}
            </p>
            {lastRendimiento && (
              <p className="text-white/85 text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3 shrink-0" />
                {lastRendimiento}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Eco-score minibadge */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${
          ecoScore >= 70 ? "bg-emerald-400 text-emerald-900" :
          ecoScore >= 40 ? "bg-amber-400 text-amber-900" :
          "bg-red-400 text-red-900"
        }`}>
          {ecoScore}
        </div>
        <span className="text-[9px] font-semibold text-white/80">Eco</span>
      </div>

      {/* Public profile link */}
      <a
        href={`/auto/vehiculo/${vehicle.id}`}
        target="_blank"
        rel="noopener"
        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
        title="Perfil público del vehículo"
      >
        <LinkIcon className="w-4 h-4 text-white" />
      </a>
    </div>
  );
}
