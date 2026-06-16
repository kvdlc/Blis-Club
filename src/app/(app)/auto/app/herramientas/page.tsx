import Link from "next/link";
import { Fuel, Gauge, DollarSign, Mountain, Droplets, Scale, ClipboardCheck, Wrench, CreditCard, Car, Route } from "lucide-react";

const tools = [
  { slug: "costo-viaje", icon: Route, label: "Costo de viaje", desc: "Estima combustible + peajes para una ruta" },
  { slug: "rendimiento", icon: Gauge, label: "Comparador de combustible", desc: "Qué octanaje rinde más por tu dinero" },
  { slug: "equivalencia-llantas", icon: DollarSign, label: "Equivalencia de llantas", desc: "Verifica si el cambio de aros es seguro" },
  { slug: "presion-altitud", icon: Mountain, label: "Presión por altitud", desc: "Ajusta PSI al viajar entre costa y sierra" },
  { slug: "consumo-aceite", icon: Droplets, label: "Consumo de aceite", desc: "Mide el desgaste interno del motor" },
  { slug: "depreciacion", icon: Scale, label: "Depreciación", desc: "Proyecta el valor actual de tu vehículo" },
  { slug: "checklist-previaje", icon: ClipboardCheck, label: "Checklist pre-viaje", desc: "Verifica fluidos, llantas y extintor" },
  { slug: "financiamiento", icon: CreditCard, label: "Financiamiento vehicular", desc: "Calcula la cuota mensual de tu préstamo" },
  { slug: "costo-km-real", icon: Car, label: "Costo por kilómetro real", desc: "Combustible + mantenimiento + depreciación" },
  { slug: "autonomia", icon: Fuel, label: "Autonomía del tanque", desc: "Cuántos km recorres con tanque lleno" },
];

export default function HerramientasPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-auto-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-200">Herramientas</h1>
          <p className="text-xs text-zinc-500">Calculadoras y utilidades automotrices</p>
        </div>
      </div>

      <div className="grid gap-2">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/auto/app/herramientas/${tool.slug}`}
            className="card-auto-dark rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-auto-600/10 flex items-center justify-center shrink-0">
              <tool.icon className="w-5 h-5 text-auto-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-200">{tool.label}</p>
              <p className="text-xs text-zinc-500 truncate">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
