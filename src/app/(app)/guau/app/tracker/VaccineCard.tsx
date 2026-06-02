"use client";

import type { DogVaccine } from "@/types/database";
import type { VaccineWiki } from "@/lib/vaccines-wiki";
import type { CalculatedDose } from "@/lib/vaccine-schedule";
import { GraduationCap, Check, Clock } from "lucide-react";

interface Props {
  vaccine: VaccineWiki;
  records: DogVaccine[];
  doses: CalculatedDose[];
  onOpenWiki: (vaccine: VaccineWiki) => void;
}

export function VaccineCard({ vaccine, records, doses, onOpenWiki }: Props) {
  const administeredSet = new Set(
    records.filter((r) => r.date_administered).map((r) => r.dose_number),
  );
  const completedCount = administeredSet.size;
  const totalDoses = doses.length;
  const hasPast = totalDoses > 0 && completedCount >= totalDoses;

  const nextDose = doses.find((d) => !administeredSet.has(d.doseNumber));

  const borderColor = hasPast
    ? "border-l-[3px] border-l-secondary-500"
    : "border-l-[3px] border-l-primary-300 dark:border-l-primary-700";

  return (
    <div className={`card-soft rounded-2xl flex items-center gap-3 p-4 transition-all overflow-hidden ${borderColor}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-primary-100 dark:bg-primary-900">
        {vaccine.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{vaccine.name}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${vaccine.group === "core" ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
            {vaccine.group === "core" ? "Core" : "Opcional"}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          {doses.map((d, i) => {
            const isDone = administeredSet.has(d.doseNumber);
            return (
              <div key={i} className="flex items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                  isDone
                    ? "bg-secondary-500 text-white shadow-sm shadow-secondary-500/30"
                    : "bg-primary-100 text-primary-500 dark:bg-primary-900/60 dark:text-primary-400"
                }`}>
                  {d.doseNumber}
                </div>
                {i < doses.length - 1 && (
                  <div className={`w-2.5 h-0.5 rounded-full transition-colors ${isDone ? "bg-secondary-400" : "bg-primary-200 dark:bg-primary-800"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
            {completedCount}/{totalDoses} dosis
          </p>
          {hasPast ? (
            <Check className="w-3.5 h-3.5 text-secondary-500 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          )}
        </div>

        {nextDose && !hasPast && (
          <p className="text-[10px] text-primary-500 dark:text-primary-400 font-medium mt-0.5">
            Próxima: {nextDose.label} — {nextDose.calculatedDate.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {records.length > 0 && (
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {completedCount} {completedCount === 1 ? "dosis registrada" : "dosis registradas"}
          </p>
        )}
      </div>

      <button
        onClick={() => onOpenWiki(vaccine)}
        className="shrink-0 w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center hover:bg-accent-200 dark:hover:bg-accent-800 transition-colors self-start"
        title="Más info"
      >
        <GraduationCap className="w-4 h-4 text-accent-600 dark:text-accent-400" />
      </button>
    </div>
  );
}
