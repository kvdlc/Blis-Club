"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { MarketplaceListing, MarketplaceProduct, Vehicle } from "@/types/database";
import {
  ShoppingBag, Search, Plus, MapPin, Tag, Heart, Car, Wrench,
  Package, Star, ChevronRight, Columns2, X,
} from "lucide-react";
import { useMoney } from "@/lib/money";
import { MarketplaceHero3D } from "./MarketplaceHero3D";
import { MarketplaceSplash } from "./MarketplaceSplash";
import {
  CategoryGrid, Trending, Featured, DailyDeals, Testimonials, Guides, TrustBar, TrustMarquee,
} from "./MarketplaceSections";
import { Stagger, StaggerItem, Reveal, GlowOrb, ScrollParallax } from "./MarketplaceMotion";
import { ActivityToasts } from "./ActivityToasts";

const vehicleTypes = [
  { key: "todas", label: "Todos", icon: "🚗" },
  { key: "auto", label: "Autos", icon: "🚗" },
  { key: "suv", label: "SUV", icon: "🚙" },
  { key: "pickup", label: "Pickup", icon: "🛻" },
  { key: "moto", label: "Motos", icon: "🏍️" },
  { key: "furgoneta", label: "Furgoneta", icon: "🚐" },
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
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [productCat, setProductCat] = useState("todas");
  const [productSort, setProductSort] = useState("destacados");
  const [autoSort, setAutoSort] = useState("recientes");

  // Autos filtrados por búsqueda
  const autos = useMemo(() => {
    const q = marca.trim().toLowerCase();
    return listings.filter((l) => {
      if (!q) return true;
      return (l.marca || "").toLowerCase().includes(q) || (l.modelo || "").toLowerCase().includes(q) || (l.titulo || "").toLowerCase().includes(q);
    });
  }, [listings, marca]);

  // Productos filtrados y ordenados (cliente)
  const shownProducts = useMemo(() => {
    let list = [...products];
    if (productCat !== "todas") list = list.filter((p) => p.categoria === productCat);
    switch (productSort) {
      case "precioAsc": list.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0)); break;
      case "precioDesc": list.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0)); break;
      case "ventas": list.sort((a, b) => (b.ventas ?? 0) - (a.ventas ?? 0)); break;
      case "nuevos": list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: list.sort((a, b) => Number(b.destacado) - Number(a.destacado));
    }
    return list;
  }, [products, productCat, productSort]);

  // Autos ordenados
  const autosSorted = useMemo(() => {
    const list = [...autos];
    switch (autoSort) {
      case "precioAsc": list.sort((a, b) => a.precio - b.precio); break;
      case "precioDesc": list.sort((a, b) => b.precio - a.precio); break;
      case "anio": list.sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0)); break;
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [autos, autoSort]);

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

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const goCompare = () => {
    if (compareIds.length >= 2) router.push(`/auto/app/marketplace/comparar?ids=${compareIds.join(",")}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (marca.trim()) params.set("marca", marca.trim());
    router.replace(`/auto/app/marketplace?${params.toString()}`);
  };

  return (
    <div className="space-y-6 relative">
      {/* Fondo parallax decorativo fijo */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <ScrollParallax from={-40} to={60}>
          <GlowOrb className="top-1/4 -left-24 bg-auto-600/[0.08]" size={340} float={1.4} />
        </ScrollParallax>
        <ScrollParallax from={80} to={-40}>
          <GlowOrb className="top-2/3 -right-24 bg-violet-600/[0.07]" size={360} float={2} delay={0.6} />
        </ScrollParallax>
        <ScrollParallax from={0} to={120}>
          <GlowOrb className="bottom-10 left-1/3 bg-cyan-500/[0.06]" size={280} float={1} delay={1.2} />
        </ScrollParallax>
      </div>

      {/* Splash de carga de marca */}
      <MarketplaceSplash />

      {/* Toasts de actividad (ficticios) */}
      {products.length > 0 && <ActivityToasts products={products} />}

      {/* Hero 3D */}
      <MarketplaceHero3D />

      {/* Trust badges */}
      <TrustBar />

      {/* Marquee de marcas */}
      <Reveal>
        <TrustMarquee />
      </Reveal>

      {/* Tiendas por categoría */}
      <CategoryGrid products={products} />

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

        {/* Chips tipo de vehículo + orden */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
            {vehicleTypes.map((t) => (
              <button key={t.key} type="button" onClick={() => setTypeFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${typeFilter === t.key ? "bg-auto-600 text-white shadow-md" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <select value={autoSort} onChange={(e) => setAutoSort(e.target.value)}
            className="shrink-0 text-[11px] font-bold px-2.5 py-2 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 focus:outline-none">
            <option value="recientes">Recientes</option>
            <option value="precioAsc">Precio ↑</option>
            <option value="precioDesc">Precio ↓</option>
            <option value="anio">Año</option>
          </select>
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
            <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-2" stagger={0.06}>
              {autosSorted.slice(0, visibleAutos).map((listing) => {
                const r = ratingFor(listing.id);
                const fav = favoritos.has(listing.id);
                return (
                  <StaggerItem key={listing.id}>
                    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} className="relative">
                      <Link href={`/auto/app/marketplace/${listing.slug}`}
                        className="block bg-zinc-900 border border-white/10 shadow-sm rounded-2xl overflow-hidden hover:border-auto-500/30 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] transition-all duration-300 group">
                        <div className="aspect-square bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                          {listing.fotos?.[0] ? (
                            <img src={listing.fotos[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.8 }}
                        animate={fav ? { scale: [1, 1.25, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        onClick={() => toggleFav(listing.id)} aria-label="Favorito"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90">
                        <Heart className={`w-4 h-4 ${fav ? "text-red-500 fill-red-500" : "text-white"}`} />
                      </motion.button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleCompare(listing.id); }}
                        aria-label="Comparar"
                        className={`absolute top-2 left-2 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center text-[9px] font-black transition-colors ${compareIds.includes(listing.id) ? "bg-auto-500 text-white shadow-md shadow-auto-500/30" : "bg-black/50 text-zinc-300 hover:bg-black/70"}`}>
                        <Columns2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </Stagger>
            {autos.length > visibleAutos && (
              <button type="button" onClick={() => setVisibleAutos((v) => v + 6)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-auto-400 hover:bg-white/[0.08] transition-colors">
                Ver más autos ({autos.length - visibleAutos})
              </button>
            )}
            {/* Barra flotante de comparar */}
            <AnimatePresence>
              {compareIds.length > 0 && (
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm"
                >
                  <div className="bg-zinc-900/95 backdrop-blur-xl border border-auto-500/30 rounded-2xl shadow-2xl shadow-auto-600/20 p-3 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {compareIds.map((id) => (
                        <div key={id} className="w-9 h-9 rounded-xl border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center">
                          <Car className="w-4 h-4 text-auto-400" />
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-zinc-100">{compareIds.length}/3 seleccionados</p>
                      <p className="text-[9px] text-zinc-500 truncate">{compareIds.map((id) => autos.find((a) => a.id === id)?.marca).filter(Boolean).join(" · ")}</p>
                    </div>
                    <button onClick={goCompare} disabled={compareIds.length < 2}
                      className="px-4 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-black hover:bg-auto-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Comparar
                    </button>
                    <button onClick={() => setCompareIds([])} aria-label="Limpiar" className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-zinc-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* ── PRODUCTOS / ACCESORIOS (anti admin) ── */}
      <div id="productos" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-black text-zinc-100">Accesorios y repuestos</h2>
            <span className="text-[10px] font-bold text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">{shownProducts.length}</span>
          </div>
          <select value={productSort} onChange={(e) => setProductSort(e.target.value)}
            className="text-[11px] font-bold px-2.5 py-2 rounded-xl bg-zinc-800 border border-white/10 text-zinc-300 focus:outline-none">
            <option value="destacados">Destacados</option>
            <option value="ventas">Más vendidos</option>
            <option value="precioAsc">Precio ↑</option>
            <option value="precioDesc">Precio ↓</option>
            <option value="nuevos">Nuevos</option>
          </select>
        </div>

        {/* Filtro por categoría de producto */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {["todas", "accesorios", "electronica", "confort", "seguridad", "repuestos"].map((c) => (
            <button key={c} type="button" onClick={() => { setProductCat(c); setVisibleProducts(8); }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors capitalize ${productCat === c ? "bg-violet-600 text-white shadow-md" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}>
              {c === "todas" ? "Todos" : productCats[c] || c}
            </button>
          ))}
        </div>

        {shownProducts.length === 0 ? (
          <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-8 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
            <p className="text-sm text-zinc-500">No hay productos con ese filtro.</p>
          </div>
        ) : (
          <>
            <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-2" stagger={0.05}>
              {shownProducts.slice(0, visibleProducts).map((p) => (
                <StaggerItem key={p.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl overflow-hidden hover:border-auto-500/30 hover:shadow-[0_10px_40px_rgba(16,185,129,0.12)] transition-all duration-300"
                  >
                    <Link href={`/auto/app/marketplace/producto/${p.id}`} className="block group">
                      <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                        {p.imagen_url ? (
                          <motion.img src={p.imagen_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-zinc-600" />
                        )}
                        {/* Badges dinámicos */}
                        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start pointer-events-none">
                          {p.destacado && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-auto-600 text-white shadow">TOP</span>
                          )}
                          {((p.precio_original ?? 0) > (p.precio ?? 0) * 1.12) && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white shadow">-{Math.round((1 - (p.precio ?? 0) / (p.precio_original ?? p.precio ?? 1)) * 100)}%</span>
                          )}
                          {(p.ventas ?? 0) >= 30 && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-violet-500 text-white shadow">🔥 Popular</span>
                          )}
                          {(p.stock ?? 99) <= 8 && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white shadow">¡Quedan {p.stock}!</span>
                          )}
                          {new Date(p.created_at).getTime() > Date.now() - 7 * 86400000 && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow">Nuevo</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-zinc-200 line-clamp-2 leading-tight group-hover:text-auto-300">{p.titulo}</p>
                        <p className="text-[9px] text-zinc-500">{p.categoria ? productCats[p.categoria] || p.categoria : "Accesorio"}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</p>
                          {p.precio_original != null && p.precio_original > (p.precio || 0) && (
                            <span className="text-[10px] text-zinc-600 line-through">{money(p.precio_original)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
            {shownProducts.length > visibleProducts && (
              <button type="button" onClick={() => setVisibleProducts((v) => v + 8)}
                className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[11px] font-bold text-violet-300 hover:bg-white/[0.08] transition-colors">
                Ver más productos ({shownProducts.length - visibleProducts})
              </button>
            )}
          </>
        )}
      </div>

      {/* Tendencias + Featured */}
      <div className="grid md:grid-cols-2 gap-4">
        <Trending products={products} />
        <Featured products={products} />
      </div>

      {/* Ofertas del día + temporizador */}
      <DailyDeals products={products} />

      {/* Clientes / testimonios */}
      <Testimonials />

      {/* Guías */}
      <Guides />

      {/* ── Ofertas CTA ── */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-auto-500/25 bg-[linear-gradient(120deg,rgba(16,185,129,0.16),rgba(6,182,212,0.10))] p-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-auto-500/15 blur-3xl" />
          <p className="text-[10px] font-bold text-auto-300 uppercase tracking-wider">Oferta del mes</p>
          <h3 className="text-2xl font-black text-zinc-50 mt-1">Vende tu auto <span className="text-auto-400">hoy</span></h3>
          <p className="text-xs text-zinc-400 mt-1">Publica tu vehículo y llega a compradores reales.</p>
          <Link href="/auto/app/marketplace/publicar" className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl grad-auto text-white text-xs font-bold hover:opacity-95 transition-opacity">
            Vender <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl border border-violet-500/25 bg-[linear-gradient(120deg,rgba(139,92,246,0.16),rgba(6,182,212,0.10))] p-5 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-violet-500/15 blur-3xl" />
          <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Accesorios</p>
          <h3 className="text-2xl font-black text-zinc-50 mt-1">Equipa tu <span className="text-violet-300">máquina</span></h3>
          <p className="text-xs text-zinc-400 mt-1">Explora accesorios y repuestos seleccionados para tu auto.</p>
          <button type="button" onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl grad-cyan text-white text-xs font-bold hover:opacity-95 transition-opacity">
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
        <p className="mt-1">Los accesorios y repuestos son referencias externas (CJ Dropshipping).</p>
      </div>
    </div>
  );
}
