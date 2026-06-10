"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, UtensilsCrossed, GraduationCap, ShieldCheck, Pill, Clock, AlertTriangle, ArrowRight } from "lucide-react";

/* Link SPA interno: usa router.replace para cambiar de tab sin navegación completa */
function SPAButton({ tab, children, className }: { tab: string; children: React.ReactNode; className: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        const url = tab === "inicio" ? "/guau/app" : `/guau/app?tab=${tab}`;
        router.replace(url, { scroll: false });
      }}
      className={className}
    >
      {children}
    </button>
  );
}
import type { DogVaccine, DogMedication, DogMedicationLog } from "@/types/database";
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
  activeMeds: DogMedication[];
  medLogs: DogMedicationLog[];
}

function RingGauge({ pct, color, darkColor }: { pct: number; color: string; darkColor: string }) {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-zinc-200" />
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

/** Determina si una dosis toca hoy según la última toma real */
function isDoseDueToday(med: DogMedication, logs: DogMedicationLog[]): { due: boolean; overdue: boolean; lastTaken: Date | null } {
  const medLogs = logs.filter((l) => l.medication_id === med.id).sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
  const lastTakenLog = medLogs.find((l) => l.taken && l.taken_at);
  const base = lastTakenLog?.taken_at ? new Date(lastTakenLog.taken_at) : new Date(med.start_date + "T00:00:00");
  const now = new Date();
  const dueDate = new Date(base.getTime() + (med.interval_days || 1) * 86400000);
  const isDue = now >= dueDate;
  // Check if already taken today
  const takenToday = medLogs.some((l) => l.taken && new Date(l.taken_at!).toDateString() === now.toDateString());
  return { due: isDue && !takenToday, overdue: isDue && dueDate.toDateString() < now.toDateString(), lastTaken: lastTakenLog?.taken_at ? new Date(lastTakenLog.taken_at) : null };
}

export function DashboardWidgets({
  academyPct, academyCompleted, academyTotal,
  greenPct, yellowPct, redPct,
  gramsEaten, gramsTarget,
  vaccines,
  activeMeds, medLogs,
}: Props) {
  const { isEnabled } = useDisabledVaccines();

  const enabledVaccines = VACCINES.filter((v) => isEnabled(v.id));
  const enabledIds = new Set(enabledVaccines.map((v) => v.id));
  const vaccineTotal = enabledVaccines.reduce((sum, v) => sum + v.schedule.doses.length, 0);
  const vaccineGiven = vaccines.filter((v) => enabledIds.has(v.vaccine_name) && v.date_administered).length;

  const total = greenPct + yellowPct + redPct || 1;
  const gramsPct = Math.min(Math.round((gramsEaten / Math.max(gramsTarget, 1)) * 100), 100);
  const vaccinePct = Math.round((vaccineGiven / Math.max(vaccineTotal, 1)) * 100);

  // Calma ring
  const calmaR = 26, calmaCirc = 2 * Math.PI * calmaR;
  const greenDash = (greenPct / total) * calmaCirc;
  const yellowDash = (yellowPct / total) * calmaCirc;
  const redDash = (redPct / total) * calmaCirc;

  // Medicamentos del día
  const todayMeds: { med: DogMedication; overdue: boolean }[] = [];
  const overdueMeds: { med: DogMedication; daysLate: number }[] = [];
  for (const med of activeMeds) {
    const { due, overdue } = isDoseDueToday(med, medLogs);
    if (due) {
      if (overdue) {
        const dueDate = new Date(new Date(med.start_date + "T00:00:00").getTime() + (med.interval_days || 1) * 86400000);
        const daysLate = Math.floor((new Date().getTime() - dueDate.getTime()) / 86400000);
        overdueMeds.push({ med, daysLate: Math.max(1, daysLate) });
      } else {
        todayMeds.push({ med, overdue: false });
      }
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-zinc-900 text-sm">Resumen del día</h3>

      {/* ═══ Widget Medicamentos ═══ */}
      {(todayMeds.length > 0 || overdueMeds.length > 0) && (
        <Link href="/guau/app/tracker/salud/medicamentos" className="card-soft rounded-[1.25rem] p-4 block space-y-2.5 transition-all active:scale-[0.98] hover:shadow-md border-l-4 border-warning-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning-100 flex items-center justify-center">
                <Pill className="w-3.5 h-3.5 text-warning-600" />
              </div>
              <span className="text-xs font-bold text-zinc-800">Medicamentos</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
          </div>

          {/* Pendientes hoy */}
          {todayMeds.map(({ med }) => {
            const doseHour = med.dose_hours?.[0]?.slice(0, 5) || "—";
            return (
              <div key={med.id} className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-warning-500 shrink-0" />
                <span className="text-zinc-500">{doseHour}</span>
                <span className="font-semibold text-zinc-700 truncate flex-1">{med.medication_name}</span>
                <span className="text-[10px] text-zinc-400 shrink-0">pendiente</span>
              </div>
            );
          })}

          {/* Atrasadas */}
          {overdueMeds.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-danger-100">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-danger-500" />
                <span className="text-[10px] font-semibold text-danger-600">Atrasadas</span>
              </div>
              {overdueMeds.map(({ med, daysLate }) => (
                <div key={med.id} className="flex items-center gap-2 text-xs">
                  <span className="text-danger-500 shrink-0">❌</span>
                  <span className="font-semibold text-zinc-700 truncate flex-1">{med.medication_name}</span>
                  <span className="text-[10px] text-danger-500 shrink-0">+{daysLate} días</span>
                </div>
              ))}
            </div>
          )}
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* ═══ 1. Academia — ring gauge ═══ */}
        <SPAButton tab="academia" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={academyPct} color="text-accent-500" darkColor="text-accent-400" />
          <p className="text-[11px] font-bold text-zinc-700">Academia</p>
          <span className="text-[10px] text-zinc-400 truncate max-w-full">{academyCompleted}/{academyTotal} lecciones</span>
        </SPAButton>

        {/* ═══ 2. Calma — segmented ring ═══ */}
        <SPAButton tab="tracker" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={calmaR} fill="none" stroke="currentColor" strokeWidth="5" className="text-zinc-200" />
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
              <span className="text-sm font-extrabold tabular-nums text-secondary-600">{greenPct}%</span>
            </div>
          </div>
          <p className="text-[11px] font-bold text-zinc-700">Calma</p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary-400" />{greenPct}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning-400" />{yellowPct}%</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger-400" />{redPct}%</span>
          </div>
        </SPAButton>

        {/* ═══ 3. Gramos — ring gauge ═══ */}
        <SPAButton tab="nutricion" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={gramsPct} color="text-primary-500" darkColor="text-primary-400" />
          <div className="text-center max-w-full">
            <span className="text-base font-extrabold text-primary-600 truncate">{gramsEaten}g</span>
            <span className="text-[10px] text-zinc-400"> / {gramsTarget}g</span>
          </div>
          <span className="text-[10px] text-zinc-400">Comida hoy</span>
        </SPAButton>

        {/* ═══ 4. Vacunas — ring gauge ═══ */}
        <Link href="/guau/app/tracker/salud" className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97] hover:shadow-md overflow-hidden">
          <RingGauge pct={vaccinePct} color="text-warning-500" darkColor="text-warning-400" />
          <div className="text-center">
            <span className="text-lg font-extrabold text-warning-600">{vaccineGiven}</span>
            <span className="text-xs text-zinc-400">/{vaccineTotal}</span>
          </div>
          <span className="text-[10px] text-zinc-400">Vacunas</span>
        </Link>
      </div>
    </div>
  );
}
