"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMedication } from "@/types/database";
import { ArrowLeft, Pill, Clock, Plus, Pencil, Trash2, Save, X, Minus, ChevronDown } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

interface Props {
  dog: Dog;
  medications: DogMedication[];
}

export function MedicamentosClient({ dog, medications: initialMeds }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [meds, setMeds] = useState(initialMeds);
  const [showForm, setShowForm] = useState(false);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState("");
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [intervalDays, setIntervalDays] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DogMedication>>({});

  const addMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const hours: string[] = [];
    for (let i = 0; i < dosesPerDay; i++) {
      const h = formData.get(`dose_time_${i}`) as string;
      if (h) hours.push(h);
    }
    const { data } = await supabase.from("dog_medications").insert({
      dog_id: dog.id,
      medication_name: formData.get("medication_name") as string,
      dosage: (formData.get("dosage") as string) || null,
      start_date: formStartDate,
      end_date: formEndDate || null,
      doses_per_day: dosesPerDay,
      dose_hours: hours,
      interval_days: intervalDays,
    }).select("*").single();
    if (data) setMeds((prev) => [...prev, data as DogMedication]);
    form.reset();
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate("");
    setDosesPerDay(1);
    setIntervalDays(1);
    setShowForm(false);
  };

  const toggleMedStatus = async (medId: string, currentStatus: string) => {
    const next = currentStatus === "active" ? "completed" : "active";
    const { data } = await supabase.from("dog_medications").update({ status: next }).eq("id", medId).select("*").single();
    if (data) setMeds((prev) => prev.map((m) => (m.id === medId ? (data as DogMedication) : m)));
  };

  const deleteMed = async (id: string) => {
    await supabase.from("dog_medications").delete().eq("id", id);
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const startEdit = (med: DogMedication) => {
    setEditing(med.id);
    setEditForm({
      medication_name: med.medication_name,
      dosage: med.dosage || "",
      start_date: med.start_date,
      end_date: med.end_date || "",
      doses_per_day: med.doses_per_day,
      dose_hours: med.dose_hours || [],
      interval_days: med.interval_days || 1,
    });
  };

  const saveEdit = async (id: string) => {
    const { data } = await supabase.from("dog_medications").update(editForm).eq("id", id).select("*").single();
    if (data) setMeds((prev) => prev.map((m) => (m.id === id ? (data as DogMedication) : m)));
    setEditing(null);
  };

  const editDoses = (n: number) => setEditForm((f) => ({ ...f, doses_per_day: n }));
  const editIntervalDays = (n: number) => setEditForm((f) => ({ ...f, interval_days: Math.max(1, n) }));
  const editHour = (i: number, h: string) => {
    const hours = [...(editForm.dose_hours || [])];
    hours[i] = h;
    setEditForm((f) => ({ ...f, dose_hours: hours }));
  };

  const dosesEdit = editForm.doses_per_day || 1;
  const intervalEdit = editForm.interval_days || 1;
  const hoursEdit = editForm.dose_hours || [];

  return (
    <div className="space-y-4 pb-8">
      {/* Header con botón de nuevo medicamento */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-xl bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
            <Pill className="w-4 h-4 text-warning-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Medicamentos</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            showForm
              ? "bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300"
              : "bg-warning-600 text-white hover:bg-warning-700 shadow-md active:scale-95"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Nuevo
        </button>
      </div>

      {/* Formulario colapsable */}
      {showForm && (
        <form onSubmit={addMedication} className="card-soft rounded-[1.25rem] p-5 space-y-3 bg-gradient-to-br from-warning-50/50 to-primary-50/50 dark:from-warning-950/30 dark:to-primary-950/20 border-2 border-dashed border-warning-200 dark:border-warning-800">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-warning-500" />
            <span className="text-xs font-bold text-warning-700 dark:text-warning-300">Nuevo Medicamento</span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">💊 Nombre</span></div>
              <input name="medication_name" placeholder="Nombre *" required className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">⚗️ Dosis</span></div>
              <input name="dosage" placeholder="Ej: 1 comp/8h" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">📅 Inicio</span></div>
              <DatePicker value={formStartDate} onChange={setFormStartDate} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">🏁 Fin</span></div>
              <DatePicker value={formEndDate} onChange={setFormEndDate} label="Indefinido" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">🔄 Frecuencia</span></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Cada</span>
              <button type="button" onClick={() => setIntervalDays(Math.max(1, intervalDays - 1))}
                className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <Minus className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <input type="number" min={1} value={intervalDays}
                onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 text-center rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-2 text-sm font-bold text-zinc-800 dark:text-zinc-200" />
              <button type="button" onClick={() => setIntervalDays(intervalDays + 1)}
                className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">días</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">🕐 Dosis por día</span></div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} type="button" onClick={() => setDosesPerDay(n)}
                  className={`flex-1 text-xs font-semibold rounded-lg py-2 transition-colors ${dosesPerDay === n ? "bg-warning-500 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1 text-[10px]">
                <input type="time" name={`dose_time_${i}`} defaultValue={["08:00", "14:00", "20:00", "00:00"][i]}
                  className={`w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 ${i >= dosesPerDay ? "opacity-30" : ""}`}
                  disabled={i >= dosesPerDay} />
              </div>
            ))}
          </div>

          <button type="submit" className="w-full bg-warning-600 text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] hover:bg-warning-700 transition-colors">
            💊 Agregar Medicamento
          </button>
        </form>
      )}

      {/* Lista de medicamentos */}
      <div className="space-y-3">
        {meds.map((med) => (
          <div key={med.id} className={`card-soft rounded-[1.25rem] p-4 space-y-2 ${med.status === "completed" ? "opacity-60" : ""}`}>
            {editing === med.id ? (
              <div className="space-y-2">
                <input value={editForm.medication_name || ""} onChange={(e) => setEditForm((f) => ({ ...f, medication_name: e.target.value }))} placeholder="Nombre" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <input value={editForm.dosage || ""} onChange={(e) => setEditForm((f) => ({ ...f, dosage: e.target.value }))} placeholder="Dosis" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">📅 Inicio</span>
                    <DatePicker value={editForm.start_date || ""} onChange={(d) => setEditForm((f) => ({ ...f, start_date: d }))} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">🏁 Fin</span>
                    <DatePicker value={editForm.end_date || ""} onChange={(d) => setEditForm((f) => ({ ...f, end_date: d }))} label="Indefinido" />
                  </div>
                </div>

                {/* Frecuencia editable */}
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5">🔄 Frecuencia</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Cada</span>
                    <button type="button" onClick={() => editIntervalDays(intervalEdit - 1)}
                      className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Minus className="w-3 h-3 text-zinc-500" />
                    </button>
                    <input type="number" min={1} value={intervalEdit}
                      onChange={(e) => editIntervalDays(parseInt(e.target.value) || 1)}
                      className="w-12 text-center rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200" />
                    <button type="button" onClick={() => editIntervalDays(intervalEdit + 1)}
                      className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Plus className="w-3 h-3 text-zinc-500" />
                    </button>
                    <span className="text-xs text-zinc-500">días</span>
                  </div>
                </div>

                {/* Dosis por día editable */}
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5">🕐 Dosis por día</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} type="button" onClick={() => editDoses(n)}
                        className={`flex-1 text-xs font-semibold rounded-lg py-1.5 transition-colors ${dosesEdit === n ? "bg-warning-500 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horarios editables */}
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5">⏰ Horarios</span>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px]">
                        <input type="time" value={(hoursEdit[i] || "").slice(0, 5)}
                          onChange={(e) => editHour(i, e.target.value)}
                          className={`w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 ${i >= dosesEdit ? "opacity-30" : ""}`}
                          disabled={i >= dosesEdit} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => saveEdit(med.id)} className="flex-1 bg-warning-600 text-white rounded-lg py-1.5 text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1"><X className="w-3 h-3" /> Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{med.medication_name}</p>
                    {med.dosage && <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{med.dosage}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(med)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Pencil className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button onClick={() => deleteMed(med.id)} className="w-6 h-6 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center hover:bg-danger-200 transition-colors">
                      <Trash2 className="w-3 h-3 text-danger-500" />
                    </button>
                    <button onClick={() => toggleMedStatus(med.id, med.status)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${med.status === "active" ? "bg-secondary-100 text-secondary-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                      {med.status === "active" ? "Activo" : "Completado"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                  <span>{new Date(med.start_date + "T00:00:00").toLocaleDateString("es")} - {med.end_date ? new Date(med.end_date + "T00:00:00").toLocaleDateString("es") : "Indefinido"}</span>
                  <span>· {med.doses_per_day} dosis/día</span>
                  {med.interval_days && med.interval_days > 1 ? (
                    <span>· Cada {med.interval_days} días</span>
                  ) : (
                    <span>· A diario</span>
                  )}
                </div>
                {med.dose_hours && med.dose_hours.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {med.dose_hours.map((h, i) => (
                      <div key={i} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-[10px]">
                        <Clock className="w-2.5 h-2.5" /> {h.slice(0, 5)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {meds.filter((m) => m.status === "active").length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-2">Sin medicamentos activos</p>
        )}
      </div>
    </div>
  );
}
