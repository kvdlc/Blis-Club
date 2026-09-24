"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Palette, Download, Puzzle, Smile, PanelLeftClose, PanelLeftOpen } from "lucide-react";

type TabKey = "inicio" | "interactivos" | "imprimibles" | "juegos" | "perfil";

const NAV_W_EXPANDED = "15rem";
const NAV_W_COLLAPSED = "4.75rem";

const tabRoutes: Record<TabKey, string> = {
  inicio: "/kids/app",
  interactivos: "/kids/app/interactivos",
  imprimibles: "/kids/app/imprimibles",
  juegos: "/kids/app/juegos",
  perfil: "/kids/app/perfil",
};

function inferTabFromPathname(pathname: string): TabKey {
  if (pathname.startsWith("/kids/app/interactivos")) return "interactivos";
  if (pathname.startsWith("/kids/app/juegos")) return "juegos";
  if (pathname.startsWith("/kids/app/imprimibles")) return "imprimibles";
  if (pathname.startsWith("/kids/app/perfil")) return "perfil";
  if (pathname.startsWith("/kids/app/actividad")) return "interactivos";
  return "inicio";
}

const tabs: { key: TabKey; icon: typeof Home; label: string; short: string }[] = [
  { key: "inicio", icon: Home, label: "Inicio", short: "Inicio" },
  { key: "interactivos", icon: Palette, label: "Interactivos", short: "Interact." },
  { key: "imprimibles", icon: Download, label: "Imprimibles", short: "Imprimir" },
  { key: "juegos", icon: Puzzle, label: "Juegos", short: "Juegos" },
  { key: "perfil", icon: Smile, label: "Mi perfil", short: "Perfil" },
];

function setNavWidth(collapsed: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--kids-nav-w", collapsed ? NAV_W_COLLAPSED : NAV_W_EXPANDED);
}

export default function KidsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = inferTabFromPathname(pathname);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let saved = false;
    try { saved = localStorage.getItem("kids_nav_collapsed") === "1"; } catch { /* ignore */ }
    setCollapsed(saved);
    setNavWidth(saved);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("kids_nav_collapsed", next ? "1" : "0"); } catch { /* ignore */ }
      setNavWidth(next);
      return next;
    });
  };

  const goToTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    router.replace(tabRoutes[tab], { scroll: false });
  };

  const isActive = (tab: TabKey) => activeTab === tab;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 p-3 overflow-y-auto overflow-x-hidden overscroll-contain bg-white/85 backdrop-blur-xl border-r-2 border-orange-100 print:hidden transition-[width] duration-200"
        style={{ width: `var(--kids-nav-w, ${NAV_W_EXPANDED})` }}
      >
        <div className={`flex items-center gap-2 mb-5 ${collapsed ? "flex-col" : "justify-between"} px-1 pt-1`}>
          <button onClick={() => goToTab("inicio")} className="flex items-center gap-2.5 text-left min-w-0" title="Kids Club">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-md">
              <PaletteMark />
            </div>
            {!collapsed && (
              <div className="leading-tight min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-kids-600">Blis Club</p>
                <p className="text-lg font-black text-zinc-800 truncate" style={{ fontFamily: "var(--font-quicksand)" }}>
                  Kids Club
                </p>
              </div>
            )}
          </button>
          <button
            onClick={toggle}
            title={collapsed ? "Expandir menú" : "Comprimir menú"}
            aria-label={collapsed ? "Expandir menú" : "Comprimir menú"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-orange-50 hover:text-kids-600"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {tabs.map((tab) => {
            const active = isActive(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                title={collapsed ? tab.label : undefined}
                className={`flex items-center rounded-2xl text-sm font-extrabold transition-all ${
                  collapsed ? "justify-center h-11 w-full" : "gap-3 px-4 py-3 text-left w-full"
                } ${active ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md" : "text-zinc-500 hover:bg-violet-50"}`}
              >
                <tab.icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.6 : 1.9} />
                {!collapsed && <span className="truncate">{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          {!collapsed ? (
            <p className="px-2 text-[11px] leading-tight text-zinc-400">Espacio seguro para niños</p>
          ) : (
            <div className="mx-auto h-1.5 w-1.5 rounded-full bg-emerald-400" title="Espacio seguro para niños" />
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav — 5 ítems en orden */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 print:hidden">
        <div className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-xl rounded-[1.75rem] shadow-[0_10px_36px_-8px_rgba(249,115,22,0.4)] border-2 border-orange-100 px-1 pt-2 pb-2 flex items-stretch justify-around">
          {tabs.map((tab) => {
            const active = isActive(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => goToTab(tab.key)}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 py-1.5 transition-colors ${
                  active ? "text-violet-600" : "text-zinc-400"
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md" : ""}`}>
                  <tab.icon className="h-5 w-5" strokeWidth={active ? 2.6 : 1.9} />
                </span>
                <span className="max-w-full truncate text-[9px] font-bold leading-none">{tab.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function PaletteMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.5 1.8-1.5H16a6 6 0 0 0 6-6c0-4.4-4.5-8-10-8z" />
    </svg>
  );
}

