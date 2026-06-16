"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle } from "@/types/database";
import { ArrowLeft } from "lucide-react";

export default function EditVehicleClient({ userId, vehicle }: { userId: string; vehicle: Vehicle }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    marca: vehicle.marca,
    modelo: vehicle.modelo,
    año: vehicle.año,
    placa: vehicle.placa,
    kilometraje: vehicle.kilometraje,
    color: vehicle.color || "",
    vin: vehicle.vin || "",
    foto_url: vehicle.foto_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("vehicles").update({
      marca: form.marca,
      modelo: form.modelo,
      año: form.año,
      placa: form.placa,
      kilometraje: form.kilometraje,
      color: form.color || null,
      vin: form.vin || null,
      foto_url: form.foto_url || null,
    }).eq("id", vehicle.id).eq("owner_id", userId);

    setSaving(false);
    if (error) { alert("Error: " + error.message); return; }

    router.push("/auto/app/perfil");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700">
        <ArrowLeft className="w-4 h-4" /> Perfil
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-800">Editar vehículo</h1>
        <p className="text-xs text-zinc-500 mt-1">{vehicle.marca} {vehicle.modelo}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Marca *</span>
            <input required value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Modelo *</span>
            <input required value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Año *</span>
            <input required type="number" min={1950} max={new Date().getFullYear() + 1} value={form.año}
              onChange={(e) => setForm({ ...form, año: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Placa *</span>
            <input required value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
              maxLength={10} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Kilometraje</span>
            <input type="number" min={0} value={form.kilometraje}
              onChange={(e) => setForm({ ...form, kilometraje: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Color</span>
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">VIN</span>
            <input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
              maxLength={17} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-500">URL de la foto</span>
          <input value={form.foto_url} onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
            placeholder="https://..." className="w-full mt-1 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
        </label>

        {form.foto_url && (
          <div className="h-40 rounded-xl bg-zinc-100 overflow-hidden">
            <img src={form.foto_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-auto-600/20">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
