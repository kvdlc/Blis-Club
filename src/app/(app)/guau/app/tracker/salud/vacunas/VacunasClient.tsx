"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogVaccine, TrustedVet } from "@/types/database";
import { VACCINES, type VaccineWiki } from "@/lib/vaccines-wiki";
import { calculateVaccineSchedule } from "@/lib/vaccine-schedule";
import { useDisabledVaccines } from "@/lib/use-disabled-vaccines";
import { VaccineCard } from "../../VaccineCard";
import { VaccineWikiModal } from "../../VaccineWikiModal";
import { DatePicker } from "@/components/DatePicker";
import { VetSelect } from "@/components/VetSelect";
import {
  Syringe, ArrowLeft, Plus, Trash2, Eye, EyeOff, CalendarDays, Tag, DollarSign, Stethoscope, ChevronDown, ChevronUp,
} from "lucide-react";

interface Props {
  dog: Dog;
  vaccines: DogVaccine[];
  trustedVets: TrustedVet[];
}

export function VacunasClient({ dog, vaccines: initialVaccines, trustedVets }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [vaccines, setVaccines] = useState(initialVaccines);
  const [wikiVaccine, setWikiVaccine] = useState<VaccineWiki | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const { isEnabled, toggle: toggleVaccine, mounted } = useDisabledVaccines();

  const birthDate = dog.fecha_nacimiento
    ? new Date(dog.fecha_nacimiento + "T00:00:00")
    : dog.edad_meses
      ? (() => { const d = new Date(); d.setMonth(d.getMonth() - dog.edad_meses); return d; })()
      : null;

  const vaccineData = useMemo(() => VACCINES.map((vac) => {
    const records = vaccines.filter((v) => v.vaccine_name === vac.id);
    const overrides = records
      .filter((v) => v.date_administered)
      .map((v) => ({ doseNumber: v.dose_number, actualDate: new Date(v.date_administered + "T00:00:00") }));
    const schedule = calculateVaccineSchedule(vac, birthDate ?? new Date(), overrides);
    return { vaccine: vac, records, doses: schedule.doses, boosterDate: schedule.boosterDate };
  }), [vaccines, birthDate]);

  const addVaccineDose = async (vaccineId: string) => {
    const existing = vaccines.filter((v) => v.vaccine_name === vaccineId);
    const maxDose = existing.reduce((max, v) => Math.max(max, v.dose_number), 0);
    const { data } = await supabase.from("dog_vaccines").insert({
      dog_id: dog.id,
      vaccine_name: vaccineId,
      vaccine_group: VACCINES.find((v) => v.id === vaccineId)?.group ?? "core",
      dose_number: maxDose + 1,
      date_administered: null,
    }).select("*").single();
    if (data) setVaccines((prev) => [...prev, data as DogVaccine]);
  };

  const saveVaccineDose = async (recordId: string, dateStr: string, brand: string, cost: number | null, vetId: string | null) => {
    const { data } = await supabase.from("dog_vaccines").update({
      date_administered: dateStr || null,
      brand: brand || null,
      cost_usd: cost,
      vet_id: vetId || null,
    }).eq("id", recordId).select("*").single();
    if (data) setVaccines((prev) => prev.map((v) => (v.id === recordId ? (data as DogVaccine) : v)));
  };

  const deleteVaccineDose = async (recordId: string) => {
    await supabase.from("dog_vaccines").delete().eq("id", recordId);
    setVaccines((prev) => prev.filter((v) => v.id !== recordId));
  };

  const getExpectedDate = (vaccine: VaccineWiki, doseNumber: number): string | null => {
    const data = vaccineData.find((v) => v.vaccine.id === vaccine.id);
    if (!data) return null;
    const lastDose = data.doses[data.doses.length - 1];
    if (!lastDose) return null;
    if (doseNumber <= data.doses.length) {
      const d = data.doses.find((dd) => dd.doseNumber === doseNumber);
      return d ? d.calculatedDate.toISOString().slice(0, 10) : null;
    }
    const boostersAfter = doseNumber - data.doses.length;
    const expected = new Date(data.boosterDate);
    expected.setMonth(expected.getMonth() + vaccine.schedule.boosterIntervalMonths * (boostersAfter - 1));
    return expected.toISOString().slice(0, 10);
  };

  const activeData = vaccineData.filter((v) => isEnabled(v.vaccine.id));
  const hiddenData = vaccineData.filter((v) => !isEnabled(v.vaccine.id));

  return (
    <div className="-mx-4 px-4 pt-1 pb-8 min-h-screen">
      <div className="flex items-center gap-3 pt-1 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <Syringe className="w-4 h-4 text-primary-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Vacunas de {dog.nombre}</h1>
        </div>
      </div>

      <div className="space-y-4">
        {activeData.map(({ vaccine, records, doses, boosterDate }) => {
          const enabled = isEnabled(vaccine.id);
          const scheduleDosesCount = vaccine.schedule.doses.length;
          return (
            <div key={vaccine.id}>
              <VaccineCard
                vaccine={vaccine}
                records={records}
                doses={doses}
                onOpenWiki={setWikiVaccine}
              />

              {vaccine.group === "optional" && mounted && (
                <div className="flex items-center justify-end gap-1 mr-2 mt-1">
                  <button
                    onClick={() => toggleVaccine(vaccine.id)}
                    className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full transition-colors bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300"
                  >
                    <Eye className="w-3 h-3" />
                    Visible
                  </button>
                </div>
              )}

              <div className="ml-4 pl-3 border-l-2 border-primary-200/60 dark:border-primary-800/40 space-y-2 mt-2">
                {records.map((rec) => (
                  <DoseRow
                    key={rec.id}
                    record={rec}
                    trustedVets={trustedVets}
                    scheduleDosesCount={scheduleDosesCount}
                    expectedDate={getExpectedDate(vaccine, rec.dose_number)}
                    onSave={(date, brand, cost, vetId) => saveVaccineDose(rec.id, date, brand, cost, vetId)}
                    onDelete={() => deleteVaccineDose(rec.id)}
                  />
                ))}

                <button
                  onClick={() => addVaccineDose(vaccine.id)}
                  className="w-full card-soft rounded-2xl border-2 border-dashed border-primary-200 dark:border-primary-800 p-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Agregar dosis de {vaccine.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hiddenData.length > 0 && mounted && (
        <div className="mt-6">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="w-full flex items-center justify-between card-soft rounded-2xl p-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Vacunas ocultas ({hiddenData.length})
            </span>
            {showHidden ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHidden && (
            <div className="mt-3 space-y-3">
              {hiddenData.map(({ vaccine, records, doses, boosterDate }) => {
                const scheduleDosesCount = vaccine.schedule.doses.length;
                return (
                  <div key={vaccine.id} className="opacity-60 hover:opacity-100 transition-opacity">
                    <VaccineCard
                      vaccine={vaccine}
                      records={records}
                      doses={doses}
                      onOpenWiki={setWikiVaccine}
                    />

                    {vaccine.group === "optional" && mounted && (
                      <div className="flex items-center justify-end gap-1 mr-2 mt-1">
                        <button
                          onClick={() => toggleVaccine(vaccine.id)}
                          className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full transition-colors bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 hover:bg-primary-200"
                        >
                          <Eye className="w-3 h-3" />
                          Reactivar
                        </button>
                      </div>
                    )}

                    <div className="ml-4 pl-3 border-l-2 border-zinc-200/30 dark:border-zinc-700/30 space-y-2 mt-2">
                      {records.map((rec) => (
                        <DoseRow
                          key={rec.id}
                          record={rec}
                          trustedVets={trustedVets}
                          scheduleDosesCount={scheduleDosesCount}
                          expectedDate={getExpectedDate(vaccine, rec.dose_number)}
                          onSave={(date, brand, cost, vetId) => saveVaccineDose(rec.id, date, brand, cost, vetId)}
                          onDelete={() => deleteVaccineDose(rec.id)}
                        />
                      ))}

                      <button
                        onClick={() => addVaccineDose(vaccine.id)}
                        className="w-full card-soft rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 p-3 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500"
                      >
                        <Plus className="w-4 h-4" /> Agregar dosis de {vaccine.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {wikiVaccine && (
        <VaccineWikiModal
          vaccine={wikiVaccine}
          doses={vaccineData.find((v) => v.vaccine.id === wikiVaccine.id)?.doses ?? []}
          birthDate={birthDate}
          open={!!wikiVaccine}
          onClose={() => setWikiVaccine(null)}
        />
      )}
    </div>
  );
}

function DoseRow({ record, trustedVets, scheduleDosesCount, expectedDate, onSave, onDelete }: {
  record: DogVaccine;
  trustedVets: TrustedVet[];
  scheduleDosesCount: number;
  expectedDate: string | null;
  onSave: (date: string, brand: string, cost: number | null, vetId: string | null) => void;
  onDelete: () => void;
}) {
  const [date, setDate] = useState(record.date_administered || "");
  const [brand, setBrand] = useState(record.brand || "");
  const [cost, setCost] = useState(record.cost_usd?.toString() || "");
  const [vetId, setVetId] = useState(record.vet_id || "");
  const [saved, setSaved] = useState(false);
  const isBooster = record.dose_number > scheduleDosesCount;

  const handleSave = () => {
    onSave(date, brand, cost ? parseFloat(cost) : null, vetId || null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className={`card-soft rounded-2xl p-3 space-y-2.5 ${isBooster ? "border-accent-200/50 dark:border-accent-800/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isBooster ? "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300" : "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"}`}>
            💉 {isBooster ? `Refuerzo #${record.dose_number - scheduleDosesCount}` : `Dosis ${record.dose_number}/${scheduleDosesCount}`}
          </span>
          {!record.date_administered && expectedDate && (
            <span className="text-[10px] text-zinc-400">
              Esperada: {new Date(expectedDate + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {saved && <span className="text-[10px] text-secondary-600 font-medium animate-pulse">Guardado</span>}
          <button onClick={onDelete} className="w-6 h-6 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center hover:bg-danger-200 transition-colors" title="Eliminar">
            <Trash2 className="w-3 h-3 text-danger-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <CalendarDays className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-500">Fecha</span>
          </div>
          <DatePicker value={date} onChange={setDate} label="Seleccionar" />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Tag className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-500">Marca</span>
          </div>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ej: Nobivac"
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-500">Costo</span>
          </div>
          <input
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="$ USD"
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs"
          />
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Stethoscope className="w-3 h-3 text-zinc-400" />
            <span className="text-[10px] text-zinc-500">Veterinario</span>
          </div>
          <VetSelect value={vetId} onChange={setVetId} trustedVets={trustedVets} placeholder="Sin vet" />
        </div>
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-primary-600 text-white rounded-xl py-2 text-xs font-bold active:scale-[0.98] transition-transform hover:bg-primary-700"
      >
        💾 Guardar dosis
      </button>
    </div>
  );
}
