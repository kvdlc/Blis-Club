"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Laptop, Smartphone, Headphones, Watch, Tablet, Shirt, Home, Gamepad2,
  TrendingUp, Flame, Star, ShoppingBag, BadgePercent, ArrowRight, Car,
  Quote, ShieldCheck, Truck, BadgeCheck, Headset, PenTool, Zap, Wrench,
} from "lucide-react";
import type { MarketplaceProduct } from "@/types/database";
import { useMoney } from "@/lib/money";

const productCats: Record<string, string> = {
  accesorios: "Accesorios", repuestos: "Repuestos", electronica: "Electrónica",
  seguridad: "Seguridad", confort: "Confort", otro: "Otro",
};

export function ratingFor(id: string): { stars: number; count: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const stars = 3.5 + (h % 15) / 10;
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

/* ─────────── TIENDAS POR CATEGORÍA ─────────── */
const categories = [
  { key: "autos", label: "Autos", icon: Car, color: "text-auto-400" },
  { key: "electronica", label: "Electrónica", icon: Smartphone, color: "text-violet-400" },
  { key: "accesorios", label: "Accesorios", icon: Wrench, color: "text-emerald-400" },
  { key: "confort", label: "Confort", icon: Home, color: "text-sky-400" },
  { key: "seguridad", label: "Seguridad", icon: ShieldCheck, color: "text-amber-400" },
  { key: "repuestos", label: "Repuestos", icon: Zap, color: "text-rose-400" },
];

export function CategoryGrid({ products }: { products: MarketplaceProduct[] }) {
  const counts = useMemo(() => {
    const m: Record<string, number> = { autos: products.length };
    for (const p of products) if (p.categoria) m[p.categoria] = (m[p.categoria] || 0) + 1;
    return m;
  }, [products]);

  return (
    <div className="space-y-3">
      <SectionHeader icon={Laptop} title="Compra por categoría" viewAll />
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {categories.map((c) => (
          <motion.button
            key={c.key}
            type="button"
            whileHover={{ y: -3 }}
            onClick={() => document.getElementById(c.key === "autos" ? "autos" : "productos")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-auto-500/30 hover:bg-white/[0.06] transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${c.color}`}>
              <c.icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-bold text-zinc-200">{c.label}</span>
            <span className="text-[9px] text-zinc-500">{counts[c.key] || 0}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── TENDENCIAS (ranking numerado) ─────────── */
export function Trending({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const top = products.slice(0, 5);
  return (
    <div className="space-y-3">
      <SectionHeader icon={TrendingUp} title="Tendencias" viewAll />
      <div className="space-y-2">
        {top.map((p, i) => {
          const r = ratingFor(p.id);
          return (
            <Link key={p.id} href={`/auto/app/marketplace/producto/${p.id}`}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3 hover:border-auto-500/30 hover:bg-white/[0.06] transition-colors">
              <span className="w-7 h-7 shrink-0 flex items-center justify-center text-lg font-black text-auto-400/70">{String(i + 1).padStart(2, "0")}</span>
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 m-auto text-zinc-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-zinc-200 line-clamp-1">{p.titulo}</p>
                <div className="mt-0.5"><Stars value={r.stars} /></div>
              </div>
              <span className="text-sm font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── PRODUCTOS DESTACADOS ─────────── */
export function Featured({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const featured = products.filter((p) => p.destacado);
  const list = (featured.length ? [...featured, ...products].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i) : products).slice(0, 5);
  return (
    <div className="space-y-3">
      <SectionHeader icon={Flame} title="Elige lo mejor" viewAll />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {list.map((p) => {
          const r = ratingFor(p.id);
          return (
            <Link key={p.id} href={`/auto/app/marketplace/producto/${p.id}`}
              className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-auto-500/30 hover:bg-white/[0.06] transition-colors group">
              <div className="h-24 bg-zinc-800 flex items-center justify-center">
                {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <ShoppingBag className="w-8 h-8 text-zinc-600" />}
              </div>
              <div className="p-2.5 space-y-1">
                <p className="text-[10px] font-bold text-zinc-200 line-clamp-1 leading-tight">{p.titulo}</p>
                <Stars value={r.stars} />
                <p className="text-xs font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── OFERTAS DEL DÍA + TEMPORIZADOR ─────────── */
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

const dealProduct = (products: MarketplaceProduct[]) =>
  products.find((p) => p.destacado) || products[0] || null;

export function DailyDeals({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const { h, m, s } = useCountdown();
  const deal = dealProduct(products);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (!deal) return null;

  const discount = deal.precio_original && deal.precio_original > (deal.precio || 0)
    ? Math.round((1 - (deal.precio || 0) / deal.precio_original) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-auto-500/20 bg-gradient-to-br from-[#0d0d16] to-[#0a0a0c] p-5 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-auto-500/10 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
        <div className="space-y-2 flex-1">
          <p className="text-[10px] font-bold text-auto-400 uppercase tracking-wider flex items-center gap-1.5">
            <BadgePercent className="w-3.5 h-3.5" /> Ofertas del día
          </p>
          <h3 className="text-2xl font-black text-zinc-50 leading-tight">
            {discount > 0 ? `Hasta -${discount}% hoy` : "Descubre la oferta"}
          </h3>
          <p className="text-xs text-zinc-400">Ofertas por tiempo limitado. Nuevo stock, nuevos precios.</p>
          <button type="button"
            onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold hover:bg-auto-500 transition-colors">
            Ver ofertas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Temporizador */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            {[{ v: h, l: "Horas" }, { v: m, l: "Min" }, { v: s, l: "Seg" }].map((x, i) => (
              <div key={i} className="text-center">
                <div className="w-16 py-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <span className="text-3xl font-black tabular-nums text-zinc-50">{pad(x.v)}</span>
                </div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">{x.l}</span>
              </div>
            ))}
          </div>

          {/* Producto de la oferta */}
          <Link href={`/auto/app/marketplace/producto/${deal.id}`} className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-2xl p-3 hover:border-auto-500/30 transition-colors">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
              {deal.imagen_url ? <img src={deal.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 m-auto text-zinc-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-zinc-200 line-clamp-1">{deal.titulo}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-black text-auto-500">{deal.precio != null && deal.precio > 0 ? money(deal.precio) : "—"}</span>
                {discount > 0 && <span className="text-[10px] text-zinc-500 line-through">{money(deal.precio_original!)}</span>}
              </div>
            </div>
            {discount > 0 && (
              <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-500/90 text-white shrink-0">-{discount}%</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────── CLIENTES / TESTIMONIOS ─────────── */
const testimonials = [
  { name: "Daniel V.", text: "Increíble la calidad y el envío. El marketplace es súper rápido y el producto llegó en perfecto estado.", role: "Dueño de auto", color: "from-emerald-500/80 to-auto-600/80" },
  { name: "Sofía M.", text: "El mejor lugar para encontrar accesorios. Todo funciona de maravilla y el soporte responde al instante.", role: "Fanática de la tecnología", color: "from-violet-500/80 to-rose-500/80" },
  { name: "James T.", text: "Gran servicio y precios excelentes con relación calidad-precio. Muy recomendado.", role: "Coleccionista", color: "from-sky-500/80 to-auto-600/80" },
  { name: "Olivia R.", text: "La mejor selección de productos de alta demanda. Sigo comprando cada mes.", role: "Emprendedora", color: "from-amber-500/80 to-rose-500/80" },
];

export function Testimonials() {
  return (
    <div className="space-y-3">
      <SectionHeader icon={Quote} title="Lo que dicen nuestros clientes" viewAll />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">“{t.text}”</p>
            <div className="flex items-center gap-2.5 mt-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black`}>
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100">— {t.name}</p>
                <p className="text-[9px] text-zinc-500">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── GUÍAS / INSIGHTS ─────────── */
const guides = [
  { icon: PenTool, tag: "Guía rápida", title: "¿Cómo elegir tu próximo auto?", desc: "Claves para comprar un usado sin sorpresas." },
  { icon: Zap, tag: "Tips & Tendencias", title: "10 formas de equipar tu auto", desc: "Los accesorios que más se venden esta temporada." },
  { icon: Wrench, tag: "Mantenimiento", title: "¿Qué es un video-revisión y cómo hacerlo?", desc: "Aprende a valorar el estado real del vehículo." },
  { icon: Flame, tag: "Guía rápida", title: "Prepara tu auto para vender más rápido", desc: "Pequeños detalles que elevan el precio de venta." },
];

export function Guides() {
  return (
    <div className="space-y-3">
      <SectionHeader icon={PenTool} title="Guías y consejos" viewAll />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {guides.map((g, i) => (
          <motion.article
            key={g.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 hover:border-auto-500/30 transition-colors"
          >
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-auto-600/15 text-auto-300">
              {g.tag}
            </span>
            <h4 className="mt-2 text-sm font-bold text-zinc-100 leading-tight">{g.title}</h4>
            <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{g.desc}</p>
            <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-auto-400 hover:text-auto-300">
              Leer más <ArrowRight className="w-3 h-3" />
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

/* ─────────── TRUST BADGES ─────────── */
const trusts = [
  { icon: ShieldCheck, label: "Pagos seguros", desc: "100% protegido" },
  { icon: Truck, label: "Envíos rápidos", desc: "En toda la región" },
  { icon: BadgeCheck, label: "Vendedores reales", desc: "Perfiles verificados" },
  { icon: Headset, label: "Soporte humano", desc: "Te acompañamos" },
];

export function TrustBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {trusts.map((t) => (
        <div key={t.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-auto-600/10 flex items-center justify-center shrink-0">
            <t.icon className="w-4 h-4 text-auto-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-zinc-200 leading-tight">{t.label}</p>
            <p className="text-[9px] text-zinc-500 truncate">{t.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────── HEADER DE SECCIÓN ─────────── */
function SectionHeader({ icon: Icon, title, viewAll }: { icon: any; title: string; viewAll?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-auto-500" />
        <h2 className="text-lg font-black text-zinc-100">{title}</h2>
      </div>
      {viewAll && (
        <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1 text-[11px] font-bold text-auto-400 hover:text-auto-300">
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
