"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { GraduationCap, UtensilsCrossed, Activity, User, Dog, Siren } from "lucide-react";

type TabKey = "inicio" | "nutricion" | "academia" | "tracker" | "perdido" | "perfil";

function inferTabFromPathname(pathname: string): TabKey | null {
  if (pathname.startsWith("/guau/app/nutricion")) return "nutricion";
  if (pathname.startsWith("/guau/app/perfil")) return "perfil";
  if (pathname.startsWith("/guau/app/academia")) return "academia";
  if (pathname.startsWith("/guau/app/tracker")) return "tracker";
  if (pathname.startsWith("/guau/app/perdido")) return "perdido";
  return null;
}

const desktopTabs: { key: TabKey; icon: any; label: string; center?: boolean }[] = [
  { key: "academia", icon: GraduationCap, label: "Academia" },
  { key: "nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { key: "inicio", icon: Dog, label: "Inicio", center: true },
  { key: "tracker", icon: Activity, label: "Track" },
  { key: "perdido", icon: Siren, label: "Perdido" },
  { key: "perfil", icon: User, label: "Perfil" },
];

const mobileTabs: { key: TabKey; icon: any; label: string; center?: boolean }[] = [
  { key: "academia", icon: GraduationCap, label: "Academia" },
  { key: "nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { key: "inicio", icon: Dog, label: "Inicio", center: true },
  { key: "tracker", icon: Activity, label: "Track" },
  { key: "perfil", icon: User, label: "Perfil" },
];

export default function AppNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Derive tab from URL if on dashboard, else from pathname (sub-page context)
  const urlTab = (searchParams.get("tab") as TabKey) || "inicio";
  const inferredTab = pathname === "/guau/app" ? urlTab : (inferTabFromPathname(pathname) || "inicio");

  const [activeTab, setActiveTab] = useState<TabKey>(inferredTab);

  // Keep activeTab in sync when navigating (e.g. browser back/forward)
  useEffect(() => {
    setActiveTab(inferredTab);
  }, [inferredTab]);

  const goToTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    setActiveTab(tab);

    // Si estamos en una ruta profunda (no en el dashboard), navegar completo
    if (pathname !== "/guau/app") {
      const url = tab === "inicio" ? "/guau/app" : `/guau/app?tab=${tab}`;
      router.push(url);
      return;
    }

    // En el dashboard: cambio instantáneo sin navegación
    if ((window as any).__blisSetTab) {
      (window as any).__blisSetTab(tab);
    }
  };

  const isActive = (tab: TabKey) => activeTab === tab;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-100 dark:border-zinc-800/60 p-6 z-40">
        <button onClick={() => goToTab("inicio")} className="flex items-center gap-2.5 px-2 py-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-primary-700 dark:text-primary-300 tracking-tight">Blis Club</span>
        </button>
        <nav className="flex flex-col gap-1.5 flex-1">
          {desktopTabs.map((tab) => {
            const active = isActive(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left w-full ${
                  active
                    ? "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
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
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-zinc-100 dark:border-zinc-800/60 px-3 py-2 flex items-center justify-around h-16">
          {mobileTabs.map((tab) => {
            const active = isActive(tab.key);
            if (tab.center) {
              return (
                <button key={tab.key} onClick={() => goToTab("inicio")}
                  className="relative -mt-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(89,86,233,0.55)] border-4 border-white dark:border-zinc-950 transition-transform active:scale-95">
                    <tab.icon className="w-7 h-7" strokeWidth={2.2} />
                  </div>
                </button>
              );
            }
            return (
              <button key={tab.key} onClick={() => goToTab(tab.key)}
                className={`flex items-center justify-center rounded-2xl p-3 transition-colors ${
                  active ? "text-primary-600 dark:text-primary-400" : "text-zinc-400 dark:text-zinc-500"
                }`}>
                <tab.icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.6} />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
