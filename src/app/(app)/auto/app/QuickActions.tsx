"use client";

import Link from "next/link";
import { Fuel, Receipt, Wrench, Siren } from "lucide-react";

const actions = [
  {
    key: "cargar-combustible",
    icon: Fuel,
    label: "Cargar combustible",
    color: "bg-auto-600 text-white shadow-auto-glow",
    href: "/auto/app/bitacora?add=fuel",
  },
  {
    key: "gasto-express",
    icon: Receipt,
    label: "Gasto express",
    color: "bg-white/5 text-zinc-300 border border-white/10",
    href: "/auto/app/bitacora?add=expense",
  },
  {
    key: "mantenimiento",
    icon: Wrench,
    label: "Mantenimiento",
    color: "bg-white/5 text-zinc-300 border border-white/10",
    href: "/auto/app/bitacora?add=maint",
  },
  {
    key: "sos",
    icon: Siren,
    label: "SOS",
    color: "bg-red-600/80 text-white border border-red-500/20",
    href: "/auto/app/guantera",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((action) => (
        <Link
          key={action.key}
          href={action.href}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 hover:bg-white/10 ${action.color}`}
        >
          <action.icon className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-bold leading-tight text-center">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
