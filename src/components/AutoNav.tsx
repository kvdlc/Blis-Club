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

const desktopTabs: { key: TabKey; icon: any; label: string }[] = [
  { key: "guantera", icon: ScrollText, label: "Guantera" },
  { key: "herramientas", icon: Wrench, label: "Herramientas" },
  { key: "inicio", icon: Car, label: "Inicio" },
  { key: "bitacora", icon: Gauge, label: "Bitácora" },
  { key: "marketplace", icon: ShoppingBag, label: "Marketplace" },
];

const mobileTabs: { key: TabKey; icon: any; label: string; center?: boolean }[] = [
  { key: "guantera", icon: ScrollText, label: "Guantera" },
  { key: "herramientas", icon: Wrench, label: "Herramientas" },
  { key: "inicio", icon: Car, label: "Inicio", center: true },
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

  const isActive = (tab: TabKey) => activeTab === tab;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-zinc-950/95 backdrop-blur-2xl border-r border-white/5 p-6 z-40">
        <button onClick={() => goToTab("inicio")} className="flex items-center gap-2.5 px-2 py-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-auto-600 flex items-center justify-center shadow-auto-glow">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-zinc-100 tracking-tight">Blis Club</span>
        </button>
        <nav className="flex flex-col gap-1.5 flex-1">
          {desktopTabs.map((tab) => {
            const active = isActive(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                aria-current={active ? "page" : undefined}
                aria-label={tab.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left w-full ${
                  active ? "bg-auto-600/10 text-auto-500 border border-auto-600/20" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-zinc-200/80 px-3 py-2 flex items-center justify-around h-16">
          {mobileTabs.map((tab) => {
            const active = isActive(tab.key);
            if (tab.center) {
              return (
                <button
                  key={tab.key}
                  onClick={() => goToTab("inicio")}
                  className="relative -mt-8 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-auto-600 text-white flex items-center justify-center shadow-auto-glow border-4 border-zinc-50 transition-transform active:scale-95">
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
                  active ? "text-auto-500" : "text-zinc-500 hover:text-zinc-700"
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
