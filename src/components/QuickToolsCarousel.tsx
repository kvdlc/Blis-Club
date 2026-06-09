"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  isLost?: boolean;
}

const SPA_TABS: Record<string, string> = {
  paseo: "tracker",
  perdido: "perdido",
  comida: "nutricion",
};

const TOOLS = [
  {
    key: "paseo",
    label: "Iniciar Paseo",
    href: "/guau/app/tracker",
    iconType: "svg" as const,
    iconSvg: Play,
    bg: "bg-gradient-to-br from-primary-400 to-primary-600",
    textColor: "text-primary-700 dark:text-primary-300",
    ringColor: "ring-primary-200 dark:ring-primary-800",
  },
  {
    key: "perdido",
    label: "Perro Perdido",
    href: "/guau/app/perdido",
    iconType: "png" as const,
    iconSrc: "/icons/sirena.png",
    bg: "bg-gradient-to-br from-red-400 to-red-600",
    textColor: "text-red-700 dark:text-red-300",
    ringColor: "ring-red-200 dark:ring-red-800",
  },
  {
    key: "comida",
    label: "Registrar Comida",
    href: "/guau/app/nutricion",
    iconType: "png" as const,
    iconSrc: "/icons/comida.png",
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    textColor: "text-orange-700 dark:text-orange-300",
    ringColor: "ring-orange-200 dark:ring-orange-800",
  },
  {
    key: "vacunas",
    label: "Vacunas",
    href: "/guau/app/tracker/salud/vacunas",
    iconType: "png" as const,
    iconSrc: "/icons/vacunas.png",
    bg: "bg-gradient-to-br from-primary-300 to-primary-500",
    textColor: "text-primary-700 dark:text-primary-300",
    ringColor: "ring-primary-200 dark:ring-primary-800",
  },
  {
    key: "peso",
    label: "Peso",
    href: "/guau/app/tracker/salud/peso",
    iconType: "png" as const,
    iconSrc: "/icons/peso.png",
    bg: "bg-gradient-to-br from-accent-300 to-accent-500",
    textColor: "text-accent-700 dark:text-accent-300",
    ringColor: "ring-accent-200 dark:ring-accent-800",
  },
  {
    key: "visitas",
    label: "Visita Vet",
    href: "/guau/app/tracker/salud/visitas",
    iconType: "png" as const,
    iconSrc: "/icons/visitas.png",
    bg: "bg-gradient-to-br from-secondary-300 to-secondary-500",
    textColor: "text-secondary-700 dark:text-secondary-300",
    ringColor: "ring-secondary-200 dark:ring-secondary-800",
  },
  {
    key: "medicamentos",
    label: "Medicamentos",
    href: "/guau/app/tracker/salud/medicamentos",
    iconType: "png" as const,
    iconSrc: "/icons/medicamento.png",
    bg: "bg-gradient-to-br from-warning-300 to-warning-500",
    textColor: "text-warning-700 dark:text-warning-300",
    ringColor: "ring-warning-200 dark:ring-warning-800",
  },
  {
    key: "veterinarios",
    label: "Veterinarios",
    href: "/guau/app/tracker/salud/veterinarios",
    iconType: "png" as const,
    iconSrc: "/icons/veterinarios.png",
    bg: "bg-gradient-to-br from-danger-300 to-danger-500",
    textColor: "text-danger-700 dark:text-danger-300",
    ringColor: "ring-danger-200 dark:ring-danger-800",
  },
  {
    key: "escaner",
    label: "Escáner",
    href: "/guau/app/nutricion?tab=escaner",
    iconType: "png" as const,
    iconSrc: "/icons/scanbar.png",
    bg: "bg-gradient-to-br from-secondary-300 to-secondary-500",
    textColor: "text-secondary-700 dark:text-secondary-300",
    ringColor: "ring-secondary-200 dark:ring-secondary-800",
  },
  {
    key: "agregar",
    label: "Agregar Perro",
    href: "/guau/app/perfil/perro/nuevo",
    iconType: "png" as const,
    iconSrc: "/icons/agregar perro.png",
    bg: "bg-gradient-to-br from-primary-300 to-primary-500",
    textColor: "text-primary-700 dark:text-primary-300",
    ringColor: "ring-primary-200 dark:ring-primary-800",
  },
];

export default function QuickToolsCarousel({ isLost = false }: Props) {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent, tool: typeof TOOLS[0]) => {
    const spaTab = SPA_TABS[tool.key];
    if (spaTab) {
      e.preventDefault();
      const url = spaTab === "inicio" ? "/guau/app" : `/guau/app?tab=${spaTab}`;
      router.replace(url, { scroll: false });
    }
  };

  return (
    <div>
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory md:hidden">
        {TOOLS.map((tool) => {
          const isLostItem = tool.key === "perdido" && isLost;
          const activeBg = isLostItem
            ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30"
            : tool.bg;
          const activeRing = isLostItem
            ? "ring-red-300 dark:ring-red-700"
            : tool.ringColor;

          return (
            <Link
              key={tool.key}
              href={tool.href}
              onClick={(e) => handleClick(e, tool)}
              className={`flex flex-col items-center gap-2 min-w-[72px] snap-start transition-transform active:scale-95`}
            >
              <div
                className={`w-16 h-16 rounded-full ${activeBg} flex items-center justify-center shadow-md ${isLostItem ? "shadow-lg" : ""} ring-2 ${activeRing} ring-offset-2 dark:ring-offset-zinc-950 relative`}
              >
                {tool.iconType === "svg" && tool.iconSvg ? (
                  <tool.iconSvg className="w-7 h-7 text-white fill-white" />
                ) : (
                  <img
                    src={tool.iconSrc}
                    alt={tool.label}
                    className="w-9 h-9 object-contain drop-shadow-sm"
                  />
                )}
                {isLostItem && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-red-500 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold text-center leading-tight ${isLostItem ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"} max-w-[72px]`}
              >
                {tool.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Desktop: grid */}
      <div className="hidden md:grid grid-cols-5 lg:grid-cols-9 gap-4">
        {TOOLS.map((tool) => {
          const isLostItem = tool.key === "perdido" && isLost;
          const activeBg = isLostItem
            ? "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30"
            : tool.bg;
          const activeRing = isLostItem
            ? "ring-red-300 dark:ring-red-700"
            : tool.ringColor;

          return (
            <Link
              key={tool.key}
              href={tool.href}
              onClick={(e) => handleClick(e, tool)}
              className={`flex flex-col items-center gap-2 transition-transform active:scale-95`}
            >
              <div
                className={`w-16 h-16 rounded-full ${activeBg} flex items-center justify-center shadow-md ${isLostItem ? "shadow-lg" : ""} ring-2 ${activeRing} ring-offset-2 dark:ring-offset-zinc-950 relative`}
              >
                {tool.iconType === "svg" && tool.iconSvg ? (
                  <tool.iconSvg className="w-7 h-7 text-white fill-white" />
                ) : (
                  <img
                    src={tool.iconSrc}
                    alt={tool.label}
                    className="w-9 h-9 object-contain drop-shadow-sm"
                  />
                )}
                {isLostItem && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-red-500 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold text-center leading-tight ${isLostItem ? "text-red-600 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"} max-w-[80px]`}
              >
                {tool.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
