"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle } from "@/types/database";
import { Search, Trash2 } from "lucide-react";

interface Props {
  vehicles: (Vehicle & { profiles?: { display_name?: string; email?: string } | null })[];
  searchQ: string;
}

export default function VehiculosClient({ vehicles: initial, searchQ }: Props) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initial);
  const [q, setQ] = useState(searchQ);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(`/superadmin/vehiculos?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este vehículo?")) return;
    setLoading(true);
    await createClient().from("vehicles").delete().eq("id", id);
    setVehicles(vehicles.filter((v) => v.id !== id));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-800">Vehículos</h1>
          <p className="text-sm text-zinc-500">{vehicles.length} registrados</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por marca, modelo o placa..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
        </div>
        <button onClick={handleSearch} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold">Buscar</button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Vehículo</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Placa</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Km</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Propietario</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-xs font-black text-zinc-600">
                        {v.marca.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-800">{v.marca} {v.modelo}</p>
                        <p className="text-xs text-zinc-400">{v.año}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-700">{v.placa}</td>
                  <td className="px-4 py-3 text-zinc-600">{v.kilometraje.toLocaleString("es-PE")}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{v.profiles?.display_name || v.profiles?.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      v.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                      v.estado === "en venta" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{v.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(v.id)} disabled={loading}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
