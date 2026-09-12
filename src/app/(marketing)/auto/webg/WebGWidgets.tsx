"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Fuel, Calculator, Store, FileText, Car, Wrench, TrendingUp, Droplet,
  Gauge, Plus, ShoppingCart, MapPin, Share2, Route,
  BadgeCheck, CircleDollarSign, CalendarClock, Sparkles,
} from "lucide-react";
import { AreaTrend } from "@/components/charts/AreaTrend";
import { DonutBreakdown } from "@/components/charts/DonutBreakdown";
import { GaugeRing } from "@/components/charts/GaugeRing";
import { ShareButton } from "@/components/ShareButton";
import { CHART } from "@/lib/chart-theme";

const numCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all";

function Field({
  label, value, onChange, suffix, step = 0.1, min = 0,
}: {
  label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number; min?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-zinc-500">{label}</span>
      <div className="flex items-center gap-1.5 mt-1">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={numCls}
        />
        {suffix && <span className="text-[10px] text-zinc-500 shrink-0">{suffix}</span>}
      </div>
    </label>
  );
}

function WidgetCard({
  icon, title, tag, children, accent = CHART.emerald, className = "",
}: {
  icon: React.ReactNode; title: string; tag?: string; children: React.ReactNode; accent?: string; className?: string;
}) {
  return (
    <div className={`card-auto-dark rounded-3xl p-4 sm:p-5 border border-white/[0.08] ${className}`}>
      <div className="flex items-center gap-2.5 mb-3.5">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}1f`, color: accent, border: `1px solid ${accent}33` }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-zinc-100 leading-none truncate">{title}</p>
          {tag && <p className="text-[10px] text-zinc-500 mt-1">{tag}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ═══════════ 1. Bitácora: registra tu carga ═══════════ */
export function FuelWidget() {
  const [galones, setGalones] = useState(13.5);
  const [monto, setMonto] = useState(43.8);
  const precioGal = galones > 0 ? monto / galones : 0;
  const rend = 12.4;
  const km = Math.round(galones * rend);

  const data = [
    { label: "Mar", value: 3.1 },
    { label: "Abr", value: 3.18 },
    { label: "May", value: 3.22 },
    { label: "Jun", value: 3.19 },
    { label: "Jul", value: 3.26 },
    { label: "Ago", value: Number(precioGal.toFixed(2)) },
  ];

  return (
    <WidgetCard icon={<Fuel className="w-4 h-4" />} title="Registra tu carga" tag="Bitácora · cálculo automático" accent={CHART.cyan}>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Galones" value={galones} onChange={setGalones} suffix="gal" step={0.5} />
        <Field label="Monto pagado" value={monto} onChange={setMonto} suffix="$" step={1} />
      </div>
      <div className="flex items-end justify-between mt-3 mb-1">
        <div>
          <p className="text-[10px] text-zinc-500">Precio por galón</p>
          <p className="text-2xl font-black text-cyan-300 tabular-nums">
            ${precioGal.toFixed(2)}
            <span className="text-xs text-zinc-500 font-bold"> /gal</span>
          </p>
        </div>
        <span className="text-[10px] text-zinc-400 bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
          ≈ {km} km de autonomía
        </span>
      </div>
      <AreaTrend data={data} height={92} suffix="" valueFormat={(v) => `$${v.toFixed(2)}`} />
      <p className="text-[10px] text-zinc-500 mt-1">Precio/galón de tus últimas cargas · el mes actual se calcula en vivo.</p>
    </WidgetCard>
  );
}

/* ═══════════ 2. Calculadora de viaje ═══════════ */
export function TripWidget() {
  const [dist, setDist] = useState(320);
  const [rend, setRend] = useState(12);
  const [precio, setPrecio] = useState(3.24);
  const gal = rend > 0 ? dist / rend : 0;
  const costo = gal * precio;
  const porPersona = costo / 4;

  return (
    <WidgetCard icon={<Calculator className="w-4 h-4" />} title="Calculadora de viaje" tag="1 de 7 calculadoras" accent={CHART.violet}>
      <div className="grid grid-cols-3 gap-2.5">
        <Field label="Distancia" value={dist} onChange={setDist} suffix="km" step={10} />
        <Field label="Rendimiento" value={rend} onChange={setRend} suffix="km/gal" step={0.5} />
        <Field label="Precio" value={precio} onChange={setPrecio} suffix="$/gal" step={0.05} />
      </div>
      <div className="mt-3.5 rounded-2xl grad-auto-soft border border-violet-500/20 p-3.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-zinc-400">Costo estimado del viaje</p>
          <p className="text-3xl font-black text-zinc-50 tabular-nums">${costo.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500">Necesitas</p>
          <p className="text-sm font-bold text-violet-300 tabular-nums">{gal.toFixed(1)} gal</p>
          <p className="text-[10px] text-zinc-500 mt-1">≈ ${porPersona.toFixed(2)} por persona</p>
        </div>
      </div>
    </WidgetCard>
  );
}

/* ═══════════ 3. Control de gastos (gráficos) ═══════════ */
export function ChartsWidget() {
  const data = [
    { label: "Mar", value: 142 },
    { label: "Abr", value: 168 },
    { label: "May", value: 131 },
    { label: "Jun", value: 189 },
    { label: "Jul", value: 154 },
    { label: "Ago", value: 176 },
  ];
  const donut = [
    { name: "Combustible", value: 620, color: CHART.cyan },
    { name: "Mantenimiento", value: 240, color: CHART.violet },
    { name: "Repuestos", value: 160, color: CHART.blue },
    { name: "Trámites", value: 90, color: CHART.emerald },
  ];
  return (
    <WidgetCard icon={<TrendingUp className="w-4 h-4" />} title="Control de gastos" tag="Gráficos y proyecciones" accent={CHART.emerald}>
      <p className="text-[10px] text-zinc-500 mb-1">Gasto mensual</p>
      <AreaTrend data={data} height={110} valueFormat={(v) => `$${v}`} />
      <div className="mt-3 pt-3 border-t border-white/8">
        <p className="text-[10px] text-zinc-500 mb-2">Reparto del año</p>
        <DonutBreakdown data={donut} height={128} centerValue="$1.11k" centerLabel="total" formatValue={(v) => `$${v}`} />
      </div>
    </WidgetCard>
  );
}

/* ═══════════ 4. Documentos al día ═══════════ */
export function DocsWidget() {
  const docs = [
    { name: "SOAT", dias: 25, color: CHART.amber },
    { name: "Revisión técnica", dias: 26, color: CHART.amber },
    { name: "Póliza de seguro", dias: 730, color: CHART.emerald },
  ];
  return (
    <WidgetCard icon={<FileText className="w-4 h-4" />} title="Documentos al día" tag="Alertas de vencimiento" accent={CHART.amber}>
      <div className="flex items-center gap-4">
        <GaugeRing value={72} label="salud" size={104} color={CHART.amber} color2={CHART.emerald} />
        <div className="flex-1 space-y-2">
          {docs.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="text-[11px] text-zinc-300 flex-1 truncate">{d.name}</span>
              <span
                className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-full"
                style={{ color: d.color, background: `${d.color}1f`, border: `1px solid ${d.color}33` }}
              >
                {d.dias >= 365 ? `${Math.round(d.dias / 365)} años` : `${d.dias} días`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-3">Te avisamos antes de que venzan, para que no te multen.</p>
    </WidgetCard>
  );
}

/* ═══════════ 5. Marketplace ═══════════ */
export function MarketplaceWidget() {
  const products = [
    { emoji: "🛢️", name: "Aceite 5W-30 · 4L", price: 28, tag: "Más vendido" },
    { emoji: "🛑", name: "Pastillas de freno", price: 22, tag: "Envío rápido" },
    { emoji: "🔧", name: "Kit de herramientas", price: 35, tag: "Top" },
  ];
  const [cart, setCart] = useState(0);
  const [added, setAdded] = useState<string | null>(null);

  const add = (name: string) => {
    setCart((c) => c + 1);
    setAdded(name);
    setTimeout(() => setAdded(null), 900);
  };

  return (
    <WidgetCard
      icon={<Store className="w-4 h-4" />}
      title="Marketplace"
      tag="Repuestos y accesorios"
      accent={CHART.blue}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-zinc-500">Catálogo verificado</span>
        <motion.span
          key={cart}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded-full px-2.5 py-1"
        >
          <ShoppingCart className="w-3 h-3" /> {cart} en carrito
        </motion.span>
      </div>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/8 p-2.5">
            <span className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-lg shrink-0">
              {p.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-zinc-100 truncate">{p.name}</p>
              <p className="text-[9px] text-zinc-500">{p.tag}</p>
            </div>
            <span className="text-sm font-black text-zinc-100 tabular-nums shrink-0">${p.price}</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => add(p.name)}
              className="w-8 h-8 rounded-xl bg-auto-600 hover:bg-auto-500 text-white flex items-center justify-center shrink-0 transition-colors"
              aria-label={`Agregar ${p.name}`}
            >
              {added === p.name ? <BadgeCheck className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </motion.button>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ═══════════ 6. Comparar autos ═══════════ */
export function CompareWidget() {
  const [a, setA] = useState(78);
  const [b, setB] = useState(54);
  const metrics = [
    { label: "Rendimiento", va: a, vb: b, unit: "km/gal" },
    { label: "Costo mantenimiento", va: 100 - a, vb: 100 - b, unit: "índice" },
    { label: "Valor de reventa", va: 66, vb: 72, unit: "índice" },
  ];
  return (
    <WidgetCard icon={<Car className="w-4 h-4" />} title="Comparar autos" tag="Decide con datos" accent={CHART.emerald}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <p className="text-[10px] text-emerald-300 font-bold">Auto A</p>
          <p className="text-xs font-bold text-zinc-100">Sedán 1.6</p>
        </div>
        <span className="text-[10px] font-black text-zinc-500">VS</span>
        <div className="flex-1 rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-2">
          <p className="text-[10px] text-violet-300 font-bold">Auto B</p>
          <p className="text-xs font-bold text-zinc-100">SUV 2.0</p>
        </div>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-[10px] text-zinc-500 mb-1">{m.label}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden flex justify-end">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.va}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
              </div>
              <span className="w-8 text-[10px] font-bold text-emerald-300 tabular-nums text-right">{m.va}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden flex justify-end">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.vb}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
              </div>
              <span className="w-8 text-[10px] font-bold text-violet-300 tabular-nums text-right">{m.vb}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button type="button" onClick={() => setA((v) => Math.min(100, v + 4))} className="flex-1 text-[10px] font-bold text-zinc-300 bg-white/[0.05] border border-white/10 rounded-xl py-2 hover:bg-white/[0.09] transition-colors">
          Auto A mejor
        </button>
        <button type="button" onClick={() => setB((v) => Math.min(100, v + 4))} className="flex-1 text-[10px] font-bold text-zinc-300 bg-white/[0.05] border border-white/10 rounded-xl py-2 hover:bg-white/[0.09] transition-colors">
          Auto B mejor
        </button>
      </div>
    </WidgetCard>
  );
}

/* ═══════════ 7. ADN del vehículo ═══════════ */
export function SpecsWidget() {
  const specs = [
    { icon: <Droplet className="w-3.5 h-3.5" />, label: "Aceite de motor", value: "5W-30 · 4.5 L", pct: 90, color: CHART.emerald },
    { icon: <Gauge className="w-3.5 h-3.5" />, label: "Refrigerante", value: "Verde · 6.2 L", pct: 74, color: CHART.cyan },
    { icon: <Wrench className="w-3.5 h-3.5" />, label: "Bujías", value: "Iridium · 4 u", pct: 58, color: CHART.violet },
    { icon: <Route className="w-3.5 h-3.5" />, label: "Presión de llantas", value: "32 PSI", pct: 82, color: CHART.blue },
  ];
  return (
    <WidgetCard icon={<Sparkles className="w-4 h-4" />} title="ADN del vehículo" tag="Ficha técnica que no se pierde" accent={CHART.violet}>
      <div className="space-y-3">
        {specs.map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-[11px] text-zinc-300 flex-1">{s.label}</span>
              <span className="text-[10px] font-bold text-zinc-400 tabular-nums">{s.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}99)` }}
              />
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

/* ═══════════ 8. Directorio + compartir ═══════════ */
export function ShareTallerWidget() {
  return (
    <WidgetCard icon={<MapPin className="w-4 h-4" />} title="Directorio de talleres" tag="Guarda, llama y comparte" accent={CHART.cyan}>
      <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl grad-auto flex items-center justify-center text-white text-lg shrink-0">
            <Wrench className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-zinc-100 truncate">Fadicars Automotriz</p>
              <span className="text-[8px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded-full">SOS</span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">Fausto · Mecánico</p>
            <p className="text-[11px] font-bold text-zinc-300 tabular-nums">+593 999 021 810</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex-1 text-center text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2">
            📞 Llamar
          </span>
          <span className="flex-1 text-center text-[10px] font-bold text-green-300 bg-green-500/10 border border-green-500/25 rounded-xl py-2">
            💬 WhatsApp
          </span>
          <ShareButton
            url="/auto/webg"
            title="Blis Club - Fadicars Automotriz"
            text="Mira este taller guardado en Blis Club Auto"
            className="flex-1 text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/25 rounded-xl py-2 flex items-center justify-center gap-1.5"
            label="Compartir"
          />
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1.5">
        <Share2 className="w-3 h-3" /> Cada taller genera un enlace corto con vista previa para WhatsApp.
      </p>
    </WidgetCard>
  );
}

/* ═══════════ Mock de teléfono (hero) ═══════════ */
export function PhoneMock() {
  const data = [
    { label: "L", value: 40 },
    { label: "M", value: 62 },
    { label: "M", value: 48 },
    { label: "J", value: 80 },
    { label: "V", value: 58 },
    { label: "S", value: 92 },
    { label: "D", value: 70 },
  ];
  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]">
      <div className="relative rounded-[2.6rem] border border-white/12 bg-[#080b16] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 rounded-full bg-black/70 z-10" />
        <div className="rounded-[2.1rem] overflow-hidden bg-auto-panel border border-white/[0.06] p-3 space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg grad-auto flex items-center justify-center text-white font-black text-[11px]">B</div>
              <span className="text-[11px] font-extrabold text-zinc-100">Blis Auto</span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>

          {/* Car card */}
          <div className="rounded-2xl grad-auto-soft border border-white/10 p-2.5 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-100 truncate">Shineray SWM G01</p>
              <p className="text-[9px] text-zinc-400">Activo · 42.180 km</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: "Este mes", v: "$176", c: CHART.emerald },
              { l: "Rendimiento", v: "12.4", c: CHART.cyan },
              { l: "Service", v: "25 d", c: CHART.amber },
            ].map((k) => (
              <div key={k.l} className="rounded-xl bg-white/[0.04] border border-white/8 p-2">
                <p className="text-[8px] text-zinc-500">{k.l}</p>
                <p className="text-[13px] font-black tabular-nums" style={{ color: k.c }}>{k.v}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-2.5">
            <p className="text-[9px] text-zinc-500 mb-1">Gasto de la semana</p>
            <AreaTrend data={data} height={72} aurora valueFormat={(v) => `$${v}`} />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { i: <Fuel className="w-4 h-4" />, l: "Carga" },
              { i: <Calculator className="w-4 h-4" />, l: "Calc" },
              { i: <FileText className="w-4 h-4" />, l: "Docs" },
              { i: <Store className="w-4 h-4" />, l: "Tienda" },
            ].map((q) => (
              <div key={q.l} className="rounded-xl bg-white/[0.04] border border-white/8 py-2 flex flex-col items-center gap-1 text-emerald-300">
                {q.i}
                <span className="text-[8px] text-zinc-400">{q.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating badges */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-6 top-16 hidden sm:flex items-center gap-1.5 glass-strong rounded-2xl px-3 py-2 border border-emerald-500/25 shadow-auto-glow"
      >
        <CircleDollarSign className="w-4 h-4 text-emerald-400" />
        <span className="text-[10px] font-bold text-zinc-100">Ahorra $42/mes</span>
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -right-4 bottom-24 hidden sm:flex items-center gap-1.5 glass-strong rounded-2xl px-3 py-2 border border-violet-500/25"
      >
        <CalendarClock className="w-4 h-4 text-violet-300" />
        <span className="text-[10px] font-bold text-zinc-100">SOAT en 25 días</span>
      </motion.div>
    </div>
  );
}

/* ═══════════ Estadísticas animadas ═══════════ */
export function StatFlip({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center rounded-xl bg-black/40 border border-white/10 px-3 py-2 overflow-hidden">
        <span className="text-3xl font-black tabular-nums text-zinc-50">{value}</span>
        {suffix && <span className="text-sm font-bold text-emerald-400 ml-0.5">{suffix}</span>}
      </div>
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1.5 block">{label}</span>
    </div>
  );
}

/* ═══════════ Vista previa del enlace compartido (WhatsApp) ═══════════ */
export function OgPreviewMock() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/12 bg-[#0b1020] shadow-2xl">
        <div className="h-32 sm:h-36 grad-auto relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-black/30 border border-white/20 flex items-center justify-center">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <span className="absolute top-2 left-2 text-[9px] font-bold text-red-200 bg-red-500/30 border border-red-400/40 px-2 py-0.5 rounded-full">SOS · Emergencia</span>
        </div>
        <div className="p-3">
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">www.blis.club</p>
          <p className="text-sm font-extrabold text-zinc-100 mt-0.5">Blis Club - Fadicars Automotriz</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Mecánico · Fausto · Frente al hotel Bronx</p>
        </div>
      </div>
      <p className="text-center text-[10px] text-zinc-500 mt-3">Así se ve tu enlace al compartirlo por WhatsApp.</p>
    </div>
  );
}

/* ═══════════ Código QR del perfil público ═══════════ */
export function QrMock() {
  const N = 21;
  const cells: boolean[] = [];
  const finder = (r: number, c: number, br: number, bc: number) => {
    const dr = r - br, dc = c - bc;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
    const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
    const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return edge || center;
  };
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const f = finder(r, c, 0, 0) ?? finder(r, c, 0, N - 7) ?? finder(r, c, N - 7, 0);
      if (f !== null) { cells.push(f); continue; }
      cells.push((r * 7 + c * 13 + ((r * c) % 5)) % 3 === 0);
    }
  }
  return (
    <div className="flex flex-col items-center">
      <div className="p-3 rounded-2xl bg-white">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${N}, 8px)` }}>
          {cells.map((on, i) => (
            <span key={i} style={{ width: 8, height: 8, background: on ? "#0b1020" : "transparent" }} />
          ))}
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-3 text-center">Escanea y abre el perfil público de tu auto.</p>
    </div>
  );
}

