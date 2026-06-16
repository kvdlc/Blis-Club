"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle } from "@/types/database";
import { ArrowLeft, Globe, Shield, Tag, AlertTriangle, Eye, EyeOff, Car } from "lucide-react";

type VehicleEstado = "activo" | "en venta" | "robado" | "vendido";

const estados: { value: VehicleEstado; label: string; desc: string; icon: any; color: string }[] = [
  { value: "activo", label: "Activo", desc: "Vehículo en uso normal. Visible en tu perfil.", icon: Shield, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "en venta", label: "En venta", desc: "Visible públicamente en tu perfil y en Marketplace de Autos Usados.", icon: Tag, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "robado", label: "Robado", desc: "Marca el vehículo como robado. Se mostrará una alerta en el perfil público.", icon: AlertTriangle, color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { value: "vendido", label: "Vendido", desc: "El vehículo ya no te pertenece. Se oculta de tu lista activa.", icon: EyeOff, color: "bg-white/5 text-zinc-400 border-white/10" },
];

export default function PublicVehicleClient({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [estado, setEstado] = useState<VehicleEstado>(vehicle.estado);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("vehicles").update({ estado }).eq("id", vehicle.id);
    setSaving(false);
    router.push("/auto/app/perfil");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Link href="/auto/app/perfil" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-700">
        <ArrowLeft className="w-4 h-4" /> Perfil
      </Link>

      <div>
        <h1 className="text-xl font-extrabold text-zinc-200">Perfil público</h1>
        <p className="text-xs text-zinc-400 mt-1">{vehicle.marca} {vehicle.modelo} · {vehicle.placa}</p>
      </div>

      {/* Vista previa del perfil público */}
      <div className="card-auto-dark rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-auto-500" />
          <h3 className="text-xs font-extrabold text-zinc-300">Vista previa</h3>
          <a href={`/auto/vehiculo/${vehicle.id}`} target="_blank" rel="noopener"
            className="ml-auto text-[10px] font-bold text-auto-500 hover:underline">Ver perfil →</a>
        </div>

        <div className="h-32 bg-white/5 rounded-xl flex items-center justify-center mb-3">
          <Car className="w-10 h-10 text-zinc-400" />
        </div>
        <p className="text-sm font-bold text-zinc-200 text-center">{vehicle.marca} {vehicle.modelo}</p>
        <p className="text-xs text-zinc-500 text-center">{vehicle.año} · {vehicle.kilometraje.toLocaleString("es-PE")} km</p>
        <div className="flex justify-center mt-2">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            estado === "activo" ? "bg-emerald-500/10 text-emerald-400" :
            estado === "en venta" ? "bg-amber-500/10 text-amber-400" :
            estado === "robado" ? "bg-red-500/10 text-red-400" :
            "bg-white/5 text-zinc-400"
          }`}>{estado === "en venta" ? "En venta" : estado === "robado" ? "Robado" : estado === "vendido" ? "Vendido" : "Activo"}</span>
        </div>
      </div>

      {/* Selector de estado */}
      <div className="card-auto-dark rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-300 mb-3">Cambiar estado</h3>
        <div className="space-y-2">
          {estados.map((e) => {
            const Icon = e.icon;
            const selected = estado === e.value;
            return (
              <button
                key={e.value}
                onClick={() => setEstado(e.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selected ? e.color : "border-transparent bg-white/5 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${
                  e.value === "activo" ? "text-emerald-400" :
                  e.value === "en venta" ? "text-amber-400" :
                  e.value === "robado" ? "text-red-400" :
                  "text-zinc-400"
                }`} />
                <div>
                  <p className="text-sm font-bold text-zinc-200">{e.label}</p>
                  <p className="text-[10px] text-zinc-400">{e.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full mt-4 py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-auto-600/20">
          {saving ? "Guardando..." : "Guardar estado"}
        </button>
      </div>
    </div>
  );
}
