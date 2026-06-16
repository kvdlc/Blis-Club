"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, TrendingDown, Calendar, BarChart3 } from "lucide-react";

const tasasComunes = [
  { label: "Sedán / Hatchback", tasa: 12 },
  { label: "SUV", tasa: 10 },
  { label: "Pick-up / Camioneta", tasa: 11 },
  { label: "Auto de lujo", tasa: 15 },
  { label: "Auto chino nuevo", tasa: 18 },
];

export default function DepreciacionClient() {
  const [valorCompra, setValorCompra] = useState("");
  const [anios, setAnios] = useState("3");
  const [tasaAnual, setTasaAnual] = useState("12");

  const resultados = useMemo(() => {
    const valor = parseFloat(valorCompra);
    const aniosNum = parseFloat(anios);
    const tasa = parseFloat(tasaAnual) / 100;

    if (!valor || !aniosNum || !tasa || valor <= 0 || aniosNum < 0 || tasa <= 0) return null;

    // Lineal: Valor = Compra - (Compra × tasa × años)
    const depreciacionTotalLineal = valor * tasa * aniosNum;
    const valorActualLineal = Math.max(0, valor - depreciacionTotalLineal);
    const pctRestanteLineal = valor > 0 ? (valorActualLineal / valor) * 100 : 0;

    // Compuesto: Valor = Compra × (1 - tasa)^años
    const valorActualCompuesto = valor * Math.pow(1 - tasa, aniosNum);
    const depreciacionTotalCompuesto = valor - valorActualCompuesto;
    const pctRestanteCompuesto = valor > 0 ? (valorActualCompuesto / valor) * 100 : 0;

    // Pérdida mensual
    const meses = aniosNum * 12;
    const perdidaMensualLineal = meses > 0 ? depreciacionTotalLineal / meses : 0;
    const perdidaDiariaLineal = meses > 0 ? depreciacionTotalLineal / (aniosNum * 365) : 0;

    // Proyección año por año para tabla/barras
    const proyeccion: { anio: number; valor: number; perdida: number }[] = [];
    for (let i = 0; i <= Math.min(aniosNum + 3, 10); i++) {
      const v = Math.max(0, valor - valor * tasa * i);
      proyeccion.push({
        anio: i,
        valor: v,
        perdida: i === 0 ? 0 : (valor * tasa),
      });
    }

    // Barras horizontales
    const maxBar = Math.max(valorActualLineal, valorActualCompuesto, valor * 0.1);

    return {
      valorActualLineal,
      valorActualCompuesto,
      depreciacionTotalLineal,
      depreciacionTotalCompuesto,
      pctRestanteLineal,
      pctRestanteCompuesto,
      perdidaMensualLineal,
      perdidaDiariaLineal,
      proyeccion,
      barraLineal: (valorActualLineal / maxBar) * 100,
      barraCompuesto: (valorActualCompuesto / maxBar) * 100,
    };
  }, [valorCompra, anios, tasaAnual]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-400 hover:text-auto-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Depreciación</h1>
        <p className="text-xs text-zinc-400 mt-1">Proyecta el valor de reventa actual de tu vehículo.</p>
      </div>

      {/* Inputs */}
      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-auto-500" /> Valor de compra (S/)
          </span>
          <input
            type="number" min="1" step="1000"
            value={valorCompra} onChange={(e) => setValorCompra(e.target.value)}
            placeholder="Ej: 65000"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-auto-500" /> Años de antigüedad
          </span>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range" min="0" max="15" step="0.5"
              value={anios} onChange={(e) => setAnios(e.target.value)}
              className="flex-1 accent-auto-600"
            />
            <span className="text-sm font-bold text-auto-400 w-10 text-right">{anios}</span>
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-auto-500" /> Depreciación anual (%)
          </span>
          <input
            type="number" min="1" max="30" step="0.5"
            value={tasaAnual} onChange={(e) => setTasaAnual(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-200"
          />
        </label>

        {/* Tasas de referencia */}
        <div className="flex flex-wrap gap-1">
          {tasasComunes.map((t) => (
            <button
              key={t.label}
              onClick={() => setTasaAnual(t.tasa.toString())}
              className={`text-[9px] font-medium px-2 py-1 rounded-full transition-colors ${
                tasaAnual === t.tasa.toString()
                  ? "bg-auto-600/100 text-white"
                  : "bg-zinc-900/5 text-zinc-400 hover:bg-auto-600/15 hover:text-auto-400"
              }`}
            >
              {t.label} {t.tasa}%
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {resultados ? (
        <div className="space-y-3">
          {/* Valor actual - tarjeta principal */}
          <div className="rounded-2xl bg-gradient-to-br from-auto-500 to-auto-800 p-5 text-white text-center shadow-lg shadow-auto-600/20">
            <p className="text-xs text-white/70 mb-1">Valor actual estimado</p>
            <p className="text-3xl font-black">
              S/ {Math.round(resultados.valorActualLineal).toLocaleString("es-PE")}
            </p>
            <p className="text-sm text-white/80 mt-1">
              {resultados.pctRestanteLineal.toFixed(0)}% del valor original
            </p>
            <p className="text-[10px] text-white/60 mt-1">
              Perdiste S/ {Math.round(resultados.depreciacionTotalLineal).toLocaleString("es-PE")} en {anios} años
            </p>
          </div>

          {/* Barras de métodos */}
          <div className="card-auto-dark rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-auto-500" /> Comparación de métodos
            </h3>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-zinc-300">Lineal</span>
                <span className="font-bold text-zinc-200">S/ {Math.round(resultados.valorActualLineal).toLocaleString("es-PE")}</span>
              </div>
              <div className="h-4 bg-zinc-900/5 rounded-full overflow-hidden">
                <div className="h-full bg-auto-600/100 rounded-full flex items-center px-2 transition-all duration-500" style={{ width: `${resultados.barraLineal}%` }}>
                  <span className="text-[8px] font-bold text-white">{resultados.pctRestanteLineal.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-zinc-300">Compuesto</span>
                <span className="font-bold text-zinc-200">S/ {Math.round(resultados.valorActualCompuesto).toLocaleString("es-PE")}</span>
              </div>
              <div className="h-4 bg-zinc-900/5 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full flex items-center px-2 transition-all duration-500" style={{ width: `${resultados.barraCompuesto}%` }}>
                  <span className="text-[8px] font-bold text-white">{resultados.pctRestanteCompuesto.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Proyección temporal */}
          <div className="card-auto-dark rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-300 mb-3">Proyección año por año (lineal)</h3>
            <div className="space-y-1">
              {resultados.proyeccion.map((p) => (
                <div key={p.anio} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 w-6 text-right">Año {p.anio}</span>
                  <div className="flex-1 h-5 bg-zinc-900/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full flex items-center px-2 transition-all duration-500 ${
                        p.anio <= parseFloat(anios) ? "bg-auto-600/100" : "bg-zinc-900/10"
                      }`}
                      style={{ width: `${(p.valor / parseFloat(valorCompra)) * 100}%` }}
                    >
                      {p.valor > parseFloat(valorCompra) * 0.15 && (
                        <span className="text-[8px] font-bold text-white">S/ {Math.round(p.valor).toLocaleString("es-PE")}</span>
                      )}
                    </div>
                  </div>
                  {p.anio > 0 && (
                    <span className="text-[9px] text-red-500 w-14 text-right">
                      -S/ {Math.round(p.perdida).toLocaleString("es-PE")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Datos adicionales */}
          <div className="grid grid-cols-3 gap-2">
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Pérdida mensual</p>
              <p className="text-sm font-bold text-red-600">
                S/ {Math.round(resultados.perdidaMensualLineal).toLocaleString("es-PE")}
              </p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Pérdida diaria</p>
              <p className="text-sm font-bold text-red-600">
                S/ {Math.round(resultados.perdidaDiariaLineal).toLocaleString("es-PE")}
              </p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Valor residual</p>
              <p className="text-sm font-bold text-zinc-200">
                {resultados.pctRestanteLineal.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Ingresa los datos para ver la proyección</p>
          <p className="text-xs text-zinc-500 mt-1">Valor de compra, años de antigüedad y tasa de depreciación</p>
        </div>
      )}
    </div>
  );
}
