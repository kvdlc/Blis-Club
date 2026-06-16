"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing } from "@/types/database";
import { Trash2, Eye, EyeOff } from "lucide-react";

const catLabels: Record<string, string> = {
  repuestos: "Repuestos", accesorios: "Accesorios", servicios: "Servicios",
  cupones: "Cupones", autos_usados: "Autos Usados",
};

interface Props {
  listings: (MarketplaceListing & { profiles?: { display_name?: string; email?: string; whatsapp?: string } | null })[];
}

export default function MarketplaceAdminClient({ listings: initial }: Props) {
  const [listings, setListings] = useState(initial);

  const toggleActivo = async (listing: typeof listings[0]) => {
    const { error } = await createClient()
      .from("marketplace_listings")
      .update({ activo: !listing.activo })
      .eq("id", listing.id);

    if (!error) {
      setListings(listings.map((l) => (l.id === listing.id ? { ...l, activo: !l.activo } : l)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return;
    await createClient().from("marketplace_listings").delete().eq("id", id);
    setListings(listings.filter((l) => l.id !== id));
  };

  const activos = listings.filter((l) => l.activo).length;
  const inactivos = listings.length - activos;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-800">Marketplace</h1>
        <p className="text-sm text-zinc-500">{activos} activos · {inactivos} inactivos</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Artículo</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Vendedor</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className={`border-b border-zinc-50 ${!l.activo ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-bold text-zinc-800 max-w-[200px] truncate">{l.titulo}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{catLabels[l.categoria] || l.categoria}</td>
                  <td className="px-4 py-3 font-bold text-zinc-800">S/ {l.precio.toLocaleString("es-PE")}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{l.profiles?.display_name || l.whatsapp}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      l.activo ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>{l.activo ? "Activo" : "Oculto"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActivo(l)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          l.activo ? "hover:bg-amber-50 text-zinc-400 hover:text-amber-600" : "hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600"
                        }`}>
                        {l.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(l.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Sin publicaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
