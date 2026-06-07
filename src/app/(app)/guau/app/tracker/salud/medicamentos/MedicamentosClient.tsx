"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMedication, DogMedicationLog } from "@/types/database";
import { ArrowLeft, Pill, Clock, Plus, Pencil, Trash2, Save, X, Minus, CheckCircle2, XCircle, History, StopCircle } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

interface Props {
  dog: Dog;
  medications: DogMedication[];
  initialLogs: DogMedicationLog[];
}

/** ¿Toca dosis hoy según última toma real? */
function getDoseInfo(med: DogMedication, logs: DogMedicationLog[]) {
  const medLogs = logs
    .filter((l) => l.medication_id === med.id)
    .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());
  const lastTakenLog = medLogs.find((l) => l.taken && l.taken_at);
  const base = lastTakenLog?.taken_at ? new Date(lastTakenLog.taken_at) : new Date(med.start_date + "T00:00:00");
  const now = new Date();
  const dueDate = new Date(base.getTime() + (med.interval_days || 1) * 86400000);
  const isDue = now.toDateString() >= dueDate.toDateString();
  const takenToday = medLogs.some((l) => l.taken && new Date(l.taken_at!).toDateString() === now.toDateString());
  const isOverdue = isDue && dueDate.toDateString() < now.toDateString();
  return {
    due: isDue && !takenToday,
    overdue: isOverdue,
    takenToday,
    nextDoseDate: dueDate,
    lastTaken: lastTakenLog?.taken_at ? new Date(lastTakenLog.taken_at) : null,
    history: medLogs.slice(0, 7),
  };
}

export function MedicamentosClient({ dog, medications: initialMeds, initialLogs }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [meds, setMeds] = useState(initialMeds);
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState("");
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [intervalDays, setIntervalDays] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DogMedication>>({});
  const [doseTime, setDoseTime] = useState<Record<string, string>>({});

  // ─── CRUD ────────────────────────────────────────────────

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

  // ─── Tracking de dosis ──────────────────────────────────

  const markDose = async (med: DogMedication, taken: boolean) => {
    const now = new Date();
    const time = doseTime[med.id] || med.dose_hours?.[0]?.slice(0, 5) || "08:00";
    const scheduledTime = `${now.toISOString().slice(0, 10)}T${time}:00`;
    const payload: any = {
      medication_id: med.id,
      scheduled_time: scheduledTime,
      taken,
    };
    if (taken) {
      payload.taken_at = new Date().toISOString();
    }
    const { data } = await supabase.from("dog_medication_logs").insert(payload).select("*").single();
    if (data) setLogs((prev) => [...prev, data as DogMedicationLog]);
  };

  const getDefaultDoseTime = (med: DogMedication) => {
    if (doseTime[med.id]) return doseTime[med.id];
    return med.dose_hours?.[0]?.slice(0, 5) || "08:00";
  };

  // ─── Interrumpir tratamiento ────────────────────────────

  const stopTreatment = async (medId: string) => {
    if (!confirm("¿Interrumpir este tratamiento? El medicamento se marcará como completado y no recibirás más alertas.")) return;
    await supabase.from("dog_medications").update({ status: "completed" }).eq("id", medId);
    setMeds((prev) => prev.map((m) => (m.id === medId ? { ...m, status: "completed" as const } : m)));
  };

  // ─── RENDER ─────────────────────────────────────────────

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
            <div className="flex-1"><span className="text-xs text-zinc-400 block mb-1">💊 Nombre</span><input name="medication_name" placeholder="Nombre *" required className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" /></div>
            <div className="flex-1"><span className="text-xs text-zinc-400 block mb-1">⚗️ Dosis</span><input name="dosage" placeholder="Ej: 1 comp/8h" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" /></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1"><span className="text-xs text-zinc-400 block mb-1">📅 Inicio</span><DatePicker value={formStartDate} onChange={setFormStartDate} /></div>
            <div className="flex-1"><span className="text-xs text-zinc-400 block mb-1">🏁 Fin</span><DatePicker value={formEndDate} onChange={setFormEndDate} label="Indefinido" /></div>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">🔄 Frecuencia</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Cada</span>
              <button type="button" onClick={() => setIntervalDays(Math.max(1, intervalDays - 1))} className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Minus className="w-3.5 h-3.5 text-zinc-500" /></button>
              <input type="number" min={1} value={intervalDays} onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))} className="w-14 text-center rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-2 text-sm font-bold text-zinc-800 dark:text-zinc-200" />
              <button type="button" onClick={() => setIntervalDays(intervalDays + 1)} className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Plus className="w-3.5 h-3.5 text-zinc-500" /></button>
              <span className="text-xs text-zinc-500">días</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-zinc-400 block mb-1">🕐 Dosis por día</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} type="button" onClick={() => setDosesPerDay(n)}
                  className={`flex-1 text-xs font-semibold rounded-lg py-2 transition-colors ${dosesPerDay === n ? "bg-warning-500 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}><input type="time" name={`dose_time_${i}`} defaultValue={["08:00", "14:00", "20:00", "00:00"][i]} className={`w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs ${i >= dosesPerDay ? "opacity-30" : ""}`} disabled={i >= dosesPerDay} /></div>
            ))}
          </div>
          <button type="submit" className="w-full bg-warning-600 text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98]">💊 Agregar Medicamento</button>
        </form>
      )}

      {/* Tarjetas */}
      <div className="space-y-3">
        {meds.map((med) => {
          const doseInfo = med.status === "active" ? getDoseInfo(med, logs) : null;
          return (
          <div key={med.id} className={`card-soft rounded-[1.25rem] p-4 space-y-2 ${med.status === "completed" ? "opacity-60" : ""}`}>
            {editing === med.id ? (
              <div className="space-y-2">
                <input value={editForm.medication_name || ""} onChange={(e) => setEditForm((f) => ({ ...f, medication_name: e.target.value }))} placeholder="Nombre" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <input value={editForm.dosage || ""} onChange={(e) => setEditForm((f) => ({ ...f, dosage: e.target.value }))} placeholder="Dosis" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1"><span className="text-[10px] text-zinc-400 block mb-0.5">📅 Inicio</span><DatePicker value={editForm.start_date || ""} onChange={(d) => setEditForm((f) => ({ ...f, start_date: d }))} /></div>
                  <div className="flex-1"><span className="text-[10px] text-zinc-400 block mb-0.5">🏁 Fin</span><DatePicker value={editForm.end_date || ""} onChange={(d) => setEditForm((f) => ({ ...f, end_date: d }))} label="Indefinido" /></div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-0.5">🔄 Frecuencia</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Cada</span>
                    <button type="button" onClick={() => editIntervalDays(intervalEdit - 1)} className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Minus className="w-3 h-3 text-zinc-500" /></button>
                    <input type="number" min={1} value={intervalEdit} onChange={(e) => editIntervalDays(parseInt(e.target.value) || 1)} className="w-12 text-center rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200" />
                    <button type="button" onClick={() => editIntervalDays(intervalEdit + 1)} className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><Plus className="w-3 h-3 text-zinc-500" /></button>
                    <span className="text-xs text-zinc-500">días</span>
                  </div>
                </div>
                <div><span className="text-[10px] text-zinc-400 block mb-0.5">🕐 Dosis por día</span>
                  <div className="flex gap-1.5">{[1, 2, 3, 4].map((n) => (<button key={n} type="button" onClick={() => editDoses(n)} className={`flex-1 text-xs font-semibold rounded-lg py-1.5 transition-colors ${dosesEdit === n ? "bg-warning-500 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>{n}</button>))}</div>
                </div>
                <div><span className="text-[10px] text-zinc-400 block mb-0.5">⏰ Horarios</span>
                  <div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((i) => (<div key={i}><input type="time" value={(hoursEdit[i] || "").slice(0, 5)} onChange={(e) => editHour(i, e.target.value)} className={`w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-xs ${i >= dosesEdit ? "opacity-30" : ""}`} disabled={i >= dosesEdit} /></div>))}</div>
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
                    <button onClick={() => startEdit(med)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200"><Pencil className="w-3 h-3 text-zinc-500 dark:text-zinc-400" /></button>
                    <button onClick={() => deleteMed(med.id)} className="w-6 h-6 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center hover:bg-danger-200"><Trash2 className="w-3 h-3 text-danger-500" /></button>
                    <button onClick={() => supabase.from("dog_medications").update({ status: med.status === "active" ? "completed" : "active" }).eq("id", med.id).select("*").single().then(({ data }) => { if (data) setMeds((prev) => prev.map((m) => (m.id === med.id ? (data as DogMedication) : m))); })}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${med.status === "active" ? "bg-secondary-100 text-secondary-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                      {med.status === "active" ? "Activo" : "Completado"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                  <span>{new Date(med.start_date + "T00:00:00").toLocaleDateString("es")} - {med.end_date ? new Date(med.end_date + "T00:00:00").toLocaleDateString("es") : "Indefinido"}</span>
                  <span>· {med.doses_per_day} dosis/día</span>
                  {med.interval_days && med.interval_days > 1 ? (<span>· Cada {med.interval_days} días</span>) : (<span>· A diario</span>)}
                </div>
                {med.dose_hours && med.dose_hours.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {med.dose_hours.map((h, i) => (<div key={i} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-[10px]"><Clock className="w-2.5 h-2.5" /> {h.slice(0, 5)}</div>))}
                  </div>
                )}

                {/* ═══ Seguimiento de dosis (solo activos) ═══ */}
                {med.status === "active" && doseInfo && (
                  <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <History className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] font-semibold text-zinc-500">Seguimiento</span>
                    </div>

                    {/* Dosis de hoy */}
                    {doseInfo.due ? (
                      <div className="bg-warning-50 dark:bg-warning-950/20 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-semibold text-warning-700 dark:text-warning-300">
                          {doseInfo.overdue ? "⚠️ Dosis atrasada" : "📋 Dosis de hoy"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-warning-500" />
                          <input type="time" value={getDefaultDoseTime(med)}
                            onChange={(e) => setDoseTime((prev) => ({ ...prev, [med.id]: e.target.value }))}
                            className="rounded-lg bg-white dark:bg-zinc-800 border border-warning-200 dark:border-warning-800 px-2 py-1 text-xs font-mono" />
                          <span className="text-[10px] text-zinc-400">
                            Próx: {doseInfo.nextDoseDate.toLocaleDateString("es", { day: "2-digit", month: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => markDose(med, true)}
                            className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg py-1.5 text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                            <CheckCircle2 className="w-3 h-3" /> Marcar tomada
                          </button>
                          <button onClick={() => markDose(med, false)}
                            className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
                            <XCircle className="w-3 h-3" /> Omitir
                          </button>
                        </div>
                      </div>
                    ) : doseInfo.takenToday ? (
                      <p className="text-[10px] text-secondary-600 dark:text-secondary-400 text-center py-1">✅ Dosis de hoy registrada</p>
                    ) : (
                      <p className="text-[10px] text-zinc-400 text-center py-1">📋 Próxima dosis: {doseInfo.nextDoseDate.toLocaleDateString("es", { day: "2-digit", month: "2-digit" })}</p>
                    )}

                    {/* Historial */}
                    {doseInfo.history.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {doseInfo.history.map((log, i) => (
                          <div key={i} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${log.taken ? "bg-secondary-50 dark:bg-secondary-950/30 text-secondary-700 dark:text-secondary-300" : "bg-danger-50 dark:bg-danger-950/20 text-danger-600 dark:text-danger-400"}`}>
                            {log.taken ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                            {new Date(log.scheduled_time).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                            {log.taken && log.taken_at && <span className="opacity-70">{new Date(log.taken_at).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interrumpir tratamiento */}
                    <button onClick={() => stopTreatment(med.id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 py-1.5 text-[10px] font-semibold text-zinc-400 hover:text-danger-500 hover:border-danger-200 dark:hover:border-danger-800 transition-colors">
                      <StopCircle className="w-3 h-3" /> Interrumpir tratamiento
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )})}

        {meds.filter((m) => m.status === "active").length === 0 && (
          <p className="text-xs text-zinc-400 text-center py-2">Sin medicamentos activos</p>
        )}
      </div>
    </div>
  );
}
