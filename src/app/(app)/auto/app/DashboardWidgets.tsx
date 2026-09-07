"use client";

import { useState, useMemo } from "react";
import { useMoney } from "@/lib/money";
import { CHART } from "@/lib/chart-theme";
import { useDateRange, DateRangeFilter } from "@/components/DateRangeFilter";
import { ChartCard } from "@/components/charts/ChartCard";
import { GaugeRing } from "@/components/charts/GaugeRing";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { LineTrend } from "@/components/charts/LineTrend";
import { KpiChip } from "@/components/charts/KpiChip";
import { EmptyPrompt } from "@/components/charts/EmptyPrompt";
import { Activity, Fuel, Wrench, ShieldCheck, Droplets, DollarSign, Trophy, Battery, Timer } from "lucide-react";
import { computeInsights, serieGasto, serieRendimiento, rendimientoPromedio, calcEficiencia, serieKm } from "@/lib/insights";
import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";

interface Props {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  documents: VehicleDocument[];
  maintenances: MaintenanceLog[];
  upgrades: VehicleUpgrade[];
  specs: VehicleSpecs | null;
  badges?: string[];
  ecoScore: number;
  nextDocExpiry: VehicleDocument | null;
}

const BADGE_LABELS: Record<string, string> = {
  primera_carga: "Primera carga",
  tanque_lleno: "Tanque lleno",
  eco_warrior: "Eficiencia alta",
  preventivo: "Preventivo",
  viajero: "Viajero",
  documentado: "Documentado",
  primer_vehiculo: "Primer vehículo",
};

export function DashboardWidgets({ vehicle, fuelLogs, documents, maintenances, upgrades, specs, badges = [], ecoScore, nextDocExpiry }: Props) {
  const { money } = useMoney();
  const fr = useDateRange("mes");
  const { range } = fr;

  const ins = useMemo(() => computeInsights({ vehicle, fuelLogs, documents, maintenances, upgrades, specs }), [vehicle, fuelLogs, documents, maintenances, upgrades, specs]);

  // Series filtradas por rango
  const gastoSerie = useMemo(() => serieGasto(fuelLogs, range.start, range.end), [fuelLogs, range]);
  const rendSerie = useMemo(() => serieRendimiento(fuelLogs, range.start, range.end), [fuelLogs, range]);
  const kmSerie = useMemo(() => serieKm(fuelLogs, range.start, range.end), [fuelLogs, range]);

  const rendKmGal = rendimientoPromedio(fuelLogs);
  const eficiencia = calcEficiencia(rendKmGal);

  // Vida útil de componentes (estimación visual de desgaste)
  const lifeItems = useMemo(() => {
    const out: { label: string; pct: number; color: string; hint: string }[] = [];
    // Aceite / próximo servicio: usar km transcurridos desde el último service (intervalo 5000)
    const intervalKm = 5000;
    const lastServiceKm = maintenances.length ? Math.max(...maintenances.map((m) => m.odometro ?? 0)) : 0;
    const kmDesdeService = lastServiceKm > 0 ? Math.max(0, vehicle.kilometraje - lastServiceKm) : null;
    if (kmDesdeService != null) {
      const pct = Math.min(100, Math.round((kmDesdeService / intervalKm) * 100));
      out.push({ label: "Aceite / servicio", pct, color: CHART.violet, hint: pct < 70 ? "En regla" : "Progármalo pronto" });
    } else {
      out.push({ label: "Aceite / servicio", pct: 0, color: CHART.violet, hint: "Registra un service" });
    }
    // Batería: % según fecha de mantenimiento (2 años)
    if (specs?.bateria_mantenimiento_fecha) {
      const done = new Date(specs.bateria_mantenimiento_fecha + "T12:00:00").getTime();
      const dias = Math.max(0, (Date.now() - done) / 86400000);
      const pct = Math.min(100, Math.round((dias / 730) * 100));
      out.push({ label: "Batería", pct, color: CHART.emerald, hint: pct < 70 ? "En regla" : "Vigila su salud" });
    } else {
      out.push({ label: "Batería", pct: 0, color: CHART.emerald, hint: "Registra en ADN" });
    }
    // Frenos / neumáticos (genérico: usar próximo servicio, intervalo ~12000)
    if (ins.kmProximoServicio != null) {
      const transcurridos = Math.max(0, vehicle.kilometraje - Math.min(vehicle.kilometraje, ins.kmProximoServicio));
      const pct = Math.min(100, Math.round((transcurridos / 12000) * 100));
      out.push({ label: "Frenos / llantas", pct, color: CHART.teal, hint: pct < 70 ? "En regla" : "Revisión pronto" });
    } else {
      out.push({ label: "Frenos / llantas", pct: 0, color: CHART.teal, hint: "Registra un service" });
    }
    return out;
  }, [maintenances, vehicle.kilometraje, specs, ins.kmProximoServicio]);

  const hasData = fuelLogs.length > 0 || maintenances.length > 0 || upgrades.length > 0 || documents.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Filtro de rango ── */}
      <ChartCard title="Analítica del vehículo" icon={<Activity className="w-3.5 h-3.5" />} accent={CHART.emerald}>
        <DateRangeFilter {...fr} />
      </ChartCard>

      {/* ── Hero stat: Eficiencia ── */}
      <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <GaugeRing value={eficiencia} label="de 100" size={120} color={CHART.emerald} color2={CHART.teal} />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-bold text-zinc-100">{vehicle.marca} {vehicle.modelo}</p>
            <div className="space-y-1">
              <StatLine label="Rendimiento" value={rendKmGal != null ? `${rendKmGal} km/gal` : "—"} color={CHART.teal} />
              <StatLine label="Última carga" value={ins.diasSinCargar != null ? `hace ${ins.diasSinCargar} días` : "—"} color={CHART.amber} />
              <StatLine label="Prox. servicio" value={ins.kmProximoServicio != null ? `${ins.kmProximoServicio.toLocaleString("es-PE")} km` : "—"} color={CHART.violet} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Área de gasto ── */}
      <ChartCard title="Gasto en combustible" icon={<DollarSign className="w-3.5 h-3.5" />} accent={CHART.amber}>
        {gastoSerie.length ? <AreaTrend data={gastoSerie} color={CHART.amber} color2={CHART.orange} suffix="" /> : <EmptyPrompt emoji="⛽" texto="Registra cargas en Bitácora para ver tu gasto en el tiempo." cta="Ir a Bitácora" href="/auto/app/bitacora" />}
      </ChartCard>

      {/* ── Rendimiento ── */}
      <ChartCard title="Tendencia de rendimiento" icon={<Droplets className="w-3.5 h-3.5" />} accent={CHART.teal}>
        {rendSerie.length ? <LineTrend data={rendSerie} suffix=" km/gal" color={CHART.teal} /> : <EmptyPrompt emoji="📈" texto="Registra 2+ cargas para ver la tendencia de tu km/gal." cta="Ir a Bitácora" href="/auto/app/bitacora" />}
      </ChartCard>

      {/* ── Actividad · km por período ── */}
      <ChartCard title="Actividad · km por período" icon={<Activity className="w-3.5 h-3.5" />} accent={CHART.emerald}>
        {kmSerie.length ? (
          <AreaTrend data={kmSerie} color={CHART.emerald} color2={CHART.teal} valueFormat={(v) => `${v.toLocaleString("es-PE")} km`} />
        ) : (
          <EmptyPrompt emoji="🛣️" texto="Registra 2+ cargas para ver los km que recorres por período." cta="Ir a Bitácora" href="/auto/app/bitacora" />
        )}
      </ChartCard>

      {/* ── Vida útil de componentes ── */}
      <ChartCard title="Vida útil de componentes" icon={<Droplets className="w-3.5 h-3.5" />} accent={CHART.violet}>
        <div className="space-y-2.5">
          {lifeItems.map((item) => <LifeBar key={item.label} {...item} />)}
        </div>
      </ChartCard>

      {/* ── Chips de score ── */}
      {hasData && (
        <div className="grid grid-cols-2 gap-2">
          <KpiChip icon={<DollarSign className="w-3.5 h-3.5" />} label="Gasto 30d" value={money(Math.round(ins.gasto30d))} color={CHART.amber} soft={CHART.amberSoft} spark={gastoSerie.map((p) => p.value)} href="/auto/app/bitacora" />
          <KpiChip icon={<Fuel className="w-3.5 h-3.5" />} label="Autonomía" value={ins.autonomiaKm ? `${ins.autonomiaKm.toLocaleString("es-PE")} km` : "—"} color={CHART.teal} soft={CHART.tealSoft} href="/auto/app/herramientas/autonomia" />
          <KpiChip icon={<Wrench className="w-3.5 h-3.5" />} label="Servicio" value={ins.kmProximoServicio != null ? `${ins.kmProximoServicio.toLocaleString("es-PE")} km` : "—"} color={CHART.violet} soft={CHART.violetSoft} href="/auto/app/bitacora" />
          <KpiChip icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Documentos" value={`${documents.length}`} color={CHART.orange} soft={CHART.orangeSoft} href="/auto/app/guantera" />
        </div>
      )}

      {/* ── Trámites próximos ── */}
      <ChartCard title="Trámites por vencer" icon={<ShieldCheck className="w-3.5 h-3.5" />} accent={CHART.orange}>
        {nextDocExpiry ? (
          <DocRow doc={nextDocExpiry} />
        ) : (
          <EmptyPrompt emoji="🛡️" texto="Registra tus documentos para vigilar las fechas de vencimiento." cta="Ir a Guantera" href="/auto/app/guantera" />
        )}
      </ChartCard>

      {/* ── Logros ── */}
      {badges.length > 0 && (
        <ChartCard title={`Logros (${badges.length})`} icon={<Trophy className="w-3.5 h-3.5" />} accent={CHART.amber} collapsible open={false}>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((key) => (
              <span key={key} className="text-[9px] font-bold bg-auto-500/10 text-auto-400 px-2 py-1 rounded-full border border-auto-500/20">
                {BADGE_LABELS[key] ?? key.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function StatLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-zinc-500">{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function DocRow({ doc }: { doc: VehicleDocument }) {
  const dias = Math.ceil((new Date(doc.fecha_vencimiento + "T12:00:00").getTime() - Date.now()) / (1000 * 3600 * 24));
  const etiqueta = doc.tipo === "seguro_obligatorio" ? "Seguro Obligatorio" : doc.tipo === "revision_tecnica" ? "Revisión Técnica" : doc.tipo === "poliza_seguro" ? "Póliza" : doc.tipo;
  const color = dias <= 15 ? "#ef4444" : dias <= 30 ? CHART.orange : CHART.emerald;
  return (
    <div className="flex items-center justify-between rounded-xl p-3 border border-white/10 bg-white/[0.04]">
      <div>
        <p className="text-sm font-bold text-zinc-100">{etiqueta}</p>
        <p className="text-[10px] text-zinc-500">Vence {dias < 0 ? `hace ${Math.abs(dias)} días` : `en ${dias} días`}</p>
      </div>
      <span className="text-xs font-black" style={{ color }}>{dias <= 0 ? "Vencido" : `${dias} d`}</span>
    </div>
  );
}

function LifeBar({ label, pct, color, hint }: { label: string; pct: number; color: string; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">{label}</span>
        <span className="font-bold text-zinc-200">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <p className="mt-0.5 text-[9px] text-zinc-600">{hint}</p>
    </div>
  );
}
