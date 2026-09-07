"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Fuel, Wrench, Sparkles, ChevronRight, History, Droplets } from "lucide-react";
import { useMoney } from "@/lib/money";
import { getCountryConfig, getCurrentCountryCode } from "@/lib/countries";
import type { FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";

const GAL = 3.78541;

interface Props {
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
}

type Item = {
  id: string;
  tipo: "fuel" | "maint" | "upgrade";
  fecha: string;
  monto: number;
  titulo: string;
  detalle: string;
};

export function RecentExpenses({ fuelLogs, maintenances, upgrades }: Props) {
  const { money } = useMoney();
  const [esGalon, setEsGalon] = useState(false);

  useEffect(() => {
    getCurrentCountryCode().then((c) => {
      setEsGalon(getCountryConfig(c).fuelUnit === "galon");
    });
  }, []);

  const volLabel = (litros: number) => (esGalon ? `${(litros / GAL).toFixed(1)} gal` : `${litros.toFixed(1)} L`);

  const items: Item[] = [
    ...fuelLogs.map((f) => ({
      id: `f-${f.id}`,
      tipo: "fuel" as const,
      fecha: f.fecha,
      monto: (f.precio_por_galon * f.litros) / GAL,
      titulo: `Combustible · ${volLabel(f.litros)}`,
      detalle: `${f.odometro.toLocaleString("es-PE")} km`,
    })),
    ...maintenances.map((m) => ({
      id: `m-${m.id}`,
      tipo: "maint" as const,
      fecha: m.fecha,
      monto: m.costo || 0,
      titulo: m.titulo || "Mantenimiento",
      detalle: m.taller || "",
    })),
    ...upgrades.map((u) => ({
      id: `u-${u.id}`,
      tipo: "upgrade" as const,
      fecha: u.fecha,
      monto: u.costo || 0,
      titulo: u.nombre || "Mejora",
      detalle: "Accesorio / mejora",
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const ultimos = items.slice(0, 3);
  const total = items.reduce((s, i) => s + i.monto, 0);

  const IconFor = (t: Item["tipo"]) => (t === "fuel" ? Fuel : t === "maint" ? Wrench : Sparkles);
  const colorFor = (t: Item["tipo"]) =>
    t === "fuel"
      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
      : t === "maint"
        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
        : "bg-blue-500/10 border-blue-500/20 text-blue-400";

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-auto-500" />
          <h2 className="text-sm font-bold text-zinc-200">Historial de gastos</h2>
          <span className="text-[9px] font-bold text-zinc-500 bg-white/[0.06] px-1.5 py-0.5 rounded-full">{items.length}</span>
        </div>
        <span className="text-[10px] font-bold text-auto-400">Total {money(Math.round(total))}</span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2 text-center px-4">
          <Droplets className="w-5 h-5 text-zinc-600" />
          <p className="text-[11px] text-zinc-500">Todavía no hay gastos registrados.</p>
          <Link href="/auto/app/bitacora" className="text-[11px] font-bold text-auto-400 hover:text-auto-300">
            Registrar el primero →
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-white/[0.04]">
            {ultimos.map((item) => {
              const Icon = IconFor(item.tipo);
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${colorFor(item.tipo)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">{item.titulo}</p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {new Date(item.fecha + "T12:00:00").toLocaleDateString("es-PE")}
                      {item.detalle ? ` · ${item.detalle}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-black text-zinc-100 shrink-0">{money(Math.round(item.monto))}</span>
                </div>
              );
            })}
          </div>
          <Link
            href="/auto/app/bitacora"
            className="flex items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-auto-400 hover:text-auto-300 hover:bg-white/[0.04] transition-colors border-t border-white/5"
          >
            Ver todos los gastos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </>
      )}
    </div>
  );
}
