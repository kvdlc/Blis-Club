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
import {
  Stagger, StaggerItem, Reveal, TiltCard, GlowOrb, FlipDigit, Marquee,
} from "./MarketplaceMotion";

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
    <div className="relative space-y-3">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-24 bg-auto-600/10 blur-3xl rounded-full pointer-events-none" />
      <Reveal><SectionHeader icon={Laptop} title="Compra por categoría" viewAll /></Reveal>
      <Stagger className="grid grid-cols-3 md:grid-cols-6 gap-2" stagger={0.06}>
        {categories.map((c) => (
          <StaggerItem key={c.key}>
            <motion.button
              type="button"
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById(c.key === "autos" ? "autos" : "productos")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-auto-500/40 hover:bg-white/[0.07] hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition-all duration-300"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3 + (Math.abs(c.key.length % 5)) * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${c.color}`}
              >
                <c.icon className="w-5 h-5" strokeWidth={1.8} />
              </motion.div>
              <span className="text-[10px] font-bold text-zinc-200">{c.label}</span>
              <span className="text-[9px] text-zinc-500">{counts[c.key] || 0}</span>
            </motion.button>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

/* ─────────── TENDENCIAS (ranking numerado) ─────────── */
export function Trending({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const top = products.slice(0, 5);
  return (
    <div className="relative space-y-3">
      <GlowOrb className="-top-6 -right-10 bg-violet-500/10" size={180} />
      <Reveal><SectionHeader icon={TrendingUp} title="Tendencias" viewAll /></Reveal>
      <Stagger className="space-y-2">
        {top.map((p, i) => {
          const r = ratingFor(p.id);
          return (
            <StaggerItem key={p.id}>
              <motion.div whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Link href={`/auto/app/marketplace/producto/${p.id}`}
                  className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3 hover:border-auto-500/40 hover:bg-white/[0.06] hover:shadow-[0_6px_24px_rgba(16,185,129,0.1)] transition-all duration-300 group">
                  <motion.span
                    animate={i === 0 ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-7 h-7 shrink-0 flex items-center justify-center text-lg font-black ${i === 0 ? "text-amber-400" : "text-auto-400/70"}`}
                  >{String(i + 1).padStart(2, "0")}</motion.span>
                  <motion.div whileHover={{ scale: 1.06 }} className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    {p.imagen_url ? <img src={p.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 m-auto text-zinc-600" />}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-auto-300">{p.titulo}</p>
                    <div className="mt-0.5"><Stars value={r.stars} /></div>
                  </div>
                  <span className="text-sm font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</span>
                </Link>
              </motion.div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

/* ─────────── PRODUCTOS DESTACADOS ─────────── */
export function Featured({ products }: { products: MarketplaceProduct[] }) {
  const { money } = useMoney();
  const featured = products.filter((p) => p.destacado);
  const list = (featured.length ? [...featured, ...products].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i) : products).slice(0, 5);
  return (
    <div className="relative space-y-3">
      <GlowOrb className="-bottom-8 -left-10 bg-auto-500/10" size={200} float={1.3} />
      <Reveal><SectionHeader icon={Flame} title="Elige lo mejor" viewAll /></Reveal>
      <Stagger className="grid grid-cols-2 md:grid-cols-5 gap-2" stagger={0.08}>
        {list.map((p) => {
          const r = ratingFor(p.id);
          return (
            <StaggerItem key={p.id}>
              <TiltCard intensity={6}>
                <Link href={`/auto/app/marketplace/producto/${p.id}`}
                  className="block bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-auto-500/40 hover:bg-white/[0.06] hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] transition-all duration-300 group">
                  <div className="aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {p.imagen_url
                      ? <motion.img src={p.imagen_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <ShoppingBag className="w-8 h-8 text-zinc-600" />}
                  </div>
                  <div className="p-2.5 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-200 line-clamp-1 leading-tight">{p.titulo}</p>
                    <Stars value={r.stars} />
                    <p className="text-xs font-black text-auto-500">{p.precio != null && p.precio > 0 ? money(p.precio) : "—"}</p>
                  </div>
                </Link>
              </TiltCard>
            </StaggerItem>
          );
        })}
      </Stagger>
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
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => setT(calc());
    tick();
    const id = setInterval(tick, 1000);
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

  if (!deal) return null;

  const discount = deal.precio_original && deal.precio_original > (deal.precio || 0)
    ? Math.round((1 - (deal.precio || 0) / deal.precio_original) * 100)
    : 0;

  return (
    <Reveal>
      <div className="rounded-2xl border border-auto-500/25 bg-gradient-to-br from-[#0d0d16] to-[#0a0a0c] p-5 relative overflow-hidden">
        <GlowOrb className="-top-16 -right-16 bg-auto-500/15" size={220} float={1.5} />
        <GlowOrb className="-bottom-24 -left-16 bg-violet-500/10" size={240} float={2} delay={0.8} />
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-10%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none"
        />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="space-y-2 flex-1">
            <motion.p animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
              className="text-[10px] font-bold text-auto-400 uppercase tracking-wider flex items-center gap-1.5">
              <BadgePercent className="w-3.5 h-3.5" /> Ofertas del día
            </motion.p>
            <h3 className="text-2xl font-black text-zinc-50 leading-tight">
              {discount > 0 ? `Hasta -${discount}% hoy` : "Descubre la oferta"}
            </h3>
            <p className="text-xs text-zinc-400">Ofertas por tiempo limitado. Nuevo stock, nuevos precios.</p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-auto-600 text-white text-xs font-bold hover:bg-auto-500 transition-colors">
              Ver ofertas <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Temporizador con flip */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <FlipDigit value={h} label="Horas" />
              <FlipDigit value={m} label="Min" />
              <FlipDigit value={s} label="Seg" />
            </div>

            {/* Producto de la oferta */}
            <Link href={`/auto/app/marketplace/producto/${deal.id}`} className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-2xl p-3 hover:border-auto-500/40 hover:shadow-[0_6px_24px_rgba(16,185,129,0.12)] transition-all group">
              <motion.div whileHover={{ scale: 1.06, rotate: 2 }} className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                {deal.imagen_url ? <img src={deal.imagen_url} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 m-auto text-zinc-600" />}
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-zinc-200 line-clamp-1 group-hover:text-auto-300">{deal.titulo}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm font-black text-auto-500">{deal.precio != null && deal.precio > 0 ? money(deal.precio) : "—"}</span>
                  {discount > 0 && <span className="text-[10px] text-zinc-500 line-through">{money(deal.precio_original!)}</span>}
                </div>
              </div>
              {discount > 0 && (
                <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                  className="text-[9px] font-bold px-2 py-1 rounded-full bg-amber-500/90 text-white shrink-0">-{discount}%</motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
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
    <div className="relative space-y-3">
      <GlowOrb className="-top-6 right-1/4 bg-amber-500/5" size={200} />
      <Reveal><SectionHeader icon={Quote} title="Lo que dicen nuestros clientes" viewAll /></Reveal>
      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {testimonials.map((t) => (
          <StaggerItem key={t.name}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-4 hover:border-auto-500/30 hover:bg-white/[0.06] transition-colors group overflow-hidden"
            >
              <div className="absolute -right-6 -top-8 w-24 h-24 rounded-full bg-auto-500/[0.06] blur-2xl group-hover:bg-auto-500/[0.12] transition-all duration-500" />
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => <motion.span key={s} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: s * 0.15 }}><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></motion.span>)}
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">“{t.text}”</p>
              <div className="flex items-center gap-2.5 mt-3">
                <motion.div whileHover={{ scale: 1.1 }} className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black`}>
                  {t.name.charAt(0)}
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-zinc-100">— {t.name}</p>
                  <p className="text-[9px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
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
    <div className="relative space-y-3">
      <GlowOrb className="-bottom-10 right-10 bg-violet-500/10" size={220} float={1.8} />
      <Reveal><SectionHeader icon={PenTool} title="Guías y consejos" viewAll /></Reveal>
      <Stagger className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {guides.map((g) => (
          <StaggerItem key={g.title}>
            <TiltCard intensity={7}>
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 hover:border-auto-500/30 hover:bg-white/[0.06] hover:shadow-[0_10px_30px_rgba(16,185,129,0.1)] transition-all duration-300"
              >
                <motion.span animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-auto-600/15 text-auto-300">
                  <g.icon className="w-3 h-3" /> {g.tag}
                </motion.span>
                <h4 className="mt-2 text-sm font-bold text-zinc-100 leading-tight">{g.title}</h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">{g.desc}</p>
                <Link href="/auto/app/marketplace" className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-auto-400 hover:text-auto-300 group/lnk">
                  Leer más <ArrowRight className="w-3 h-3 group-hover/lnk:translate-x-0.5 transition-transform" />
                </Link>
              </motion.article>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
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
    <Reveal>
      <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {trusts.map((t, i) => (
          <StaggerItem key={t.label}>
            <motion.div
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="h-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 flex items-center gap-2.5 hover:border-auto-500/30 hover:bg-white/[0.06] transition-colors"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                className="w-9 h-9 rounded-xl bg-auto-600/10 flex items-center justify-center shrink-0"
              >
                <t.icon className="w-4 h-4 text-auto-400" />
              </motion.div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-200 leading-tight">{t.label}</p>
                <p className="text-[9px] text-zinc-500 truncate">{t.desc}</p>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </Reveal>
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

/* ─────────── MARQUEE DE MARCAS / CONFIANZA ─────────── */
const marcas = [
  { n: "Toyota", e: "🚗" }, { n: "Honda", e: "🚙" }, { n: "Ford", e: "🛻" }, { n: "Chevrolet", e: "🚙" },
  { n: "Nissan", e: "🚗" }, { n: "Hyundai", e: "🚐" }, { n: "Kia", e: "🚙" }, { n: "Yamaha", e: "🏍️" },
  { n: "BMW", e: "🚗" }, { n: "Mercedes", e: "🚗" }, { n: "Suzuki", e: "🏍️" }, { n: "Mazda", e: "🚗" },
];

export function TrustMarquee() {
  return (
    <Marquee speed={40} items={marcas.map((m, i) => (
      <div key={i} className="flex items-center gap-2 mx-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 whitespace-nowrap">
        <span>{m.e}</span>
        <span className="text-xs font-bold text-zinc-300">{m.n}</span>
      </div>
    ))} />
  );
}
