"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Coins } from "lucide-react";
import { formatMoney } from "@/lib/money";

interface FxRate {
  currency_code: string;
  fx_usd_rate: number;
  updated_at: string;
}

export default function MonedasClient() {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [monto, setMonto] = useState("100");

  useEffect(() => {
    fetch("/api/fx/sync").then((r) => r.json()).then((d) => setRates(d.rates ?? []));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await fetch("/api/fx/sync", { method: "POST" });
    const r = await fetch("/api/fx/sync");
    const d = await r.json();
    setRates(d.rates ?? []);
    setSyncing(false);
  };

  const montoNum = parseFloat(monto) || 0;
  const usdRate = rates.find((r) => r.currency_code === "USD")?.fx_usd_rate || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800">Monedas y Tipo de Cambio</h1>
          <p className="text-sm text-zinc-500">Tasas FX cacheadas (base USD)</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} /> Sincronizar
        </button>
      </div>

      {/* Conversor */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-primary-600" />
          <h2 className="text-sm font-bold text-zinc-800">Convertir monto</h2>
        </div>
        <div className="flex gap-2 items-center">
          <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 text-sm w-32" />
          <span className="text-sm font-bold text-zinc-600">USD =</span>
          <span className="text-sm font-bold text-zinc-800">{formatMoney(montoNum * usdRate, "PEN")} PEN</span>
        </div>
      </div>

      {/* Tabla de tasas */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Moneda</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">1 USD =</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.currency_code} className="border-b border-zinc-50">
                <td className="px-4 py-3 font-bold text-zinc-800">{r.currency_code}</td>
                <td className="px-4 py-3 text-zinc-600">{r.fx_usd_rate.toLocaleString("es-PE", { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{r.updated_at ? new Date(r.updated_at).toLocaleString("es-PE") : "—"}</td>
              </tr>
            ))}
            {rates.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-zinc-400">Sin tasas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
