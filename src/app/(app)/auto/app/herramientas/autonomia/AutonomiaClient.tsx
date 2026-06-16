"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Gauge, Fuel, Check } from "lucide-react";
import type { FuelLog } from "@/types/database";

interface Defaults {
  fuelLogs: FuelLog[];
  capacidadTanque: number | null;
}

export default function AutonomiaClient({ defaults }: { defaults: Defaults }) {
  const [capacidad, setCapacidad] = useState(defaults.capacidadTanque?.toString() || "14");
  const [rendimiento, setRendimiento] = useState("");
  const [usarPromedio, setUsarPromedio] = useState(false);

  // Calcular rendimiento promedio de fuel logs
  const rendimientoPromedio = useMemo(() => {
    if (defaults.fuelLogs.length < 2) return null;
    const sorted = [...defaults.fuelLogs].sort((a, b) => a.odometro - b.odometro);
    let totalKm = 0, totalGal = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalKm += sorted[i].odometro - sorted[i - 1].odometro;
      totalGal += sorted[i - 1].litros / 3.78541;
    }
    return totalGal > 0 ? Math.round(totalKm / totalGal) : null;
  }, [defaults.fuelLogs]);

  const rendimientoEfectivo = usarPromedio && rendimientoPromedio ? rendimientoPromedio : parseFloat(rendimiento) || 0;

  const resultados = useMemo(() => {
    const cap = parseFloat(capacidad);
    const ren = rendimientoEfectivo;
    if (!cap || !ren || cap <= 0 || ren <= 0) return null;

    const autonomia = Math.round(cap * ren);

    // Distancias de referencia Perú
    const viajes = [
      { nombre: "Lima → Arequipa", km: 1000 },
      { nombre: "Lima → Cusco", km: 1100 },
      { nombre: "Lima → Trujillo", km: 560 },
      { nombre: "Lima → Huancayo", km: 300 },
      { nombre: "Lima → Ica", km: 300 },
      { nombre: "Lima → Huaraz", km: 400 },
      { nombre: "Arequipa → Puno", km: 300 },
      { nombre: "Cusco → Puno", km: 390 },
    ];

    return { autonomia, viajes, cap, ren };
  }, [capacidad, rendimientoEfectivo]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>
      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Autonomía del Tanque</h1>
        <p className="text-xs text-zinc-500 mt-1">Calcula cuántos kilómetros puedes recorrer con el tanque lleno.</p>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4 space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-auto-500" /> Capacidad del tanque (galones)
          </span>
          <input type="number" min="1" step="0.1" value={capacidad}
            onChange={(e) => setCapacidad(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>

        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-auto-500" /> Rendimiento (km/gal)
            </span>
            {rendimientoPromedio && (
              <button onClick={() => { setUsarPromedio(!usarPromedio); if (!usarPromedio) setRendimiento(rendimientoPromedio.toString()); }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${usarPromedio ? "bg-auto-600 text-white" : "bg-auto-600/10 text-auto-500"}`}>
                {usarPromedio ? `${rendimientoPromedio} km/gal` : `Usar ${rendimientoPromedio} km/gal`}
              </button>
            )}
          </div>
          <input type="number" min="1" step="0.1" value={rendimiento}
            onChange={(e) => setRendimiento(e.target.value)}
            disabled={usarPromedio}
            placeholder={usarPromedio ? "" : "Ej: 45"}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20 disabled:bg-zinc-100" />
        </label>
      </div>

      {resultados ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-auto-500 to-auto-800 p-5 text-white text-center shadow-lg shadow-auto-600/20">
            <p className="text-xs text-white/70 mb-1">Autonomía máxima</p>
            <p className="text-4xl font-black">{resultados.autonomia.toLocaleString("es-PE")} km</p>
            <p className="text-xs text-white/60 mt-1">{resultados.cap} gal × {resultados.ren} km/gal</p>
          </div>

          <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-700 mb-3">¿Hasta dónde llegas?</h3>
            <div className="space-y-1.5">
              {resultados.viajes.map((v) => {
                const alcanza = resultados.autonomia >= v.km;
                const pct = Math.min(100, (v.km / resultados.autonomia) * 100);
                return (
                  <div key={v.nombre} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-32 truncate">{v.nombre}</span>
                    <div className="flex-1 h-4 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${alcanza ? "bg-auto-500" : "bg-auto-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold w-12 text-right flex items-center justify-end">{alcanza ? <Check className="w-3.5 h-3.5 text-auto-500" /> : `${v.km} km`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Ingresa la capacidad y rendimiento para calcular</p>
        </div>
      )}
    </div>
  );
}
