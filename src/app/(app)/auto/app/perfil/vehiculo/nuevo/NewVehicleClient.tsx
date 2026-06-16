"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadAutoPhoto } from "@/lib/storage";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

interface Props {
  userId: string;
}

export default function NewVehicleClient({ userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    placa: "",
    kilometraje: 0,
    color: "",
    vin: "",
    foto_url: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const url = await uploadAutoPhoto(file, "temp");
    if (url) setForm({ ...form, foto_url: url });
    setUploadingPhoto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        owner_id: userId,
        marca: form.marca,
        modelo: form.modelo,
        año: form.año,
        placa: form.placa,
        kilometraje: form.kilometraje,
        color: form.color || null,
        vin: form.vin || null,
        foto_url: form.foto_url || null,
        estado: "activo",
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Error al guardar: " + error.message);
      return;
    }

    if (data) {
      localStorage.setItem("blis_current_car", data.id);
      document.cookie = `blis_current_car=${data.id};path=/;max-age=31536000;SameSite=Lax`;
      router.push("/auto/app");
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-400 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Perfil
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Nuevo Vehículo</h1>
        <p className="text-xs text-zinc-400 mt-1">Registra los datos de tu auto</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Marca *</span>
            <input
              required
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Ej: Toyota"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Modelo *</span>
            <input
              required
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="Ej: Corolla"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Año *</span>
            <input
              required
              type="number"
              min={1950}
              max={new Date().getFullYear() + 1}
              value={form.año}
              onChange={(e) => setForm({ ...form, año: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Placa *</span>
            <input
              required
              value={form.placa}
              onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
              placeholder="ABC-123"
              maxLength={10}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Kilometraje</span>
          <input
            type="number"
            min={0}
            value={form.kilometraje}
            onChange={(e) => setForm({ ...form, kilometraje: parseInt(e.target.value) || 0 })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">Color</span>
            <input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              placeholder="Ej: Rojo"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-400">VIN / Chasis</span>
            <input
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
              placeholder="Opcional"
              maxLength={17}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-400">Foto del vehículo</span>
          <div className="flex items-center gap-2 mt-1">
            <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm cursor-pointer hover:bg-white/5 transition-colors">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-400">{uploadingPhoto ? "Subiendo..." : form.foto_url ? "Foto cargada ✓" : "Seleccionar archivo"}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
            </label>
          </div>
          {form.foto_url && (
            <div className="h-32 mt-1 rounded-xl bg-white/5 overflow-hidden">
              <img src={form.foto_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-auto-600/20"
        >
          {saving ? "Guardando..." : "Guardar vehículo"}
        </button>
      </form>
    </div>
  );
}
