"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { MarketplaceListing } from "@/types/database";
import { ShoppingBag, Search, Plus, MapPin, Tag, ShoppingCart, Wrench, Armchair, Ticket, Car, Package } from "lucide-react";

const categories = [
  { key: "todas", label: "Todas", icon: "🛒" },
  { key: "repuestos", label: "Repuestos", icon: "🔧" },
  { key: "accesorios", label: "Accesorios", icon: "💺" },
  { key: "servicios", label: "Servicios", icon: "🛠️" },
  { key: "cupones", label: "Cupones", icon: "🎫" },
  { key: "autos_usados", label: "Autos Usados", icon: "🚗" },
];

const catIconMap: Record<string, React.ReactNode> = {
  "🛒": <ShoppingCart className="w-3.5 h-3.5" />,
  "🔧": <Wrench className="w-3.5 h-3.5" />,
  "💺": <Armchair className="w-3.5 h-3.5" />,
  "🛠️": <Wrench className="w-3.5 h-3.5" />,
  "🎫": <Ticket className="w-3.5 h-3.5" />,
  "🚗": <Car className="w-3.5 h-3.5" />,
};

interface Props {
  listings: MarketplaceListing[];
  activeCat: string;
  searchMarca: string;
}

export default function MarketplaceClient({ listings, activeCat, searchMarca }: Props) {
  const router = useRouter();
  const [marca, setMarca] = useState(searchMarca);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (marca) params.set("marca", marca);
    if (activeCat !== "todas") params.set("cat", activeCat);
    router.replace(`/auto/app/marketplace?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-auto-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-800">Marketplace</h1>
            <p className="text-xs text-zinc-500">{listings.length} publicaciones</p>
          </div>
        </div>
        <Link
          href="/auto/app/marketplace/publicar"
          className="px-3 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-auto-500 transition-colors shadow-lg shadow-auto-600/20"
        >
          <Plus className="w-3.5 h-3.5" /> Publicar
        </Link>
      </div>

      {/* Categorías */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/auto/app/marketplace${cat.key !== "todas" ? `?cat=${cat.key}` : ""}`}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeCat === cat.key
                ? "bg-auto-600 text-white shadow-md"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            <span>{catIconMap[cat.icon]}</span> {cat.label}
          </Link>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text" value={marca} onChange={(e) => setMarca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por marca o modelo..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
          />
        </div>
        <button onClick={handleSearch}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-500 text-sm font-bold hover:bg-zinc-100 transition-colors">
          Buscar
        </button>
      </div>

      {/* Grid de productos */}
      {listings.length === 0 ? (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-500">No hay publicaciones {activeCat !== "todas" ? "en esta categoría" : "aún"}</p>
          <Link href="/auto/app/marketplace/publicar"
            className="inline-block mt-3 px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold">
            Publicar el primero
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/auto/app/marketplace/${listing.slug}`}
              className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Imagen */}
              <div className="h-32 bg-zinc-100 flex items-center justify-center">
                {listing.fotos?.[0] ? (
                  <img src={listing.fotos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-zinc-500" />
                )}
              </div>

              <div className="p-3 space-y-1.5">
                <p className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-auto-500 transition-colors">
                  {listing.titulo}
                </p>

                <p className="text-sm font-black text-auto-500">
                  {listing.precio === 0 ? "Gratis" : `S/ ${listing.precio.toLocaleString("es-PE")}`}
                </p>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    listing.estado_item === "nuevo" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {listing.estado_item === "nuevo" ? "Nuevo" : "Usado"}
                  </span>
                  {listing.marca && (
                    <span className="text-[9px] text-zinc-500 truncate">{listing.marca}</span>
                  )}
                </div>

                {listing.ciudad && (
                  <p className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {listing.ciudad}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
