"use client";

import Link from "next/link";
import type { MarketplaceProduct } from "@/types/database";
import { ArrowLeft, Star, ExternalLink, Tag, ShoppingBag, Sparkles } from "lucide-react";
import { useMoney } from "@/lib/money";

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

interface Props {
  product: MarketplaceProduct;
  similares: MarketplaceProduct[];
}

export default function ProductDetailClient({ product, similares }: Props) {
  const { money } = useMoney();
  const r = ratingFor(product.id);
  const desc = product.descripcion || `Producto destacado de ${product.categoria ? productCats[product.categoria] || product.categoria : "autos"}. Calidad y buen precio.`;

  return (
    <div className="space-y-4 pb-10">
      <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-auto-500 hover:text-auto-500 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      {/* Imagen */}
      <div className="rounded-2xl overflow-hidden bg-zinc-800 relative">
        {product.imagen_url ? (
          <img src={product.imagen_url} alt={product.titulo} className="w-full h-64 md:h-80 object-cover" />
        ) : (
          <div className="h-64 md:h-80 flex items-center justify-center"><ShoppingBag className="w-16 h-16 text-zinc-600" /></div>
        )}
        {product.destacado && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/90 text-white shadow">
            <Sparkles className="w-3 h-3" /> Destacado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300">
            <Tag className="w-3 h-3 inline mr-1" />
            {product.categoria ? productCats[product.categoria] || product.categoria : "Producto"}
          </span>
          <span className="text-[10px] text-zinc-500">Envío desde el proveedor</span>
        </div>
        <h1 className="text-xl font-black text-zinc-100 leading-tight">{product.titulo}</h1>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(r.stars) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
            ))}
          </div>
          <span className="text-[11px] text-zinc-500">{r.stars} ({r.count})</span>
        </div>
      </div>

      {/* Precio */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
        {product.precio_original != null && product.precio_original > (product.precio || 0) && (
          <p className="text-sm text-zinc-500 line-through">{money(product.precio_original)}</p>
        )}
        <p className="text-3xl font-black text-auto-500">{product.precio != null && product.precio > 0 ? money(product.precio) : "—"}</p>
        {product.precio_original != null && product.precio_original > (product.precio || 0) && (
          <p className="text-[11px] font-bold text-emerald-400">-{Math.round(((1 - (product.precio || 0) / product.precio_original)) * 100)}% hoy</p>
        )}
      </div>

      {/* Descripción */}
      <div className="bg-zinc-900 border border-white/10 shadow-sm rounded-2xl p-4">
        <h3 className="text-xs font-extrabold text-zinc-300 mb-2">Descripción</h3>
        <p className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap">{desc}</p>
      </div>

      {/* Acciones */}
      {product.url_temu && (
        <a href={product.url_temu} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors shadow-lg shadow-auto-600/20">
          <ExternalLink className="w-5 h-5" /> Ver en el proveedor
        </a>
      )}

      {/* Similares */}
      {similares.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-black text-zinc-100">También te puede gustar</h3>
          <div className="grid grid-cols-2 gap-2">
            {similares.map((s) => (
              <Link key={s.id} href={`/auto/app/marketplace/producto/${s.id}`}
                className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-24 bg-zinc-800 flex items-center justify-center overflow-hidden">
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
