"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, getCountryConfig } from "@/lib/countries";
import { useMoney } from "@/lib/money";
import type { Profile, Vehicle } from "@/types/database";
import { User, Plus, Pencil, Trash2, Car } from "lucide-react";

interface Props {
  userId: string;
  profile: Profile | null;
  vehicles: Vehicle[];
}

export default function ProfileClient({ userId, profile, vehicles: initialVehicles }: Props) {
  const router = useRouter();
  const { money } = useMoney();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [editingProfile, setEditingProfile] = useState(false);
  const [form, setForm] = useState({
    display_name: profile?.display_name || "",
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    whatsapp: profile?.whatsapp || "",
    country: profile?.country || "PE",
  });
  const [saving, setSaving] = useState(false);

  const countryConfig = getCountryConfig(form.country);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      display_name: form.display_name,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      whatsapp: form.whatsapp || null,
      country: form.country || null,
      currency: countryConfig.currency,
      fuel_unit: countryConfig.fuelUnit,
    }).eq("id", userId);
    setSaving(false);
    setEditingProfile(false);
    router.refresh();
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    const supabase = createClient();
    await supabase.from("vehicles").delete().eq("id", id);
    setVehicles(vehicles.filter((v) => v.id !== id));
    // Si era el vehículo activo, limpiar
    if (localStorage.getItem("blis_current_car") === id) {
      localStorage.removeItem("blis_current_car");
    }
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center">
          <User className="w-5 h-5 text-auto-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-200">Perfil</h1>
          <p className="text-xs text-zinc-500">{profile?.email}</p>
        </div>
      </div>

      {/* Datos personales */}
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-zinc-300">Datos personales</h3>
          <button onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs font-bold text-auto-500 hover:text-auto-700">
            {editingProfile ? "Cancelar" : "Editar"}
          </button>
        </div>

        {editingProfile ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500">Nombre</span>
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Tu nombre" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-sm bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500">Apellido</span>
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Tu apellido" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-sm bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-bold text-zinc-500">Nombre público</span>
              <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                placeholder="Cómo te verán otros usuarios" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-sm bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500">WhatsApp</span>
                <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="+51 999 888 777" className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-sm bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-zinc-500">País</span>
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full mt-0.5 px-2.5 py-2 rounded-lg border border-white/10 text-sm bg-zinc-800 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-auto-600/20">
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.bandera} {c.nombre}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-lg bg-zinc-800/60 border border-white/5 p-2 flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">Se configurará:</span>
              <span className="text-[10px] font-bold text-zinc-300">Moneda {countryConfig.currency}</span>
              <span className="text-[10px] font-bold text-zinc-300">· Combustible en {countryConfig.fuelUnit === "galon" ? "galón" : "litro"}</span>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="w-full py-2.5 rounded-xl bg-auto-600 text-white text-sm font-bold hover:bg-auto-500 transition-colors disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <InfoRow label="Nombre" value={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"} />
            <InfoRow label="Email" value={profile?.email || "—"} />
            <InfoRow label="WhatsApp" value={profile?.whatsapp || "—"} />
            <InfoRow label="País" value={getCountryConfig(profile?.country).bandera + " " + getCountryConfig(profile?.country).nombre} />
            <InfoRow label="Miembro desde" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-PE") : "—"} />
          </div>
        )}
      </div>

      {/* Vehículos */}
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-zinc-300">Mis vehículos</h3>
          <Link href="/auto/app/perfil/vehiculo/nuevo"
            className="flex items-center gap-1 text-xs font-bold text-auto-500 hover:text-auto-700">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-3">No tienes vehículos registrados.</p>
        ) : (
          <div className="space-y-2">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                    {v.foto_url ? (
                      <img src={v.foto_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Car className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-200 truncate">{v.marca} {v.modelo}</p>
                    <p className="text-[10px] text-zinc-500">{v.año} · {v.placa} · {v.kilometraje.toLocaleString("es-PE")} km</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {v.precio != null && (
                        <span className="text-[10px] font-bold text-auto-400">{money(v.precio)}</span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        v.estado === "activo" ? "bg-emerald-500/10 text-emerald-400" :
                        v.estado === "en venta" ? "bg-amber-500/10 text-amber-400" :
                        v.estado === "robado" ? "bg-red-500/10 text-red-400" :
                        "bg-zinc-800 text-zinc-500"
                      }`}>{v.estado === "robado" ? "robado" : v.estado}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/auto/app/perfil/vehiculo/${v.id}/editar`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-auto-600/10 border border-auto-600/20 text-auto-400 hover:bg-auto-600/20 text-[11px] font-bold transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Link>
                  <button onClick={() => handleDeleteVehicle(v.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-600/10 flex items-center justify-center text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suscripción */}
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
        <h3 className="text-sm font-extrabold text-zinc-300 mb-2">Suscripción</h3>
        <Link href="/auto/app/suscripcion"
          className="flex items-center justify-between bg-zinc-800 rounded-xl p-3 hover:bg-zinc-800 transition-colors">
          <span className="text-xs text-zinc-500">Ver mi plan actual</span>
          <span className="text-xs font-bold text-auto-500">→</span>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className="text-xs font-bold text-zinc-200">{value}</span>
    </div>
  );
}
