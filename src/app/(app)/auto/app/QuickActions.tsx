"use client";

import Link from "next/link";
import { Fuel, Receipt, Wrench, Siren } from "lucide-react";

const actions = [
  {
    key: "cargar-combustible",
    icon: Fuel,
    label: "Cargar combustible",
    color: "bg-amber-500 text-white",
    href: "/auto/app/bitacora?add=fuel",
  },
  {
    key: "gasto-express",
    icon: Receipt,
    label: "Gasto express",
    color: "bg-zinc-100 text-zinc-700",
    href: "/auto/app/bitacora?add=expense",
  },
  {
    key: "mantenimiento",
    icon: Wrench,
    label: "Mantenimiento",
    color: "bg-zinc-100 text-zinc-700",
    href: "/auto/app/bitacora?add=maint",
  },
  {
    key: "sos",
    icon: Siren,
    label: "SOS",
    color: "bg-red-600 text-white",
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
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 ${action.color} ${
            action.color.includes("zinc") ? "border border-zinc-200 shadow-sm hover:shadow-md" : "shadow-md"
          }`}
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
