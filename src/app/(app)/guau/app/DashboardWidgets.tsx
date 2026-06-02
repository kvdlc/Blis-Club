"use client";

import Link from "next/link";
import { Flame, UtensilsCrossed, GraduationCap, ShieldCheck } from "lucide-react";
import type { DogVaccine } from "@/types/database";
import { VACCINES } from "@/lib/vaccines-wiki";
import { useDisabledVaccines } from "@/lib/use-disabled-vaccines";

interface Props {
  academyPct: number;
  academyCompleted: number;
  academyTotal: number;
  greenPct: number;
  yellowPct: number;
  redPct: number;
  gramsEaten: number;
  gramsTarget: number;
  vaccines: DogVaccine[];
}

function RingGauge({ pct, color, darkColor }: { pct: number; color: string; darkColor: string }) {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-zinc-200 dark:text-zinc-700" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
          className={color}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-extrabold tabular-nums ${color}`}>{pct}%</span>
      </div>
    </div>
  );
}

export function DashboardWidgets({
  academyPct, academyCompleted, academyTotal,
  greenPct, yellowPct, redPct,
  gramsEaten, gramsTarget,
  vaccines,
}: Props) {
  const { isEnabled } = useDisabledVaccines();

  const enabledVaccines = VACCINES.filter((v) => isEnabled(v.id));
  const enabledIds = new Set(enabledVaccines.map((v) => v.id));
  const vaccineTotal = enabledVaccines.reduce((sum, v) => sum + v.schedule.doses.length, 0);
  const vaccineGiven = vaccines.filter((v) => enabledIds.has(v.vaccine_name) && v.date_administered).length;

  const total = greenPct + yellowPct + redPct || 1;
  const gramsPct = Math.min(Math.round((gramsEaten / Math.max(gramsTarget, 1)) * 100), 100);
  const vaccinePct = Math.round((vaccineGiven / Math.max(vaccineTotal, 1)) * 100);

  // Segmented ring for calma
  const calmaR = 26, calmaCirc = 2 * Math.PI * calmaR;
  const greenDash = (greenPct / total) * calmaCirc;
  const yellowDash = (yellowPct / total) * calmaCirc;
  const redDash = (redPct / total) * calmaCirc;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Resumen del día</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* ═══ 1. Academia — ring gauge ═══ */}
        <Link href="/guau/app/academia" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={academyPct} color="text-accent-500" darkColor="text-accent-400" />
          <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Academia</p>
          <span className="text-[10px] text-zinc-400 truncate max-w-full">{academyCompleted}/{academyTotal} lecciones</span>
        </Link>

        {/* ═══ 2. Calma — segmented ring ═══ */}
        <Link href="/guau/app/tracker" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={calmaR} fill="none" stroke="currentColor" strokeWidth="5" className="text-zinc-200 dark:text-zinc-700" />
              {greenPct > 0 && (
                <circle cx="32" cy="32" r={calmaR} fill="none" stroke="#2ec4a8" strokeWidth="5" strokeLinecap="butt"
                  strokeDasharray={`${greenDash} ${calmaCirc - greenDash}`} strokeDashoffset={0} />
              )}
              {yellowPct > 0 && (
                <circle cx="32" cy="32" r={calmaR} fill="none" stroke="#fb923c" strokeWidth="5" strokeLinecap="butt"
                  strokeDasharray={`${yellowDash} ${calmaCirc - yellowDash}`} strokeDashoffset={-greenDash} />
              )}
              {redPct > 0 && (
                <circle cx="32" cy="32" r={calmaR} fill="none" stroke="#f87171" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${redDash} ${calmaCirc - redDash}`} strokeDashoffset={-(greenDash + yellowDash)} />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold tabular-nums text-secondary-600 dark:text-secondary-400">{greenPct}%</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Calma</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary-400" />{greenPct}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning-400" />{yellowPct}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger-400" />{redPct}%</span>
          </div>
        </Link>

        {/* ═══ 3. Gramos — ring gauge ═══ */}
        <Link href="/guau/app/nutricion" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={gramsPct} color="text-primary-500" darkColor="text-primary-400" />
          <div className="text-center max-w-full">
            <span className="text-base font-extrabold text-primary-600 dark:text-primary-400 truncate">{gramsEaten}g</span>
            <span className="text-[10px] text-zinc-400"> / {gramsTarget}g</span>
          </div>
          <span className="text-[10px] text-zinc-400">Comida hoy</span>
        </Link>

        {/* ═══ 4. Vacunas — ring gauge ═══ */}
        <Link href="/guau/app/tracker/salud" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={vaccinePct} color="text-warning-500" darkColor="text-warning-400" />
          <div className="text-center">
            <span className="text-lg font-extrabold text-warning-600 dark:text-warning-400">{vaccineGiven}</span>
            <span className="text-xs text-zinc-400">/{vaccineTotal}</span>
          </div>
          <span className="text-[10px] text-zinc-400">Vacunas</span>
        </Link>
      </div>
    </div>
  );
}
