"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketplaceProduct } from "@/types/database";
import {
  ArrowLeft, Star, Tag, ShoppingBag, Sparkles, Play, Heart, BadgeCheck,
  Clock, Flame, Truck, ShieldCheck, PackageCheck, Zap,
} from "lucide-react";
import { useMoney } from "@/lib/money";
import { ProductCheckout } from "./ProductCheckout";
import { createClient } from "@/lib/supabase/client";

const productCats: Record<string, string> = {
  accesorios: "Accesorios", repuestos: "Repuestos", electronica: "Electrónica",
  seguridad: "Seguridad", confort: "Confort", otro: "Otro",
};

function ratingFor(id: string): { stars: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const stars = 3.5 + (h % 15) / 10;
  const count = 10 + (h % 90);
  return { stars: Math.min(5, Math.round(stars * 10) / 10), count };
}

/** Temporizador de urgencia (fin del día). */
function useCountdown() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const diff = Math.max(0, end.getTime() - now.getTime());
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

interface Props {
  product: MarketplaceProduct;
  similares: MarketplaceProduct[];
  userId?: string;
}

export default function ProductDetailClient({ product, similares, userId }: Props) {
  const { money } = useMoney();
  const r = ratingFor(product.id);
  const g = product.galeria || [];
  const stock = Number(product.stock ?? 50);
  const ventas = Number(product.ventas ?? 0);
  const desc = product.descripcion?.trim() || `Producto de la categoría ${product.categoria ? productCats[product.categoria] || product.categoria : "autos"}.`;
  const { h, m, s } = useCountdown();
  const pad = (n: number) => String(n).padStart(2, "0");
  const pctVendido = Math.min(94, Math.round(((ventas) / (ventas + stock)) * 100) || 12);
  const precioBase = product.precio ?? 0;
  const precioOrig = product.precio_original ?? 0;
  const ahorro = precioOrig > precioBase ? precioOrig - precioBase : 0;
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!userId) return;
    createClient().from("product_favorites").select("id").eq("user_id", userId).eq("product_id", product.id).maybeSingle()
      .then(({ data }) => setFav(!!data));
  }, [userId, product.id]);

  const toggleFav = async () => {
    if (!userId) return;
    const supabase = createClient();
    if (fav) {
      setFav(false);
      await supabase.from("product_favorites").delete().eq("user_id", userId).eq("product_id", product.id);
    } else {
      setFav(true);
      await supabase.from("product_favorites").insert({ user_id: userId, product_id: product.id });
    }
  };

  // Galería: video primero + imágenes
  const media: { type: "video" | "img"; src: string }[] = [];
  if (product.video_url) media.push({ type: "video", src: product.video_url });
  if (product.imagen_url && !g.includes(product.imagen_url)) media.push({ type: "img", src: product.imagen_url });
  for (const s of g) if (!media.some((mm) => mm.src === s)) media.push({ type: "img", src: s });
  const [active, setActive] = useState(0);
  const current = media[active] || null;

  const features = useMemo(() => {
    const c = product.categoria || "auto";
    const map: Record<string, string[]> = {
      electronica: ["Conexión estable y rápida", "Fácil instalación", "Compatible con la mayoría de autos", "Calidad de audio/imagen"],
      accesorios: ["Materiales resistentes", "Fácil montaje", "Diseño funcional", "Compatible con autos y motos"],
      confort: ["Mayor comodidad al conducir", "Fácil de instalar", "Materiales suaves", "Ideal para viajes largos"],
      seguridad: ["Protección extra", "Instalación sencilla", "Materiales resistentes", "Uso diario"],
      repuestos: ["Pieza de calidad", "Encaaje preciso", "Resistente al desgaste", "Garantía de compatibilidad"],
    };
    return map[c] || map.accesorios;
  }, [product.categoria]);

  return (
    <div className="space-y-4 pb-10">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      {/* Barra de urgencia superior */}
      <div className="rounded-2xl border border-auto-500/30 bg-gradient-to-r from-auto-600/20 to-amber-500/20 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] font-black text-zinc-100 leading-tight truncate">Oferta por tiempo limitado</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase text-zinc-500">Termina en</span>
            <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-auto-300 font-black tabular-nums text-xs">{pad(h)}</span>:
            <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-auto-300 font-black tabular-nums text-xs">{pad(m)}</span>:
            <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-auto-300 font-black tabular-nums text-xs">{pad(s)}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ── Imagen + galería ── */}
        <div className="space-y-2">
          <div className="rounded-2xl overflow-hidden bg-zinc-800 relative aspect-square">
            {current ? (
              current.type === "video" ? (
                <video src={current.src} className="w-full h-full object-cover" autoPlay muted loop playsInline controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.src} alt={product.titulo} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-16 h-16 text-zinc-600" /></div>
            )}

            {/* Badges de urgencia sobre imagen */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {ahorro > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500 text-white shadow">
                  <Zap className="w-3 h-3" /> -{Math.round((ahorro / precioOrig) * 100)}% HOY
                </span>
              )}
              {product.destacado && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-auto-600/90 text-white shadow">
                  <Sparkles className="w-3 h-3" /> TOP
                </span>
              )}
            </div>
            {stock <= 15 && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/90 text-white shadow">
                <Flame className="w-3 h-3" /> ¡Quedan {stock} uds!
              </span>
            )}
            {current?.type === "video" && (
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur">
                <Play className="w-3 h-3" /> Video
              </span>
            )}
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {media.map((m2, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === active ? "border-auto-500" : "border-transparent opacity-70"}`}>
                  {m2.type === "video" ? (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Play className="w-5 h-5 text-auto-500" /></div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m2.src} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info + checkout ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
              <Tag className="w-3 h-3 inline mr-1" />
              {product.categoria ? productCats[product.categoria] || product.categoria : "Producto"}
            </span>
            <span className="text-[10px] flex items-center gap-1 text-zinc-500"><BadgeCheck className="w-3 h-3 text-auto-400" /> Venta directa Blis Club</span>
            {userId && (
              <button type="button" onClick={toggleFav} aria-label="Favorito"
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${fav ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"}`}>
                <Heart className={`w-3.5 h-3.5 ${fav ? "fill-red-500" : ""}`} /> {fav ? "Guardado" : "Guardar"}
              </button>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-black text-zinc-100 leading-tight">{product.titulo}</h1>

          {/* Estrellas + reviews */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(r.stars) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-zinc-200">{r.stars}</span>
            <span className="text-[11px] text-zinc-500">· {ventas + r.count} compras verificadas</span>
          </div>

          {/* Precio + ahorro */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            {precioOrig > precioBase && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-zinc-500 line-through">{money(precioOrig)}</p>
                <span className="text-[10px] font-bold text-emerald-400">-{Math.round((ahorro / precioOrig) * 100)}% hoy</span>
              </div>
            )}
            <p className="text-3xl font-black text-auto-500">{money(precioBase)}</p>
            <p className="text-[10px] text-zinc-600 flex items-center gap-1"><Truck className="w-3 h-3" /> Envío incluido · Stock {stock} uds</p>
          </div>

          {/* Barra de urgencia por stock */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1.5">
              <span>{ventas} vendidos</span>
              <span>{pctVendido}% del stock</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-auto-500 to-amber-400" style={{ width: `${pctVendido}%` }} />
            </div>
          </div>

          {/* Checkout */}
          <ProductCheckout product={product} />

          {/* Garantías */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: "Envío incluido" },
              { icon: ShieldCheck, label: "Compra segura" },
              { icon: PackageCheck, label: "Garantía" },
            ].map((b) => (
              <div key={b.label} className="bg-zinc-900 border border-white/10 rounded-xl p-2 flex flex-col items-center gap-1 text-center">
                <b.icon className="w-4 h-4 text-auto-400" />
                <span className="text-[9px] font-bold text-zinc-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Descripción + características ── */}
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-300 mb-2">Descripción del producto</h3>
        <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{desc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-[11px] text-zinc-400">
              <div className="w-4 h-4 rounded-full bg-auto-600/20 flex items-center justify-center shrink-0">
                <CheckMark />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Similares */}
      {similares.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-black text-zinc-100">También te puede gustar</h3>
          <div className="grid grid-cols-2 gap-2">
            {similares.map((s) => (
              <Link key={s.id} href={`/auto/app/marketplace/producto/${s.id}`}
                className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {s.imagen_url ? <img src={s.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-8 h-8 text-zinc-600" />}
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-[11px] font-bold text-zinc-200 line-clamp-1">{s.titulo}</p>
                  <p className="text-xs font-black text-auto-500">{s.precio != null && s.precio > 0 ? money(s.precio) : "—"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-auto-400" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
