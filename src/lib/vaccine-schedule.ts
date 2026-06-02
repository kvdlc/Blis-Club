import type { VaccineWiki, VaccineDose } from "./vaccines-wiki";

export interface CalculatedDose {
  doseNumber: number;
  label: string;
  calculatedDate: Date;
  ageWeeks: number;
}

export function calculateVaccineSchedule(
  vaccine: VaccineWiki,
  birthDate: Date,
  overrides: { doseNumber: number; actualDate: Date }[] = []
): { doses: CalculatedDose[]; boosterDate: Date } {
  const overrideMap = new Map(overrides.map((o) => [o.doseNumber, o.actualDate]));

  const doses: CalculatedDose[] = [];
  let lastDate = new Date(birthDate);

  for (const dose of vaccine.schedule.doses) {
    let calculatedDate: Date;

    if (overrideMap.has(dose.dose_number)) {
      // User manually set this date
      calculatedDate = overrideMap.get(dose.dose_number)!;
    } else if (doses.length > 0) {
      // Calculate from previous dose (whether it was overridden or not)
      const prevDose = doses[doses.length - 1];
      const weeksBetween = dose.age_weeks - prevDose.ageWeeks;
      calculatedDate = new Date(prevDose.calculatedDate);
      calculatedDate.setDate(calculatedDate.getDate() + weeksBetween * 7);
    } else {
      // First dose: calculate from birth date
      calculatedDate = new Date(birthDate);
      calculatedDate.setDate(calculatedDate.getDate() + dose.age_weeks * 7);
    }

    lastDate = calculatedDate;

    doses.push({
      doseNumber: dose.dose_number,
      label: dose.label,
      calculatedDate,
      ageWeeks: dose.age_weeks,
    });
  }

  // Calculate booster date from last dose
  const boosterDate = new Date(lastDate);
  boosterDate.setMonth(boosterDate.getMonth() + vaccine.schedule.boosterIntervalMonths);

  return { doses, boosterDate };
}

export function getVaccineStatus(date: Date): "past" | "upcoming" | "overdue" {
  const now = new Date();
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < -30) return "past";
  if (diffDays <= 30) return "overdue";
  return "upcoming";
}

export function formatVaccineDate(date: Date): string {
  return date.toLocaleDateString("es", { year: "numeric", month: "short", day: "numeric" });
}
