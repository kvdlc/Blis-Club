"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogWeightHistory } from "@/types/database";
import { uploadPhotoFromDataUrl } from "@/lib/storage";
import { ArrowLeft, Weight, Save, Camera, Trash2, Pencil, X, TrendingUp, TrendingDown } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { ImageEditor } from "@/components/ImageEditor";
import { getTodayLocal } from "@/lib/dates";

interface Props {
  dog: Dog;
  weightHistory: DogWeightHistory[];
}

export function PesoClient({ dog, weightHistory: initialWeight }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [weight, setWeight] = useState(initialWeight);
  const [formDate, setFormDate] = useState(getTodayLocal());
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ peso_kg: string; fecha: string; notas: string }>({ peso_kg: "", fecha: "", notas: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormDate(getTodayLocal());
    setPhotoUrl("");
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setEditorSrc(blobUrl);
    setEditorOpen(true);
    e.target.value = "";
  };

  const addWeight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const { data } = await supabase.from("dog_weight_history").insert({
      dog_id: dog.id,
      peso_kg: parseFloat(formData.get("peso_kg") as string),
      fecha: formDate,
      notas: (formData.get("notas") as string) || null,
      foto_url: photoUrl || null,
    }).select("*").single();
    if (data) setWeight((prev) => [data as DogWeightHistory, ...prev]);
    setUploading(false);
    form.reset();
    resetForm();
  };

  const deleteWeight = async (id: string) => {
    await supabase.from("dog_weight_history").delete().eq("id", id);
    setWeight((prev) => prev.filter((w) => w.id !== id));
  };

  const startEdit = (w: DogWeightHistory) => {
    setEditing(w.id);
    setEditForm({ peso_kg: w.peso_kg.toString(), fecha: w.fecha, notas: w.notas || "" });
  };

  const saveEdit = async (id: string) => {
    const { data } = await supabase.from("dog_weight_history").update({
      peso_kg: parseFloat(editForm.peso_kg),
      fecha: editForm.fecha,
      notas: editForm.notas || null,
    }).eq("id", id).select("*").single();
    if (data) setWeight((prev) => prev.map((w) => (w.id === id ? (data as DogWeightHistory) : w)));
    setEditing(null);
  };

  const getTrend = (index: number): { diff: number; up: boolean } | null => {
    if (index >= weight.length - 1) return null;
    const diff = weight[index].peso_kg - weight[index + 1].peso_kg;
    return { diff: Math.abs(diff), up: diff > 0 };
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-100 flex items-center justify-center">
            <Weight className="w-4 h-4 text-accent-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900">Peso de {dog.nombre}</h1>
        </div>
      </div>

      <div className="card-soft rounded-[1.25rem] p-4 flex items-center justify-between bg-gradient-to-r from-accent-50 to-primary-50">
        <span className="text-sm font-semibold text-zinc-700">⚖️ Peso actual</span>
        <span className="text-xl font-extrabold text-accent-600">{dog.peso_kg} kg</span>
      </div>

      <div className="space-y-2">
        {weight.length > 0 ? (
          weight.map((w, i) => {
            const trend = getTrend(i);
            return (
              <div key={w.id} className="card-soft rounded-[1.25rem] p-3 space-y-2">
                {editing === w.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <DatePicker value={editForm.fecha} onChange={(d) => setEditForm((f) => ({ ...f, fecha: d }))} />
                      <input type="number" step="0.1" value={editForm.peso_kg} onChange={(e) => setEditForm((f) => ({ ...f, peso_kg: e.target.value }))} className="w-24 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-xs" />
                    </div>
                    <input value={editForm.notas} onChange={(e) => setEditForm((f) => ({ ...f, notas: e.target.value }))} placeholder="Notas" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-xs" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(w.id)} className="flex-1 bg-accent-600 text-white rounded-lg py-1.5 text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Guardar</button>
                      <button onClick={() => setEditing(null)} className="flex-1 bg-zinc-100 rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1"><X className="w-3 h-3" /> Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {w.foto_url && (
                        <img src={w.foto_url} alt="Peso" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-zinc-500">{new Date(w.fecha + "T00:00:00").toLocaleDateString("es")}</span>
                          <span className="text-sm font-extrabold text-zinc-700">{w.peso_kg} kg</span>
                        </div>
                        {trend && (
                          <div className={`flex items-center gap-0.5 text-[10px] mt-0.5 ${trend.up ? "text-danger-500" : "text-secondary-500"}`}>
                            {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {trend.up ? "Subió" : "Bajó"} {trend.diff.toFixed(1)} kg
                          </div>
                        )}
                        {w.notas && <p className="text-[10px] text-zinc-400 truncate mt-0.5">{w.notas}</p>}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => startEdit(w)} className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                          <Pencil className="w-3 h-3 text-zinc-500" />
                        </button>
                        <button onClick={() => deleteWeight(w.id)} className="w-6 h-6 rounded-full bg-danger-100 flex items-center justify-center hover:bg-danger-200 transition-colors">
                          <Trash2 className="w-3 h-3 text-danger-500" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-zinc-400 text-center py-4">Sin registros de peso</p>
        )}
      </div>

      <form onSubmit={addWeight} className="card-soft rounded-[1.25rem] p-5 space-y-3 bg-gradient-to-br from-accent-50/50 to-primary-50/50 border-2 border-dashed border-accent-200">
        <div className="flex items-center gap-2">
          <Weight className="w-4 h-4 text-accent-500" />
          <span className="text-xs font-bold text-accent-700">Nuevo Registro</span>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500">📅 Fecha</span></div>
            <DatePicker value={formDate} onChange={setFormDate} />
          </div>
          <div className="w-28">
            <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500">⚖️ Peso</span></div>
            <input name="peso_kg" type="number" step="0.1" placeholder={`${dog.peso_kg}`} required className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm font-bold text-accent-600" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500">📸 Foto de progreso</span></div>
          <div className="flex gap-2">
            {photoUrl ? (
              <div className="relative w-full">
                <img src={photoUrl} alt="Preview" className="w-full h-32 rounded-xl object-cover" />
                <button type="button" onClick={() => setPhotoUrl("")} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-300 py-6 hover:bg-zinc-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-accent-500" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-500">Tocar para tomar o elegir foto</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFilePick}
          />
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1"><span className="text-xs text-zinc-500">🗒️ Notas</span></div>
          <input name="notas" placeholder="Ej: Después del desayuno" className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs" />
        </div>

        <button type="submit" disabled={uploading} className="w-full bg-accent-600 text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] hover:bg-accent-700 transition-colors disabled:opacity-50">
          {uploading ? "⏳ Subiendo..." : "⚖️ Registrar Peso"}
        </button>
      </form>

      {editorOpen && (
        <ImageEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          imageUrl={editorSrc}
          onSave={async (dataUrl) => {
            setUploading(true);
            const url = await uploadPhotoFromDataUrl(dataUrl, dog.owner_id);
            if (url) setPhotoUrl(url);
            setUploading(false);
            setEditorOpen(false);
          }}
          circleSize={160}
        />
      )}
    </div>
  );
}
