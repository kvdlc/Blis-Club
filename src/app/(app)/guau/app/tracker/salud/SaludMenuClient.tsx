"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  dogName: string;
}

const MENU_ITEMS = [
  { href: "/guau/app/tracker/salud/vacunas", img: "/icons/vacunas.png", label: "Vacunas", color: "bg-primary-100 dark:bg-primary-900" },
  { href: "/guau/app/tracker/salud/visitas", img: "/icons/visitas.png", label: "Visitas al Veterinario", color: "bg-secondary-100 dark:bg-secondary-900" },
  { href: "/guau/app/tracker/salud/medicamentos", img: "/icons/medicamento.png", label: "Medicamentos", color: "bg-warning-100 dark:bg-warning-900" },
  { href: "/guau/app/tracker/salud/peso", img: "/icons/peso.png", label: "Peso", color: "bg-accent-100 dark:bg-accent-900" },
  { href: "/guau/app/tracker/salud/veterinarios", img: "/icons/veterinarios.png", label: "Veterinarios de Confianza", color: "bg-accent-100 dark:bg-accent-900" },
];

export function SaludMenuClient({ dogName }: Props) {
  const router = useRouter();

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/icons/doctor bc.png" alt="Salud" className="w-5 h-5 object-contain" />
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Salud de {dogName}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="card-soft rounded-[1.25rem] p-4 flex flex-col items-center gap-3 text-center transition-all active:scale-[0.97] hover:shadow-md overflow-hidden"
          >
            <div className={`w-20 h-20 rounded-2xl ${item.color} flex items-center justify-center p-3`}>
              <img src={item.img} alt={item.label} className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
