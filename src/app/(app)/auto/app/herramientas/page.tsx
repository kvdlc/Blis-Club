import Link from "next/link";
import { Fuel, Gauge, DollarSign, Mountain, Droplets, Scale, ClipboardCheck, Wrench, CreditCard, Car, Route, ArrowRight } from "lucide-react";

const tools = [
  // Row 1: Two big cards
  { slug: "costo-viaje", icon: Route, label: "Costo de viaje", desc: "Estima combustible + peajes para una ruta", size: "large", color: "bg-auto-600/10 border-auto-600/20 text-auto-500" },
  { slug: "rendimiento", icon: Gauge, label: "Comparador de combustible", desc: "Qué octanaje rinde más por tu dinero", size: "large", color: "bg-auto-600/10 border-auto-600/20 text-auto-500" },
  // Row 2: One wide card + two small
  { slug: "autonomia", icon: Fuel, label: "Autonomía del tanque", desc: "Cuántos km recorres con tanque lleno", size: "wide", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  { slug: "presion-altitud", icon: Mountain, label: "Presión por altitud", desc: "Ajusta PSI al viajar", size: "small", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { slug: "consumo-aceite", icon: Droplets, label: "Consumo de aceite", desc: "Desgaste interno del motor", size: "small", color: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  // Row 3: Two medium + one small
  { slug: "depreciacion", icon: Scale, label: "Depreciación", desc: "Proyecta el valor actual de tu vehículo", size: "medium", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  { slug: "equivalencia-llantas", icon: DollarSign, label: "Equivalencia de llantas", desc: "Verifica si el cambio de aros es seguro", size: "medium", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
  { slug: "checklist-previaje", icon: ClipboardCheck, label: "Checklist", desc: "Verifica fluidos, llantas y extintor", size: "small", color: "bg-auto-600/10 border-auto-600/20 text-auto-500" },
  // Row 4: One wide + one small
  { slug: "costo-km-real", icon: Car, label: "Costo por kilómetro real", desc: "Combustible + mantenimiento + depreciación", size: "wide", color: "bg-auto-600/10 border-auto-600/20 text-auto-500" },
  { slug: "financiamiento", icon: CreditCard, label: "Financiamiento", desc: "Calcula la cuota mensual de tu préstamo", size: "small", color: "bg-auto-600/10 border-auto-600/20 text-auto-500" },
];

export default function HerramientasPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 border border-auto-600/20 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-auto-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-100">Herramientas</h1>
          <p className="text-xs text-zinc-500">Calculadoras y utilidades automotrices</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool, i) => {
          const isLarge = tool.size === "large";
          const isWide = tool.size === "wide";
          const isSmall = tool.size === "small";
          const isMedium = tool.size === "medium";
          
          const colSpan = isWide ? "col-span-2" : "col-span-1";
          const height = isLarge ? "h-32" : isWide ? "h-24" : "h-28";
          const padding = isLarge ? "p-5" : "p-4";
          const iconSize = isLarge ? "w-8 h-8" : "w-6 h-6";
          const labelSize = isLarge ? "text-sm" : "text-xs";
          
          return (
            <Link
              key={tool.slug}
              href={`/auto/app/herramientas/${tool.slug}`}
              className={`${colSpan} ${height} ${padding} ${tool.color} card-auto-dark rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-all active:scale-[0.98] group`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center shrink-0`}>
                  <tool.icon className={`${iconSize}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div>
                <p className={`${labelSize} font-bold text-zinc-100 group-hover:text-auto-500 transition-colors`}>{tool.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{tool.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
