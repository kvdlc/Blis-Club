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
import { Activity, DollarSign, Droplets, Wrench, Gauge } from "lucide-react";
import { serieGasto, serieRendimiento, desgloseCategorias, serieMensual } from "@/lib/insights";
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
        {gastoSerie.length ? <AreaTrend data={gastoSerie} color={CHART.amber} color2={CHART.orange} /> : <EmptyPrompt emoji="⛽" texto="Registra cargas para ver tu gasto en el tiempo." cta="Ir a Bitácora" href="/auto/app/bitacora" />}
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
            { key: "mejoras", label: "Mejoras", color: CHART.blue },
          ]} />
        ) : (
          <EmptyPrompt emoji="📊" texto="Registra gastos para comparar por período." />
        )}
      </ChartCard>
    </div>
  );
}
