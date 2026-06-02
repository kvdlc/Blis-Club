"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PawPrint, Plus } from "lucide-react";

export function AddDogForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [raza, setRaza] = useState("");
  const [edadMeses, setEdadMeses] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [objetivo, setObjetivo] = useState("Obediencia básica");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: insertError } = await supabase.from("dogs").insert({
      owner_id: userId,
      nombre,
      raza,
      edad_meses: parseInt(edadMeses),
      peso_kg: parseFloat(pesoKg),
      objetivo_principal: objetivo,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[1.25rem] bg-primary-600 hover:bg-primary-700 text-white px-7 py-4 font-bold text-sm transition-all active:scale-[0.97] shadow-lg shadow-primary-600/25"
      >
        <Plus className="w-5 h-5" />
        Registrar mi perro
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-[1.5rem] shadow-lg border border-zinc-100 dark:border-zinc-800 p-6 space-y-4 text-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-primary-600" />
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Nuevo perro</h3>
      </div>
      {error && (
        <p className="text-sm text-danger-600 bg-danger-50 dark:bg-danger-950/40 rounded-xl p-3">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
        />
        <input
          required
          placeholder="Raza (ej: American Bully)"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            placeholder="Edad (meses)"
            value={edadMeses}
            onChange={(e) => setEdadMeses(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <input
            required
            type="number"
            step="0.1"
            placeholder="Peso (kg)"
            value={pesoKg}
            onChange={(e) => setPesoKg(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <select
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
        >
          <option>Obediencia básica</option>
          <option>Control de reactividad</option>
          <option>Agility y deporte</option>
          <option>Nutrición natural</option>
          <option>Socialización</option>
        </select>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-bold disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-5 py-3 text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
