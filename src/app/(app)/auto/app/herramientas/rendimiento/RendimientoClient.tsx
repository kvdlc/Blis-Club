"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Fuel, TrendingDown, Zap, BarChart3, Info } from "lucide-react";

interface Defaults {
  octanajeRecomendado: string | null;
  capacidadTanque: number | null;
  ultimosPrecios: Record<string, number> | null;
}

export default function RendimientoClient({ defaults }: { defaults: Defaults }) {
  const [precioA, setPrecioA] = useState(defaults.ultimosPrecios?.regular?.toString() || "");
  const [precioB, setPrecioB] = useState(defaults.ultimosPrecios?.premium?.toString() || "");
  const [rendimientoA, setRendimientoA] = useState("");
  const [rendimientoB, setRendimientoB] = useState("");
  const [kmAnuales, setKmAnuales] = useState("15000");
  const [capacidadTanque, setCapacidadTanque] = useState(defaults.capacidadTanque?.toString() || "");
  const [nombres, setNombres] = useState({
    a: defaults.octanajeRecomendado || "Regular (90)",
    b: "Premium (95)",
  });

  const usarPrecio = (tipo: string, target: "a" | "b") => {
    if (defaults.ultimosPrecios?.[tipo]) {
      if (target === "a") setPrecioA(defaults.ultimosPrecios[tipo].toString());
      else setPrecioB(defaults.ultimosPrecios[tipo].toString());
    }
  };

  const resultados = useMemo(() => {
    const pA = parseFloat(precioA);
    const pB = parseFloat(precioB);
    const rA = parseFloat(rendimientoA);
    const rB = parseFloat(rendimientoB);
    const kmAno = parseFloat(kmAnuales);
    const capTanque = parseFloat(capacidadTanque) || 14;

    if (!pA || !pB || !rA || !rB || pA <= 0 || pB <= 0 || rA <= 0 || rB <= 0) return null;

    const costoPorKmA = pA / rA;
    const costoPorKmB = pB / rB;
    const costoPorGalA = pA;
    const costoPorGalB = pB;

    // ¿Cuál es mejor?
    const mejor = costoPorKmA < costoPorKmB ? "a" : "b";
    const ahorroPorKm = Math.abs(costoPorKmA - costoPorKmB);
    const ahorroPorGal = Math.abs(pA - pB);

    // Proyecciones
    const costoPorTanqueA = capTanque * pA;
    const costoPorTanqueB = capTanque * pB;
    const diferenciaPorTanque = Math.abs(costoPorTanqueA - costoPorTanqueB);

    const kmPorTanqueA = capTanque * rA;
    const kmPorTanqueB = capTanque * rB;

    const ahorroAnual = ahorroPorKm * kmAno;
    const gastoAnualA = costoPorKmA * kmAno;
    const gastoAnualB = costoPorKmB * kmAno;

    const ventajaPct = ((Math.abs(costoPorKmA - costoPorKmB) / Math.max(costoPorKmA, costoPorKmB)) * 100);

    // Para gráfico de barras comparativas
    const maxCpk = Math.max(costoPorKmA, costoPorKmB);

    return {
      costoPorKm: { a: costoPorKmA, b: costoPorKmB },
      costoPorTanque: { a: costoPorTanqueA, b: costoPorTanqueB },
      kmPorTanque: { a: kmPorTanqueA, b: kmPorTanqueB },
      diferenciaPorTanque,
      ahorroAnual,
      gastoAnual: { a: gastoAnualA, b: gastoAnualB },
      ventajaPct,
      mejor,
      barraA: (costoPorKmA / maxCpk) * 100,
      barraB: (costoPorKmB / maxCpk) * 100,
    };
  }, [precioA, precioB, rendimientoA, rendimientoB, kmAnuales, capacidadTanque]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-600 hover:text-auto-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Comparador de Combustible</h1>
        <p className="text-xs text-zinc-400 mt-1">Descubre qué octanaje te conviene más por tu dinero.</p>
      </div>

      {/* Combustible A */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Fuel className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <input
            type="text" value={nombres.a} onChange={(e) => setNombres({ ...nombres, a: e.target.value })}
            className="text-sm font-bold text-zinc-200 bg-transparent border-b border-dashed border-white/15 focus:outline-none focus:border-auto-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Precio por galón (S/)</span>
            <div className="flex gap-1 mt-0.5">
              <input type="number" min="1" step="0.01" value={precioA}
                onChange={(e) => setPrecioA(e.target.value)} placeholder="S/"
                className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
              {defaults.ultimosPrecios?.regular && (
                <button onClick={() => usarPrecio("regular", "a")} className="px-2 py-2 rounded-lg bg-zinc-900/5 text-[10px] font-bold text-zinc-400 hover:bg-auto-600/15 hover:text-auto-600 transition-colors">
                  S/{defaults.ultimosPrecios.regular}
                </button>
              )}
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Rendimiento (km/gal)</span>
            <input type="number" min="1" step="0.1" value={rendimientoA}
              onChange={(e) => setRendimientoA(e.target.value)} placeholder="Ej: 42"
              className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
          </label>
        </div>
      </div>

      {/* VS */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-zinc-900/10" />
        <span className="text-xs font-black text-zinc-500 bg-zinc-900/5 px-3 py-1 rounded-full">VS</span>
        <div className="h-px flex-1 bg-zinc-900/10" />
      </div>

      {/* Combustible B */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <input
            type="text" value={nombres.b} onChange={(e) => setNombres({ ...nombres, b: e.target.value })}
            className="text-sm font-bold text-zinc-200 bg-transparent border-b border-dashed border-white/15 focus:outline-none focus:border-auto-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Precio por galón (S/)</span>
            <div className="flex gap-1 mt-0.5">
              <input type="number" min="1" step="0.01" value={precioB}
                onChange={(e) => setPrecioB(e.target.value)} placeholder="S/"
                className="flex-1 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
              {defaults.ultimosPrecios?.premium && (
                <button onClick={() => usarPrecio("premium", "b")} className="px-2 py-2 rounded-lg bg-zinc-900/5 text-[10px] font-bold text-zinc-400 hover:bg-violet-100 hover:text-violet-600 transition-colors">
                  S/{defaults.ultimosPrecios.premium}
                </button>
              )}
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Rendimiento (km/gal)</span>
            <input type="number" min="1" step="0.1" value={rendimientoB}
              onChange={(e) => setRendimientoB(e.target.value)} placeholder="Ej: 46"
              className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
          </label>
        </div>
      </div>

      {/* Parámetros adicionales */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Parámetros de proyección
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Km por año</span>
            <input type="number" min="1" value={kmAnuales}
              onChange={(e) => setKmAnuales(e.target.value)}
              className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-400">Capacidad tanque (gal)</span>
            <input type="number" min="1" step="0.1" value={capacidadTanque}
              onChange={(e) => setCapacidadTanque(e.target.value)}
              className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200" />
          </label>
        </div>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Ganador */}
          <div className={`rounded-2xl p-4 text-center border-2 ${resultados.mejor === "a" ? "bg-amber-600/10 border-amber-200" : "bg-violet-50 border-violet-200"}`}>
            <p className="text-xs text-zinc-400 mb-1">Más económico</p>
            <p className="text-lg font-black text-zinc-200">
              {resultados.mejor === "a" ? nombres.a : nombres.b}
            </p>
            <p className="text-sm font-bold text-emerald-600 mt-1">
              {resultados.ventajaPct.toFixed(1)}% más barato por km
            </p>
          </div>

          {/* Barras de costo por km */}
          <div className="card-auto-dark rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-auto-500" /> Costo por kilómetro
            </h3>

            {/* Barra A */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-zinc-300">{nombres.a}</span>
                <span className="font-bold text-zinc-200">S/ {resultados.costoPorKm.a.toFixed(4)}</span>
              </div>
              <div className="h-4 bg-zinc-900/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600/100 rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${Math.max(resultados.barraA, 5)}%` }}>
                  {resultados.barraA > 25 && <span className="text-[8px] font-bold text-white">S/ {resultados.costoPorKm.a.toFixed(2)}</span>}
                </div>
              </div>
            </div>

            {/* Barra B */}
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-zinc-300">{nombres.b}</span>
                <span className="font-bold text-zinc-200">S/ {resultados.costoPorKm.b.toFixed(4)}</span>
              </div>
              <div className="h-4 bg-zinc-900/5 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500" style={{ width: `${Math.max(resultados.barraB, 5)}%` }}>
                  {resultados.barraB > 25 && <span className="text-[8px] font-bold text-white">S/ {resultados.costoPorKm.b.toFixed(2)}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Proyecciones */}
          <div className="grid grid-cols-2 gap-2">
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Por tanque lleno</p>
              <p className="text-base font-black text-zinc-200">
                {resultados.mejor === "a" ? "Ahorras" : "Ahorras"}
              </p>
              <p className="text-xs font-bold text-emerald-600">
                S/ {resultados.diferenciaPorTanque.toFixed(2)}
              </p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Ahorro anual</p>
              <p className="text-base font-black text-zinc-200">
                S/ {resultados.ahorroAnual.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs font-bold text-emerald-600">
                con {resultados.mejor === "a" ? nombres.a : nombres.b}
              </p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Km por tanque (A)</p>
              <p className="text-base font-black text-zinc-200">
                {Math.round(resultados.kmPorTanque.a).toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-zinc-500">{nombres.a}</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Km por tanque (B)</p>
              <p className="text-base font-black text-zinc-200">
                {Math.round(resultados.kmPorTanque.b).toLocaleString("es-PE")}
              </p>
              <p className="text-xs text-zinc-500">{nombres.b}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Completa los 4 campos para comparar</p>
          <p className="text-xs text-zinc-500 mt-1">Precio y rendimiento de ambos combustibles</p>
        </div>
      )}
    </div>
  );
}
