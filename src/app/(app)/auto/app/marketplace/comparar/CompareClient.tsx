"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Car, MapPin, Calendar, Gauge, Fuel, Cog, Star, Check, X as XIcon } from "lucide-react";
import type { MarketplaceListing } from "@/types/database";
import { useMoney } from "@/lib/money";

const catLabel: Record<string, string> = {
  autos_usados: "Autos usados", repuestos: "Repuestos", accesorios: "Accesorios",
  servicios: "Servicios", cupones: "Cupones",
};

export default function CompareClient({ autos }: { autos: MarketplaceListing[] }) {
  const { money } = useMoney();
  if (!autos.length) return null;

  const row = (label: string, values: (string | number | null | undefined)[]) => (
    <div className="grid items-center border-t border-white/5 py-3" style={{ gridTemplateColumns: `110px repeat(${autos.length}, 1fr)` }}>
      <div className="text-[11px] font-bold text-zinc-500 px-2">{label}</div>
      {values.map((v, i) => (
        <div key={i} className="text-center text-xs font-bold text-zinc-200 px-1">{v ?? "—"}</div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 pb-10">
      <Link href="/auto/app/marketplace#autos" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div className="flex items-center gap-2">
        <Car className="w-5 h-5 text-auto-400" />
        <h1 className="text-xl font-black text-zinc-100">Comparar autos</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        {/* Cabecera: foto + nombre */}
        <div className="grid items-end" style={{ gridTemplateColumns: `110px repeat(${autos.length}, 1fr)` }}>
          <div />
          {autos.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-2 text-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-800 relative">
                {a.fotos?.[0] ? <img src={a.fotos[0]} alt="" className="w-full h-full object-cover" /> : <Car className="w-10 h-10 m-auto text-zinc-600" />}
              </div>
              <p className="mt-2 text-xs font-black text-zinc-100 leading-tight line-clamp-2">{a.titulo}</p>
              <p className="mt-1 text-sm font-black text-auto-500">{money(a.precio)}</p>
              <Link href={`/auto/app/marketplace/${a.slug}`} className="inline-block mt-1.5 text-[10px] font-bold text-auto-400 hover:text-auto-300">Ver detalle</Link>
            </motion.div>
          ))}
        </div>

        {row("Marca", autos.map((a) => a.marca))}
        {row("Modelo", autos.map((a) => a.modelo))}
        {row("Año", autos.map((a) => a.anio))}
        {row("Kilometraje", autos.map((a) => a.kilometraje ? `${a.kilometraje.toLocaleString("es-PE")} km` : null))}
        {row("Combustible", autos.map((a) => a.combustible ? a.combustible[0].toUpperCase() + a.combustible.slice(1) : null))}
        {row("Transmisión", autos.map((a) => a.transmision ? a.transmision[0].toUpperCase() + a.transmision.slice(1) : null))}
        {row("Ciudad", autos.map((a) => a.ciudad))}
        {row("Categoría", autos.map((a) => catLabel[a.categoria] || a.categoria))}

        {/* Íconos resumen */}
        <div className="grid border-t border-white/5 py-3" style={{ gridTemplateColumns: `110px repeat(${autos.length}, 1fr)` }}>
          <div className="px-2" />
          {autos.map((a, i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-[9px] text-zinc-500">
              <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-auto-400" /> {a.anio || "—"}</div>
              <div className="flex items-center gap-1"><Gauge className="w-3 h-3 text-auto-400" /> {a.kilometraje?.toLocaleString("es-PE") || "—"} km</div>
              <div className="flex items-center gap-1"><Fuel className="w-3 h-3 text-auto-400" /> {a.combustible || "—"}</div>
              <div className="flex items-center gap-1"><Cog className="w-3 h-3 text-auto-400" /> {a.transmision || "—"}</div>
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-auto-400" /> {a.ciudad || "—"}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Nota sobre specs */}
      <p className="text-[10px] text-zinc-600 text-center">Compara hasta 3 autos para decidir mejor. Datos orientativos del vendedor.</p>
    </div>
  );
}
