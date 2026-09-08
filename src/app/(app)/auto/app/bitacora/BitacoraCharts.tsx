"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMoney } from "@/lib/money";
import { CHART } from "@/lib/chart-theme";
import { useDateRange, DateRangeFilter } from "@/components/DateRangeFilter";
import { ChartCard } from "@/components/charts/ChartCard";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { LineTrend } from "@/components/charts/LineTrend";
import { BarCompare } from "@/components/charts/BarCompare";
import { DonutBreakdown } from "@/components/charts/DonutBreakdown";
import { KpiChip } from "@/components/charts/KpiChip";
import { EmptyPrompt } from "@/components/charts/EmptyPrompt";
import { Activity, DollarSign, Droplets, Wrench, Gauge, Fuel, AlertTriangle, CheckCircle2 } from "lucide-react";
import { serieGasto, serieRendimiento, desgloseCategorias, serieMensual, metricasPorGrifo, rendimientoPromedio } from "@/lib/insights";
import type { FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";

interface Props {
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
}

export function BitacoraCharts({ fuelLogs, maintenances, upgrades }: Props) {
  const router = useRouter();
  const { money } = useMoney();
  const fr = useDateRange("mes");
  const { range } = fr;

  const gastoSerie = useMemo(() => serieGasto(fuelLogs, range.start, range.end), [fuelLogs, range]);
  const rendSerie = useMemo(() => serieRendimiento(fuelLogs, range.start, range.end), [fuelLogs, range]);
  const donut = useMemo(() => desgloseCategorias(fuelLogs, maintenances, upgrades, range.start, range.end), [fuelLogs, maintenances, upgrades, range]);
  const mensual = useMemo(() => serieMensual(fuelLogs, maintenances, upgrades, range.start, range.end), [fuelLogs, maintenances, upgrades, range]);

  const totalDonut = donut.reduce((s, d) => s + d.value, 0);
  const totalGasto = gastoSerie.reduce((s, p) => s + p.value, 0);
  const hasData = fuelLogs.length > 0 || maintenances.length > 0 || upgrades.length > 0;

  // Métricas por grifo/estación (detección de despacho corto)
  const grifos = useMemo(() => metricasPorGrifo(fuelLogs), [fuelLogs]);
  const rendimientoGlobal = rendimientoPromedio(fuelLogs);

  return (
    <div className="space-y-3">
      <ChartCard title="Analítica financiera" icon={<Activity className="w-3.5 h-3.5" />} accent={CHART.emerald}>
        <DateRangeFilter {...fr} />
      </ChartCard>

      <div className="grid grid-cols-2 gap-2">
        <KpiChip icon={<DollarSign className="w-3.5 h-3.5" />} label="Total del período" value={money(Math.round(totalGasto))} color={CHART.amber} soft={CHART.amberSoft} spark={gastoSerie.map((p) => p.value)} href="/auto/app/bitacora" />
        <KpiChip icon={<Wrench className="w-3.5 h-3.5" />} label="Gastos registrados" value={`${fuelLogs.length + maintenances.length + upgrades.length}`} color={CHART.violet} soft={CHART.violetSoft} href="/auto/app/bitacora" />
      </div>

      <ChartCard title="Gasto en combustible" icon={<DollarSign className="w-3.5 h-3.5" />} accent={CHART.amber}>
        {gastoSerie.length ? <AreaTrend data={gastoSerie} color={CHART.amber} color2={CHART.orange} aurora={false} /> : <EmptyPrompt emoji="⛽" texto="Registra cargas para ver tu gasto en el tiempo." cta="Ir a Bitácora" href="/auto/app/bitacora" />}
      </ChartCard>

      <ChartCard title="Rendimiento" icon={<Droplets className="w-3.5 h-3.5" />} accent={CHART.teal}>
        {rendSerie.length ? <LineTrend data={rendSerie} suffix=" km/gal" color={CHART.teal} /> : <EmptyPrompt emoji="📈" texto="Registra 2+ cargas para ver la tendencia de km/gal." cta="Ir a Bitácora" href="/auto/app/bitacora" />}
      </ChartCard>

      <ChartCard title="Gasto por categoría" icon={<Gauge className="w-3.5 h-3.5" />} accent={CHART.blue}>
        {donut.some((d) => d.value > 0) ? <DonutBreakdown data={donut} centerValue={money(totalDonut)} centerLabel="total" formatValue={money} /> : <EmptyPrompt emoji="🧾" texto="Agrega gastos para ver la distribución." />}
      </ChartCard>

      <ChartCard title="Comparativo por período" icon={<Wrench className="w-3.5 h-3.5" />} accent={CHART.violet}>
        {mensual.length ? (
          <BarCompare stacked data={mensual} series={[
            { key: "combustible", label: "Combustible", color: CHART.amber },
            { key: "mantenimiento", label: "Mantenimiento", color: CHART.violet },
            { key: "mejoras", label: "Repuestos/Accesorios", color: CHART.blue },
          ]} />
        ) : (
          <EmptyPrompt emoji="📊" texto="Registra gastos para comparar por período." />
        )}
      </ChartCard>

      {/* Consumo por estación / grifo */}
      <ChartCard title="Consumo por estación / grifo" icon={<Fuel className="w-3.5 h-3.5" />} accent={CHART.orange}>
        {grifos.length === 0 ? (
          <EmptyPrompt emoji="⛽" texto="Al cargar combustible selecciona el grifo para comparar estaciones y detectar despachos cortos." />
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500">Rendimiento real por estación (km/galón medido entre cargas). Una estación con rendimiento muy inferior al resto puede estar despachando menos combustible del cobrado.</p>
            {grifos.map((g) => {
              const esBaja = rendimientoGlobal != null && g.rendimientoKmGal != null && g.rendimientoKmGal < rendimientoGlobal * 0.8;
              return (
                <div key={g.grifo} className={`rounded-xl p-3 border ${esBaja ? "border-red-500/30 bg-red-500/[0.05]" : "border-white/10 bg-white/[0.03]"}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-100 truncate">{g.grifo}</p>
                    <span className="text-[10px] text-zinc-500">{g.cargas} cargas</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px]">
                    <span className="font-bold text-zinc-200">{money(g.gasto)}</span>
                    <span className="text-zinc-500">{g.litros.toLocaleString("es-PE")} L</span>
                    {g.rendimientoKmGal != null && (
                      <span className={`font-bold ${esBaja ? "text-red-400" : "text-teal-400"}`}>{g.rendimientoKmGal} km/gal</span>
                    )}
                  </div>
                  {esBaja && (
                    <p className="text-[10px] text-red-300 flex items-center gap-1 mt-1.5">
                      <AlertTriangle className="w-3 h-3" /> Rendimiento muy inferior al promedio — verifica esta estación.
                    </p>
                  )}
                  {!esBaja && g.rendimientoKmGal != null && (
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Dentro del rango normal.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
