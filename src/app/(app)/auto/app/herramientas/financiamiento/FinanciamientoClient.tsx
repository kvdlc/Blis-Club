"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calendar, Percent } from "lucide-react";

export default function FinanciamientoClient() {
  const [monto, setMonto] = useState("65000");
  const [tasa, setTasa] = useState("12");
  const [plazo, setPlazo] = useState("48");

  const resultados = useMemo(() => {
    const M = parseFloat(monto);
    const ta = parseFloat(tasa) / 100;
    const n = parseInt(plazo);
    if (!M || !ta || !n || M <= 0 || ta <= 0 || n <= 0) return null;

    const i = ta / 12;
    const cuota = i > 0 ? (M * i) / (1 - Math.pow(1 + i, -n)) : M / n;
    const totalPagar = cuota * n;
    const intereses = totalPagar - M;

    // Tabla de amortización
    const tabla: { mes: number; cuota: number; interes: number; capital: number; saldo: number }[] = [];
    let saldo = M;
    for (let mes = 1; mes <= Math.min(n, 12); mes++) {
      const int = saldo * i;
      const cap = cuota - int;
      saldo -= cap;
      tabla.push({ mes, cuota, interes: int, capital: cap, saldo: Math.max(0, saldo) });
    }

    return { cuota, totalPagar, intereses, tabla, i };
  }, [monto, tasa, plazo]);

  return (
    <div className="space-y-4">
      <Link href="/auto/app/herramientas" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700">
        <ArrowLeft className="w-4 h-4" /> Herramientas
      </Link>
      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Financiamiento Vehicular</h1>
        <p className="text-xs text-zinc-400 mt-1">Calcula la cuota mensual de un préstamo para tu auto.</p>
      </div>

      <div className="card-auto-dark rounded-2xl p-4 space-y-3">
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-auto-500" /> Monto del préstamo (S/)</span>
          <input type="number" min="1" step="100" value={monto} onChange={(e) => setMonto(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><Percent className="w-3.5 h-3.5 text-auto-500" /> Tasa de interés anual (%)</span>
          <input type="number" min="1" max="50" step="0.1" value={tasa} onChange={(e) => setTasa(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-auto-500" /> Plazo (meses)</span>
          <input type="number" min="1" max="96" value={plazo} onChange={(e) => setPlazo(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>
      </div>

      {resultados ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-auto-500 to-auto-800 p-5 text-white text-center shadow-lg shadow-auto-600/20">
            <p className="text-xs text-white/70 mb-1">Cuota mensual</p>
            <p className="text-3xl font-black">S/ {Math.round(resultados.cuota).toLocaleString("es-PE")}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Total a pagar</p>
              <p className="text-sm font-bold text-zinc-200">S/ {Math.round(resultados.totalPagar).toLocaleString("es-PE")}</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Intereses</p>
              <p className="text-sm font-bold text-auto-400">S/ {Math.round(resultados.intereses).toLocaleString("es-PE")}</p>
            </div>
            <div className="card-auto-dark rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Tasa mensual</p>
              <p className="text-sm font-bold text-zinc-200">{(resultados.i * 100).toFixed(2)}%</p>
            </div>
          </div>

          <div className="card-auto-dark rounded-2xl p-4">
            <h3 className="text-xs font-extrabold text-zinc-300 mb-2">Primeros 12 meses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-1 px-1 text-zinc-400">Mes</th>
                    <th className="py-1 px-1 text-zinc-400">Cuota</th>
                    <th className="py-1 px-1 text-zinc-400">Interés</th>
                    <th className="py-1 px-1 text-zinc-400">Capital</th>
                    <th className="py-1 px-1 text-zinc-400 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.tabla.map((r) => (
                    <tr key={r.mes} className="border-b border-white/5">
                      <td className="py-1 px-1 font-bold">{r.mes}</td>
                      <td className="py-1 px-1">S/ {Math.round(r.cuota).toLocaleString("es-PE")}</td>
                      <td className="py-1 px-1 text-auto-400">S/ {Math.round(r.interes).toLocaleString("es-PE")}</td>
                      <td className="py-1 px-1 text-auto-500">S/ {Math.round(r.capital).toLocaleString("es-PE")}</td>
                      <td className="py-1 px-1 text-right">S/ {Math.round(r.saldo).toLocaleString("es-PE")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-auto-dark rounded-2xl p-6 text-center">
          <p className="text-sm text-zinc-500">Ingresa los datos para calcular la cuota</p>
        </div>
      )}
    </div>
  );
}
