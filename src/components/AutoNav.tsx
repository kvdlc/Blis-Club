"use client";

import { usePathname, useRouter } from "next/navigation";
import { Gauge, ShoppingBag, Wrench, ScrollText, Car } from "lucide-react";

type TabKey = "inicio" | "guantera" | "herramientas" | "bitacora" | "marketplace";

const tabRoutes: Record<TabKey, string> = {
  inicio: "/auto/app",
  guantera: "/auto/app/guantera",
  herramientas: "/auto/app/herramientas",
  bitacora: "/auto/app/bitacora",
  marketplace: "/auto/app/marketplace",
};

function inferTabFromPathname(pathname: string): TabKey {
  if (pathname.startsWith("/auto/app/guantera")) return "guantera";
  if (pathname.startsWith("/auto/app/herramientas")) return "herramientas";
  if (pathname.startsWith("/auto/app/bitacora")) return "bitacora";
  if (pathname.startsWith("/auto/app/marketplace")) return "marketplace";
  return "inicio";
}

const tabs: { key: TabKey; icon: any; label: string }[] = [
  { key: "guantera", icon: ScrollText, label: "Guantera" },
  { key: "herramientas", icon: Wrench, label: "Herramientas" },
  { key: "inicio", icon: Car, label: "Inicio" },
  { key: "bitacora", icon: Gauge, label: "Bitácora" },
  { key: "marketplace", icon: ShoppingBag, label: "Market" },
];

export default function AutoNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = inferTabFromPathname(pathname);

  const goToTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    router.replace(tabRoutes[tab], { scroll: false });
  };

  return (
    <>
      {/* Desktop: dock vertical flotante a la izquierda (estilo móvil) */}
      <aside className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="flex flex-col items-center gap-1 glass-strong backdrop-blur-2xl border border-white/10 rounded-[1.75rem] px-2 py-3 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)]">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                aria-current={active ? "page" : undefined}
                aria-label={tab.label}
                title={tab.label}
                className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  active
                    ? "bg-white/[0.08] text-auto-400"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                {/* Indicador activo */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full grad-auto transition-all duration-300 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  }`}
                  style={{ left: -8 }}
                />
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.7} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="glass-strong backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] border border-white/8 px-3 py-2 flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            if (tab.key === "inicio") {
              return (
                <button
                  key={tab.key}
                  onClick={() => goToTab("inicio")}
                  aria-label={tab.label}
                  className="relative -mt-8 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full grad-auto text-white flex items-center justify-center shadow-glow-auto border-4 border-zinc-950 transition-transform active:scale-95">
                    <tab.icon className="w-7 h-7" strokeWidth={2.2} />
                  </div>
                </button>
              );
            }
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                aria-label={tab.label}
                className={`flex items-center justify-center rounded-2xl p-3 transition-colors ${
                  active ? "text-auto-500" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <tab.icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.6} />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
