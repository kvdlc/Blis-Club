"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing, MarketplaceProduct, Vehicle } from "@/types/database";
import {
  ShoppingBag, Search, Plus, MapPin, Tag, Heart, Car, Wrench,
  Package, Star, ShieldCheck, BadgeCheck, Truck, Headset, ExternalLink, ChevronRight,
} from "lucide-react";
import { useMoney } from "@/lib/money";
import { MarketplaceHero3D } from "./MarketplaceHero3D";

const vehicleTypes = [
  { key: "todas", label: "Todos", icon: "🚗" },
  { key: "auto", label: "Autos", icon: "🚗" },
  { key: "suv", label: "SUV", icon: "🚙" },
  { key: "pickup", label: "Pickup", icon: "🛻" },
  { key: "moto", label: "Motos", icon: "🏍️" },
  { key: "furgoneta", label: "Furgoneta", icon: "🚐" },
];

const beneficios = [
  { icon: ShieldCheck, label: "Compra segura", desc: "Vehículos verificados" },
  { icon: BadgeCheck, label: "Vendedores reales", desc: "Perfiles de propietarios" },
  { icon: Truck, label: "Envío / entrega", desc: "Coordina directo" },
  { icon: Headset, label: "Soporte", desc: "Te ayudamos" },
];

const productCats: Record<string, string> = {
  accesorios: "Accesorios", repuestos: "Repuestos", electronica: "Electrónica",
  seguridad: "Seguridad", confort: "Confort", otro: "Otro",
};

/** Estrellas simuladas estables por id (decorativas, sin BD de reviews). */
function ratingFor(id: string): { stars: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const stars = 3.5 + (h % 15) / 10; // 3.5 - 4.9
  const count = 10 + (h % 90);
  return { stars: Math.min(5, Math.round(stars * 10) / 10), count };
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3 h-3 ${i <= Math.round(value) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
      ))}
    </div>
  );
}

interface Props {
  userId: string;
  listings: MarketplaceListing[];
  products: MarketplaceProduct[];
  myVehicles: Vehicle[];
}

export default function MarketplaceClient({ userId, listings, products, myVehicles }: Props) {
  const { money } = useMoney();
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [visibleAutos, setVisibleAutos] = useState(6);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [typeFilter, setTypeFilter] = useState("todas");

  // Cargar favoritos del usuario
  useEffect(() => {
    if (!userId) return;
    createClient()
      .from("marketplace_favorites")
      .select("listing_id")
      .eq("user_id", userId)
      .then(({ data }) => {
        setFavoritos(new Set((data as { listing_id: string }[] | null)?.map((f) => f.listing_id) ?? []));
      });
  }, [userId]);

  const toggleFav = async (listingId: string) => {
    if (!userId) return;
    const supabase = createClient();
    const isFav = favoritos.has(listingId);
    setFavoritos((prev) => {
      const n = new Set(prev);
      if (isFav) n.delete(listingId); else n.add(listingId);
      return n;
    });
    if (isFav) await supabase.from("marketplace_favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
    else await supabase.from("marketplace_favorites").insert({ user_id: userId, listing_id: listingId });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (marca.trim()) params.set("marca", marca.trim());
    router.replace(`/auto/app/marketplace?${params.toString()}`);
  };

  const autos = useMemo(() => {
    const q = marca.trim().toLowerCase();
    return listings.filter((l) => {
      if (!q) return true;
      return (l.marca || "").toLowerCase().includes(q) || (l.modelo || "").toLowerCase().includes(q) || (l.titulo || "").toLowerCase().includes(q);
    });
  }, [listings, marca]);

  return (
    <div className="space-y-6">
      {/* Hero 3D */}
      <MarketplaceHero3D />

      {/* Barra de beneficios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {beneficios.map((b) => (
          <motion.div
            key={b.label}
            whileHover={{ y: -2 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-auto-600/10 flex items-center justify-center shrink-0">
              <b.icon className="w-4 h-4 text-auto-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-200 leading-tight">{b.label}</p>
              <p className="text-[9px] text-zinc-500 truncate">{b.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Buscar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text" value={marca} onChange={(e) => setMarca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por marca o modelo de auto..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20"
          />
        </div>
        <button onClick={handleSearch}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-sm font-bold hover:bg-zinc-700 transition-colors">
          Buscar
        </button>
      </div>

      {/* ── AUTOS EN VENTA ── */}
      <div id="autos" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-auto-500" />
            <h2 className="text-lg font-black text-zinc-100">Autos en venta</h2>
            <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{autos.length}</span>
          </div>
          <Link href="/auto/app/marketplace/publicar" className="inline-flex items-center gap-1 text-[11px] font-bold text-auto-400 hover:text-auto-300">
            <Plus className="w-3.5 h-3.5" /> Vender
          </Link>
        </div>

        {/* Chips tipo de vehículo */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {vehicleTypes.map((t) => (
            <button key={t.key} type="button" onClick={() => setTypeFilter(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${typeFilter === t.key ? "bg-auto-600 text-white shadow-md" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {autos.length === 0 ? (
          <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
            <p className="text-sm text-zinc-500">No hay autos en venta todavía.</p>
            <Link href="/auto/app/marketplace/publicar"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold">
              Vender mi vehículo
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {autos.slice(0, visibleAutos).map((listing) => {
                const r = ratingFor(listing.id);
                const fav = favoritos.has(listing.id);
                return (
                  <motion.div key={listing.id} whileHover={{ y: -3 }} className="relative">
                    <Link href={`/auto/app/marketplace/${listing.slug}`}
                      className="block bg-zinc-900 border border-white/10 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                      <div className="h-32 bg-zinc-800 flex items-center justify-center relative">
                        {listing.fotos?.[0] ? (
                          <img src={listing.fotos[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-10 h-10 text-zinc-600" />
                        )}
                        <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-auto-600/90 text-white">
                          {listing.marca || "Auto"}
                        </span>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-zinc-200 line-clamp-1 leading-tight group-hover:text-auto-400">{listing.titulo}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{listing.marca} {listing.modelo}</p>
                        <div className="flex items-center gap-1">
                          <Stars value={r.stars} />
                          <span className="text-[9px] text-zinc-500">({r.count})</span>
                        </div>
                        <p className="text-sm font-black text-auto-500">
                          {listing.precio === 0 ? "Gratis" : money(listing.precio)}
                        </p>
                        {listing.ciudad && (
                          <p className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {listing.ciudad}
                          </p>
                        )}
                      </div>
                    </Link>
                    <button type="button" onClick={() => toggleFav(listing.id)} aria-label="Favorito"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center transition-transform active:scale-90">
                      <Heart className={`w-4 h-4 ${fav ? "text-red-500 fill-red-500" : "text-white"}`} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
            {autos.length > visibleAutos && (
              <button type="button" onClick={() => setVisibleAutos((v) => v + 6)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-auto-400 hover:bg-white/[0.08] transition-colors">
                Ver más autos ({autos.length - visibleAutos})
              </button>
            )}
          </>
        )}
      </div>

      {/* ── PRODUCTOS / ACCESORIOS (anti admin) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-black text-zinc-100">Accesorios y repuestos</h2>
            <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{products.length}</span>
          </div>
          <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1">
            Selección <Tag className="w-3 h-3" />
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
            <p className="text-sm text-zinc-500">Pronto agregaremos accesorios seleccionados.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {products.slice(0, visibleProducts).map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                  className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl overflow-hidden"
                >
                  <div className="h-32 bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-10 h-10 text-zinc-600" />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-bold text-zinc-200 line-clamp-2 leading-tight">{p.titulo}</p>
                    <p className="text-[9px] text-zinc-500">{p.categoria ? productCats[p.categoria] || p.categoria : "Accesorio"}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</p>
                      {p.precio_original != null && p.precio_original > (p.precio || 0) && (
                        <span className="text-[10px] text-zinc-600 line-through">{money(p.precio_original)}</span>
                      )}
                    </div>
                    {p.url_temu && (
                      <a href={p.url_temu} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-bold text-violet-400 hover:text-violet-300">
                        Ver en Temu <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {products.length > visibleProducts && (
              <button type="button" onClick={() => setVisibleProducts((v) => v + 8)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-violet-300 hover:bg-white/[0.08] transition-colors">
                Ver más productos ({products.length - visibleProducts})
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Ofertas CTA ── */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-auto-500/20 bg-gradient-to-br from-auto-600/20 to-transparent p-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-auto-500/10 blur-3xl" />
          <p className="text-[10px] font-bold text-auto-400 uppercase tracking-wider">Oferta del mes</p>
          <h3 className="text-2xl font-black text-zinc-50 mt-1">Vende tu auto <span className="text-auto-400">hoy</span></h3>
          <p className="text-xs text-zinc-400 mt-1">Publica tu vehículo y llega a compradores reales.</p>
          <Link href="/auto/app/marketplace/publicar" className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold hover:bg-auto-500 transition-colors">
            Vender <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 to-transparent p-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-500/10 blur-3xl" />
          <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Accesorios</p>
          <h3 className="text-2xl font-black text-zinc-50 mt-1">Equipa tu <span className="text-violet-400">máquina</span></h3>
          <p className="text-xs text-zinc-400 mt-1">Explora accesorios y repuestos seleccionados para tu auto.</p>
          <button type="button" onClick={() => document.getElementById("autos")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/10 text-zinc-200 text-xs font-bold hover:bg-white/[0.12] transition-colors">
            Explorar <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Newsletter (visual, no funcional por ahora) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zinc-100">Entérate de los mejores autos</h3>
            <p className="text-[11px] text-zinc-500">Recibe ofertas y accesorios destacados.</p>
          </div>
          <div className="flex gap-1.5">
            <input placeholder="tu@correo.com" className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-white/10 bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-auto-600/20" />
            <button type="button" className="px-4 py-2 rounded-xl bg-auto-600 text-white text-xs font-bold hover:bg-auto-500 transition-colors">Suscribirme</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 pt-4 pb-6 text-[10px] text-zinc-600 text-center">
        <p>Blis Club · Marketplace de autos · Compra y vende con seguridad</p>
        <p className="mt-1">Los accesorios y repuestos son referencias externas (Temu).</p>
      </div>
    </div>
  );
}
