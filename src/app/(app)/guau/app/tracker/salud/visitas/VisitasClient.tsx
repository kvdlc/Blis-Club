"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogVetVisit, TrustedVet } from "@/types/database";
import { ArrowLeft, Stethoscope, Star, Plus, Pencil, Trash2, Save, X, ClipboardList } from "lucide-react";
import { VetSelect } from "@/components/VetSelect";
import { DatePicker } from "@/components/DatePicker";

interface Props {
  dog: Dog;
  vetVisits: DogVetVisit[];
  trustedVets: TrustedVet[];
}

export function VisitasClient({ dog, vetVisits: initialVisits, trustedVets }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [vetVisits, setVetVisits] = useState(initialVisits);
  const [formVetId, setFormVetId] = useState("");
  const [formFecha, setFormFecha] = useState(new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DogVetVisit>>({});

  const resetForm = () => {
    setFormVetId("");
    setFormFecha(new Date().toISOString().slice(0, 10));
  };

  const addVetVisit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const vetId = (formData.get("vet_id") as string) || null;
    const vetName = vetId ? trustedVets.find((v) => v.id === vetId)?.name ?? null : (formData.get("vet_name") as string) || null;
    const { data } = await supabase.from("dog_vet_visits").insert({
      dog_id: dog.id,
      fecha: formData.get("fecha") as string,
      motivo: formData.get("motivo") as string,
      diagnostico: (formData.get("diagnostico") as string) || null,
      vet_name: vetName,
      vet_id: vetId,
      peso_kg: parseFloat(formData.get("peso_kg") as string) || null,
      notas: (formData.get("notas") as string) || null,
    }).select("*").single();
    if (data) setVetVisits((prev) => [data as DogVetVisit, ...prev]);
    resetForm();
    form.reset();
  };

  const rateVetVisit = async (visitId: string, rating: number) => {
    const { data } = await supabase.from("dog_vet_visits").update({ vet_rating: rating }).eq("id", visitId).select("*").single();
    if (data) setVetVisits((prev) => prev.map((v) => (v.id === visitId ? (data as DogVetVisit) : v)));
  };

  const deleteVisit = async (id: string) => {
    await supabase.from("dog_vet_visits").delete().eq("id", id);
    setVetVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const startEdit = (visit: DogVetVisit) => {
    setEditing(visit.id);
    setEditForm({ motivo: visit.motivo, diagnostico: visit.diagnostico || "", vet_name: visit.vet_name || "", peso_kg: visit.peso_kg, fecha: visit.fecha });
  };

  const saveEdit = async (id: string) => {
    const { data } = await supabase.from("dog_vet_visits").update(editForm).eq("id", id).select("*").single();
    if (data) setVetVisits((prev) => prev.map((v) => (v.id === id ? (data as DogVetVisit) : v)));
    setEditing(null);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-secondary-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Visitas al Veterinario</h1>
        </div>
      </div>

      <div className="space-y-3">
        {vetVisits.map((visit) => (
          <div key={visit.id} className="card-soft rounded-[1.25rem] p-4 space-y-1">
            {editing === visit.id ? (
              <div className="space-y-2">
                <input value={editForm.motivo || ""} onChange={(e) => setEditForm((f) => ({ ...f, motivo: e.target.value }))} placeholder="Motivo" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <input value={editForm.vet_name || ""} onChange={(e) => setEditForm((f) => ({ ...f, vet_name: e.target.value }))} placeholder="Veterinario" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <div className="flex gap-2">
                  <input type="number" step="0.1" value={editForm.peso_kg?.toString() || ""} onChange={(e) => setEditForm((f) => ({ ...f, peso_kg: parseFloat(e.target.value) || null }))} placeholder="Peso kg" className="w-24 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                  <DatePicker value={editForm.fecha || ""} onChange={(d) => setEditForm((f) => ({ ...f, fecha: d }))} />
                </div>
                <input value={editForm.diagnostico || ""} onChange={(e) => setEditForm((f) => ({ ...f, diagnostico: e.target.value }))} placeholder="Diagnóstico" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(visit.id)} className="flex-1 bg-primary-600 text-white rounded-lg py-1.5 text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1"><X className="w-3 h-3" /> Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate min-w-0 flex-1">{visit.motivo}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(visit)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Pencil className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button onClick={() => deleteVisit(visit.id)} className="w-6 h-6 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center hover:bg-danger-200 transition-colors">
                      <Trash2 className="w-3 h-3 text-danger-500" />
                    </button>
                    <span className="text-[10px] text-zinc-400">{new Date(visit.fecha + "T00:00:00").toLocaleDateString("es")}</span>
                  </div>
                </div>
                {visit.vet_name && <p className="text-xs text-zinc-500 truncate">👨‍⚕️ Dr(a). {visit.vet_name}</p>}
                {visit.diagnostico && <p className="text-xs text-zinc-500 truncate">📋 {visit.diagnostico}</p>}
                {visit.peso_kg && <p className="text-[10px] text-zinc-400">⚖️ Peso: {visit.peso_kg}kg</p>}
                <div className="flex items-center gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => rateVetVisit(visit.id, s)}
                      className={`text-sm ${(visit.vet_rating ?? 0) >= s ? "text-warning-400" : "text-zinc-300 dark:text-zinc-700"}`}>
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}

        <form onSubmit={addVetVisit} className="card-soft rounded-[1.25rem] p-5 space-y-3 bg-gradient-to-br from-secondary-50/50 to-primary-50/50 dark:from-secondary-950/30 dark:to-primary-950/20 border-2 border-dashed border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-secondary-500" />
            <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">Nueva Visita</span>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">📅 Fecha</span></div>
            <DatePicker value={formFecha} onChange={setFormFecha} />
            <input type="hidden" name="fecha" value={formFecha} />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">📝 Motivo</span></div>
            <input name="motivo" placeholder="Ej: Revisión general, vacuna..." required className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">👨‍⚕️ Veterinario</span></div>
              <input name="vet_name" placeholder="Nombre del vet" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>
            <div className="w-24">
              <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">⚖️ Peso</span></div>
              <input name="peso_kg" type="number" step="0.1" placeholder="kg" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">🩺 Veterinario de confianza</span></div>
            <VetSelect value={formVetId} onChange={setFormVetId} trustedVets={trustedVets} placeholder="Seleccionar..." />
          </div>
          <input type="hidden" name="vet_id" value={formVetId} />

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">🗒️ Notas</span></div>
            <textarea name="notas" placeholder="Notas de la visita" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" rows={2} />
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500 dark:text-zinc-400">📋 Diagnóstico</span></div>
            <textarea name="diagnostico" placeholder="Diagnóstico del veterinario" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" rows={2} />
          </div>

          <button type="submit" className="w-full bg-secondary-600 text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] hover:bg-secondary-700 transition-colors">
            ✅ Registrar Visita
          </button>
        </form>
      </div>
    </div>
  );
}
