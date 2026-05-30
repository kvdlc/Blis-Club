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
        className="flex items-center gap-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 font-semibold text-sm transition-colors"
      >
        <Plus className="w-5 h-5" />
        Registrar mi perro
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 text-left">
      <div className="flex items-center gap-3">
        <PawPrint className="w-6 h-6 text-primary-600" />
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Nuevo perro</h3>
      </div>
      {error && (
        <p className="text-sm text-danger-600 bg-danger-50 dark:bg-danger-950 rounded-lg p-3">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          required
          placeholder="Raza (ej: American Bully)"
          value={raza}
          onChange={(e) => setRaza(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            placeholder="Edad (meses)"
            value={edadMeses}
            onChange={(e) => setEdadMeses(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            required
            type="number"
            step="0.1"
            placeholder="Peso (kg)"
            value={pesoKg}
            onChange={(e) => setPesoKg(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option>Obediencia básica</option>
          <option>Control de reactividad</option>
          <option>Agility y deporte</option>
          <option>Nutrición natural</option>
          <option>Socialización</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3 text-sm font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
