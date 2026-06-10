"use client";

import { X, GraduationCap, Syringe, Shield, AlertTriangle, Activity, Coins, CalendarDays, Baby, Heart } from "lucide-react";
import type { VaccineWiki } from "@/lib/vaccines-wiki";
import type { CalculatedDose } from "@/lib/vaccine-schedule";
import { formatVaccineDate } from "@/lib/vaccine-schedule";

interface Props {
  vaccine: VaccineWiki;
  doses: CalculatedDose[];
  birthDate: Date | null;
  open: boolean;
  onClose: () => void;
}

export function VaccineWikiModal({ vaccine, doses, birthDate, open, onClose }: Props) {
  if (!open) return null;

  const birthInfo = birthDate
    ? `Nació el ${birthDate.toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })}`
    : "Sin fecha de nacimiento registrada";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center text-2xl">
              {vaccine.emoji}
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 truncate max-w-[70%]">{vaccine.name}</h2>
              <p className="text-xs text-zinc-500">
                {vaccine.group === "core" ? "Vacuna esencial · Obligatoria" : "Vacuna opcional · Recomendada"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Severity */}
        <div className="rounded-2xl bg-danger-50 border border-danger-200/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-danger-500" />
            <span className="text-xs font-bold text-danger-700">¿Qué tan grave es?</span>
          </div>
          <p className="text-xs text-danger-600 leading-relaxed break-words">
            {vaccine.severity}
          </p>
        </div>

        {/* Contagion */}
        <div className="rounded-2xl bg-warning-50 border border-warning-200/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-warning-500" />
            <span className="text-xs font-bold text-warning-700">¿Cómo se contagia?</span>
          </div>
          <p className="text-xs text-warning-600 leading-relaxed break-words">
            {vaccine.contagion}
          </p>
        </div>

        {/* What it does */}
        <div className="rounded-2xl bg-primary-50 border border-primary-200/50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Syringe className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-primary-700">¿Qué hace esta vacuna?</span>
          </div>
          <p className="text-xs text-primary-600 leading-relaxed break-words">
            {vaccine.whatItDoes}
          </p>
        </div>

        {/* After vaccine */}
        <div className="rounded-2xl bg-secondary-50 border border-secondary-200/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-secondary-500" />
            <span className="text-xs font-bold text-secondary-700">Después de vacunarlo...</span>
          </div>
          <div className="space-y-1.5 text-xs text-secondary-600">
            <p>{vaccine.afterVaccine.canBathe}</p>
            <p>{vaccine.afterVaccine.canGoOut}</p>
            <p>{vaccine.afterVaccine.canExercise}</p>
          </div>
        </div>

        {/* Side effects */}
        <div className="rounded-2xl bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-700">Efectos secundarios</span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed break-words">
            {vaccine.sideEffects}
          </p>
        </div>

        {/* Schedule */}
        <div className="rounded-2xl bg-accent-50 border border-accent-200/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-bold text-accent-700">Calendario de vacunación</span>
          </div>
          {birthDate && (
            <p className="text-[10px] text-accent-500 mb-2">{birthInfo}</p>
          )}
          <div className="space-y-1">
            {doses.map((d) => (
              <div key={d.doseNumber} className="flex justify-between text-xs gap-2">
                <span className="text-accent-700 truncate min-w-0">{d.label}</span>
                <span className="font-semibold text-accent-600 shrink-0">{formatVaccineDate(d.calculatedDate)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs pt-1 border-t border-accent-200/50">
              <span className="text-accent-500">Refuerzo cada {vaccine.schedule.boosterIntervalMonths} meses</span>
            </div>
          </div>
        </div>

        {/* Brands */}
        <div className="rounded-2xl bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-bold text-zinc-700">
              Marcas en LATAM · ${vaccine.costUsdMin}-${vaccine.costUsdMax} USD aprox
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {vaccine.brands.map((b) => (
              <span key={b} className="text-[10px] bg-white rounded-full px-2 py-0.5 border border-zinc-200 text-zinc-600">
                {b}
              </span>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-primary-600 text-white rounded-xl py-3 text-sm font-bold active:scale-[0.98]">
          Entendido
        </button>
      </div>
    </div>
  );
}
