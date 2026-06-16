"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Fuel, Wrench, TrendingDown } from "lucide-react";
import type { FuelLog, MaintenanceLog, VehicleSpecs } from "@/types/database";

interface Defaults {
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  specs: VehicleSpecs | null;
  valorCompra: null;
  anios: number | null;
}

export default function CostoKmRealClient({ defaults }: { defaults: Defaults }) {
  const [valorCompra, setValorCompra] = useState("");
  const [tasaDepreciacion, setTasaDepreciacion] = useState("12");
  const [anios, setAnios] = useState(defaults.anios?.toString() || "3");
  const [kmAnuales, setKmAnuales] = useState("15000");

  const resultados = useMemo(() => {
    const valor = parseFloat(valorCompra);
    const tasa = parseFloat(tasaDepreciacion) / 100;
    const a = parseFloat(anios);
    const kmAno = parseFloat(kmAnuales);
    if (!valor || !kmAno || kmAno <= 0) return null;

    // Combustible
    const gastoCombustible = defaults.fuelLogs.reduce((s, f) => s + f.precio_por_galon * (f.litros / 3.78541), 0);

    // Mantenimiento
    const gastoMantenimiento = defaults.maintenances.reduce((s, m) => s + (m.costo || 0), 0);

    // Depreciación anual
    const depreciacionAnual = valor * tasa;

    // Km total recorridos
    let kmRecorridos = 0;
    if (defaults.fuelLogs.length >= 2) {
      const sorted = [...defaults.fuelLogs].sort((a, b) => a.odometro - b.odometro);
      kmRecorridos = Math.max(1, sorted[sorted.length - 1].odometro - sorted[0].odometro);
    }

    const periodoAnios = defaults.fuelLogs.length > 0
      ? Math.max(0.5, (new Date().getTime() - new Date(Math.min(...defaults.fuelLogs.map((f) => new Date(f.fecha).getTime()))).getTime()) / (365 * 24 * 60 * 60 * 1000))
      : 1;

    const combustiblePorKm = kmRecorridos > 0 ? gastoCombustible / kmRecorridos : 0;
    const mantenimientoPorKm = kmRecorridos > 0 ? gastoMantenimiento / kmRecorridos : 0;
    const depreciacionPorKm = kmAno > 0 ? depreciacionAnual / kmAno : 0;
    const costoTotalPorKm = combustiblePorKm + mantenimientoPorKm + depreciacionPorKm;

    const costoAnual = costoTotalPorKm * kmAno;
    const costoMensual = costoAnual / 12;
    const costoDiario = costoAnual / 365;

    const maxCosto = Math.max(combustiblePorKm, mantenimientoPorKm, depreciacionPorKm, 0.01);

    return {
      combustiblePorKm, mantenimientoPorKm, depreciacionPorKm, costoTotalPorKm,
      costoAnual, costoMensual, costoDiario, maxCosto,
      barraComb: (combustiblePorKm / maxCosto) * 100,
      barraMant: (mantenimientoPorKm / maxCosto) * 100,
      barraDepr: (depreciacionPorKm / maxCosto) * 100,
    };
  }, [valorCompra, tasaDepreciacion, anios, kmAnuales, defaults]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-400 hover:text-auto-400">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>
      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Costo por Kilómetro Real</h1>
        <p className="text-xs text-zinc-400 mt-1">El verdadero costo de usar tu vehículo, incluyendo depreciación.</p>
      </div>

      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Valor de compra (S/)</span>
          <input type="number" min="1" step="1000" value={valorCompra}
            onChange={(e) => setValorCompra(e.target.value)} placeholder="Ej: 65000"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Deprec. anual %</span>
            <input type="number" min="1" max="30" value={tasaDepreciacion}
              onChange={(e) => setTasaDepreciacion(e.target.value)}
              className="w-full mt-0.5 px-2 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Años</span>
            <input type="number" min="0.5" step="0.5" value={anios}
              onChange={(e) => setAnios(e.target.value)}
              className="w-full mt-0.5 px-2 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Km/año</span>
            <input type="number" min="100" step="1000" value={kmAnuales}
              onChange={(e) => setKmAnuales(e.target.value)}
              className="w-full mt-0.5 px-2 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>
      </div>

      {resultados ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-auto-500 to-auto-800 p-5 text-white text-center shadow-lg shadow-auto-600/20">
            <p className="text-xs text-white/70 mb-1">Costo real por kilómetro</p>
            <p className="text-3xl font-black">S/ {resultados.costoTotalPorKm.toFixed(2)}</p>
            <p className="text-xs text-white/60 mt-1">S/ {Math.round(resultados.costoMensual).toLocaleString("es-PE")}/mes · S/ {Math.round(resultados.costoDiario).toLocaleString("es-PE")}/día</p>
          </div>

          <div className="card-auto-dark rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-extrabold text-zinc-300">Desglose por km</h3>
            {[
              { label: "Combustible", value: resultados.combustiblePorKm, barra: resultados.barraComb, color: "bg-amber-600/100" },
              { label: "Mantenimiento", value: resultados.mantenimientoPorKm, barra: resultados.barraMant, color: "bg-blue-600/100" },
              { label: "Depreciación", value: resultados.depreciacionPorKm, barra: resultados.barraDepr, color: "bg-violet-500" },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-bold text-zinc-300">{d.label}</span>
                  <span className="font-bold text-zinc-200">S/ {d.value.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-zinc-900/5 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.barra}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Ingresa los datos para ver el costo por km</p>
          <p className="text-xs text-zinc-500 mt-1">El valor de compra y km/año son necesarios</p>
        </div>
      )}
    </div>
  );
}
