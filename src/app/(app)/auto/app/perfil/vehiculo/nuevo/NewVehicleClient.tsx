"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadAutoPhoto } from "@/lib/storage";
import {
  searchMakes, searchModels, getModelSpecs,
  catalogSpecToVehicleSpecs,
} from "@/lib/catalog";
import type { CatalogMake, CatalogModel, CatalogSpec, VehicleType } from "@/types/database";
import { ArrowLeft, Upload, Check, Database, Search } from "lucide-react";
import Link from "next/link";

interface Props {
  userId: string;
}

const TIPO_LABELS: Record<VehicleType, string> = {
  auto: "Auto",
  suv: "SUV",
  pickup: "Pickup / Camioneta",
  moto: "Moto",
  furgoneta: "Furgoneta / Utilitario",
};

export default function NewVehicleClient({ userId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Catálogo
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [specs, setSpecs] = useState<CatalogSpec[]>([]);
  const [marcaId, setMarcaId] = useState("");
  const [modeloId, setModeloId] = useState("");
  const [specId, setSpecId] = useState("");

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    placa: "",
    kilometraje: 0,
    color: "",
    vin: "",
    foto_url: "",
    tipo_vehiculo: "auto" as VehicleType,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    searchMakes("").then((m) => setMakes(m));
  }, []);

  useEffect(() => {
    if (!marcaId) { setModels([]); setSpecs([]); return; }
    searchModels(marcaId, "").then((m) => setModels(m));
    setSpecs([]);
    setModeloId("");
    setSpecId("");
  }, [marcaId]);

  useEffect(() => {
    if (!modeloId) { setSpecs([]); return; }
    getModelSpecs(modeloId).then((s) => setSpecs(s));
    setSpecId("");
  }, [modeloId]);

  const selectedSpec = specs.find((s) => s.id === specId) || null;

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
        tipo_vehiculo: form.tipo_vehiculo,
        catalog_spec_id: specId || null,
      })
      .select()
      .single();

    if (error) {
      setSaving(false);
      alert("Error al guardar: " + error.message);
      return;
    }

    if (data) {
      // Auto-llenar specs desde el catálogo si se eligió versión
      if (selectedSpec) {
        await supabase.from("vehicle_specs").upsert({
          vehicle_id: data.id,
          ...catalogSpecToVehicleSpecs(selectedSpec),
        });
      }

      localStorage.setItem("blis_current_car", data.id);
      document.cookie = `blis_current_car=${data.id};path=/;max-age=31536000;SameSite=Lax`;
      router.push("/auto/app");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Perfil
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Nuevo Vehículo</h1>
        <p className="text-xs text-zinc-500 mt-1">Elige de nuestro catálogo o registra uno manual</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ── Selector de catálogo ── */}
        <div className="card-auto-dark rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-auto-400" />
              <span className="text-xs font-bold text-zinc-300">Catálogo de vehículos</span>
            </div>
            {(() => {
              const mk = makes.find((x) => x.id === marcaId);
              return mk?.logo_url ? (
                <img src={mk.logo_url} alt={mk.nombre} className="h-5 w-auto max-w-[72px] object-contain bg-white/5 rounded px-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : null;
            })()}
          </div>

          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Marca</span>
            <select
              value={marcaId}
              onChange={(e) => {
                const id = e.target.value;
                setMarcaId(id);
                if (id) {
                  const m = makes.find((x) => x.id === id);
                  setForm({ ...form, marca: m?.nombre || "" });
                } else {
                  setForm({ ...form, marca: "" });
                }
              }}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            >
              <option value="">Escribir marca manualmente...</option>
              {makes.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </label>

          {marcaId && (
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">Modelo</span>
              <select
                value={modeloId}
                onChange={(e) => {
                  const id = e.target.value;
                  setModeloId(id);
                  if (id) {
                    const m = models.find((x) => x.id === id);
                    setForm({ ...form, modelo: m?.nombre || "", tipo_vehiculo: m?.tipo_vehiculo || "auto" });
                  } else {
                    setForm({ ...form, modelo: "" });
                  }
                }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
              >
                <option value="">Escribir modelo manualmente...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </label>
          )}

          {modeloId && specs.length > 0 && (
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">Versión (año · motor · combustible)</span>
              <select
                value={specId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSpecId(id);
                  if (id) {
                    const s = specs.find((x) => x.id === id);
                    if (s?.año) setForm({ ...form, año: s.año });
                  }
                }}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
              >
                <option value="">Versión propia (sin specs automáticas)</option>
                {specs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.año || "—"} · {s.motor_nombre || "N/D"} · {s.tipo_combustible}
                  </option>
                ))}
              </select>
            </label>
          )}

          {selectedSpec && (
            <div className="rounded-xl bg-auto-600/10 border border-auto-600/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-zinc-300">Specs automáticas detectadas</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-zinc-400">
                {(selectedSpec.tipo_combustible === "electrico" || selectedSpec.tipo_combustible === "hibrido") && (
                  <>
                    {selectedSpec.bateria_kwh && <span>Batería: {selectedSpec.bateria_kwh} kWh</span>}
                    {selectedSpec.autonomia_km && <span>Autonomía: {selectedSpec.autonomia_km} km</span>}
                  </>
                )}
                {selectedSpec.capacidad_tanque_l && <span>Tanque: {selectedSpec.capacidad_tanque_l} L</span>}
                {selectedSpec.aceite_viscosidad && <span>Aceite: {selectedSpec.aceite_viscosidad}</span>}
                {selectedSpec.psi_delante && <span>PSI delante: {selectedSpec.psi_delante}</span>}
                {selectedSpec.psi_atras && <span>PSI atrás: {selectedSpec.psi_atras}</span>}
                {selectedSpec.octanaje_sugerido && <span>Octanaje: {selectedSpec.octanaje_sugerido}</span>}
                {selectedSpec.freno_tipo && <span>Freno: {selectedSpec.freno_tipo}</span>}
              </div>
              <p className="text-[9px] text-zinc-500 mt-2">Podrás ajustar estos valores luego en el ADN del vehículo.</p>
            </div>
          )}
        </div>

        {/* ── Campos libres ── */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Marca *</span>
            <input
              required
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Ej: Toyota"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Modelo *</span>
            <input
              required
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="Ej: Corolla"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Año *</span>
            <input
              required
              type="number"
              min={1950}
              max={new Date().getFullYear() + 1}
              value={form.año}
              onChange={(e) => setForm({ ...form, año: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Placa *</span>
            <input
              required
              value={form.placa}
              onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })}
              placeholder="ABC-123"
              maxLength={10}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Tipo de vehículo</span>
            <select
              value={form.tipo_vehiculo}
              onChange={(e) => setForm({ ...form, tipo_vehiculo: e.target.value as VehicleType })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            >
              {(Object.keys(TIPO_LABELS) as VehicleType[]).map((t) => (
                <option key={t} value={t}>{TIPO_LABELS[t]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Kilometraje</span>
            <input
              type="number"
              min={0}
              value={form.kilometraje}
              onChange={(e) => setForm({ ...form, kilometraje: parseInt(e.target.value) || 0 })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Color</span>
            <input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              placeholder="Ej: Rojo"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">VIN / Chasis</span>
            <input
              value={form.vin}
              onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
              placeholder="Opcional"
              maxLength={17}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-auto-600/20"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-bold text-zinc-500">Foto del vehículo</span>
          <div className="flex items-center gap-2 mt-1">
            <label className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm cursor-pointer hover:bg-zinc-800 transition-colors">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-500">{uploadingPhoto ? "Subiendo..." : form.foto_url ? <>Foto cargada <Check className="w-3.5 h-3.5 inline text-emerald-400" /></> : "Seleccionar archivo"}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
            </label>
          </div>
          {form.foto_url && (
            <div className="h-32 mt-1 rounded-xl bg-zinc-800 overflow-hidden">
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
