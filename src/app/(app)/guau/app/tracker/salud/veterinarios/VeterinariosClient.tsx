"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TrustedVet } from "@/types/database";
import { PhoneInput } from "@/components/PhoneInput";
import { ArrowLeft, GraduationCap, Star, Plus, Phone, MessageCircle, Pencil, Trash2, Save, X, UserRound, Building2, Stethoscope } from "lucide-react";

const SPECIALTIES = ["General", "Dermatología", "Ortopedia", "Cardiología", "Neurología", "Oftalmología", "Oncología", "Nutrición", "Etología", "Fisioterapia"];

interface Props {
  userId: string;
  trustedVets: TrustedVet[];
}

export function VeterinariosClient({ userId, trustedVets }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [showAddVet, setShowAddVet] = useState(false);
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; clinic: string; phone: string; specialty: string }>({ name: "", clinic: "", phone: "", specialty: "" });

  const resetForm = () => { setPhone(""); setSpecialty(""); };

  const addTrustedVet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await supabase.from("trusted_vets").insert({
      user_id: userId,
      name: formData.get("name") as string,
      clinic_name: (formData.get("clinic") as string) || null,
      phone: phone || null,
      specialty: specialty || null,
    });
    setShowAddVet(false);
    resetForm();
    form.reset();
    router.refresh();
  };

  const deleteVet = async (id: string) => {
    await supabase.from("trusted_vets").delete().eq("id", id);
    router.refresh();
  };

  const startEdit = (vet: TrustedVet) => {
    setEditing(vet.id);
    setEditForm({ name: vet.name, clinic: vet.clinic_name || "", phone: vet.phone || "", specialty: vet.specialty || "" });
  };

  const saveEdit = async (id: string) => {
    await supabase.from("trusted_vets").update({
      name: editForm.name,
      clinic_name: editForm.clinic || null,
      phone: editForm.phone || null,
      specialty: editForm.specialty || null,
    }).eq("id", id);
    setEditing(null);
    router.refresh();
  };

  const cleanPhone = (phoneStr: string | null) => {
    if (!phoneStr) return null;
    return phoneStr.replace(/[\s\-()]+/g, "");
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-accent-500" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Veterinarios de Confianza</h1>
        </div>
      </div>

      <div className="space-y-3">
        {trustedVets.map((vet) => (
          <div key={vet.id} className="card-soft rounded-[1.25rem] p-4 space-y-2">
            {editing === vet.id ? (
              <div className="space-y-2">
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <input value={editForm.clinic} onChange={(e) => setEditForm((f) => ({ ...f, clinic: e.target.value }))} placeholder="Clínica" className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs" />
                <PhoneInput value={editForm.phone} onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))} />
                <div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">🎯 Especialidad</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {SPECIALTIES.map((s) => (
                      <button key={s} type="button" onClick={() => setEditForm((f) => ({ ...f, specialty: f.specialty === s ? "" : s }))}
                        className={`text-[10px] rounded-full px-2.5 py-1 transition-colors ${editForm.specialty === s ? "bg-accent-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(vet.id)} className="flex-1 bg-accent-600 text-white rounded-lg py-1.5 text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Guardar</button>
                  <button onClick={() => setEditing(null)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1"><X className="w-3 h-3" /> Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{vet.name}</p>
                    {vet.clinic_name && <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">🏥 {vet.clinic_name}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(vet)} className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
                      <Pencil className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    </button>
                    <button onClick={() => deleteVet(vet.id)} className="w-6 h-6 rounded-full bg-danger-100 dark:bg-danger-900 flex items-center justify-center hover:bg-danger-200 transition-colors">
                      <Trash2 className="w-3 h-3 text-danger-500" />
                    </button>
                    <div className="flex items-center gap-0.5 text-xs text-warning-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{vet.avg_rating?.toFixed(1) || "0.0"}</span>
                      <span className="text-zinc-400">({vet.total_visits})</span>
                    </div>
                  </div>
                </div>

                {vet.specialty && (
                  <span className="text-[10px] bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-full inline-block">
                    🎯 {vet.specialty}
                  </span>
                )}

                {vet.phone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${cleanPhone(vet.phone)}`}
                      className="flex items-center gap-1.5 bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 rounded-full px-3 py-1.5 text-[11px] font-semibold hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Llamar
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone(vet.phone)?.replace(/^\+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full px-3 py-1.5 text-[11px] font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {!showAddVet && (
          <button onClick={() => setShowAddVet(true)} className="w-full flex items-center justify-center gap-1 card-soft rounded-[1.25rem] p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <Plus className="w-4 h-4" /> Agregar Veterinario
          </button>
        )}

        {showAddVet && (
          <form onSubmit={addTrustedVet} className="card-soft rounded-[1.25rem] p-5 space-y-3 bg-gradient-to-br from-accent-50/50 to-secondary-50/50 dark:from-accent-950/30 dark:to-secondary-950/20 border-2 border-dashed border-accent-200 dark:border-accent-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-accent-500" />
              <span className="text-xs font-bold text-accent-700 dark:text-accent-300">Nuevo Veterinario</span>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1"><UserRound className="w-3 h-3 text-zinc-400" /><span className="text-[10px] text-zinc-500 dark:text-zinc-400">👤 Nombre</span></div>
              <input name="name" placeholder="Dr(a). Nombre completo *" required className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1"><Phone className="w-3 h-3 text-zinc-400" /><span className="text-[10px] text-zinc-500 dark:text-zinc-400">📱 Teléfono</span></div>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1"><Building2 className="w-3 h-3 text-zinc-400" /><span className="text-[10px] text-zinc-500 dark:text-zinc-400">🏥 Clínica</span></div>
              <input name="clinic" placeholder="Nombre de la clínica" className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs" />
            </div>

            <div>
              <div className="flex items-center gap-1 mb-1"><Stethoscope className="w-3 h-3 text-zinc-400" /><span className="text-[10px] text-zinc-500 dark:text-zinc-400">🎯 Especialidad</span></div>
              <div className="flex flex-wrap gap-1.5">
                {SPECIALTIES.map((s) => (
                  <button key={s} type="button" onClick={() => setSpecialty(specialty === s ? "" : s)}
                    className={`text-[10px] rounded-full px-2.5 py-1 transition-colors ${specialty === s ? "bg-accent-500 text-white shadow-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent-600 text-white rounded-xl py-2.5 text-xs font-bold active:scale-[0.98] hover:bg-accent-700 transition-colors">
                ✅ Guardar
              </button>
              <button type="button" onClick={() => { setShowAddVet(false); resetForm(); }} className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl py-2.5 text-xs font-semibold">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
