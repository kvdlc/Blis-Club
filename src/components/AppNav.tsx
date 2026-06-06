"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, UtensilsCrossed, Activity, User, Dog, Siren } from "lucide-react";

const desktopTabs = [
  { href: "/guau/app/academia", icon: GraduationCap, label: "Academia" },
  { href: "/guau/app/nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { href: "/guau/app", icon: Dog, label: "Inicio", center: true },
  { href: "/guau/app/tracker", icon: Activity, label: "Track" },
  { href: "/guau/app/perdido", icon: Siren, label: "Perdido" },
  { href: "/guau/app/perfil", icon: User, label: "Perfil" },
];

const mobileTabs = [
  { href: "/guau/app/academia", icon: GraduationCap, label: "Academia" },
  { href: "/guau/app/nutricion", icon: UtensilsCrossed, label: "Nutrición" },
  { href: "/guau/app", icon: Dog, label: "Inicio", center: true },
  { href: "/guau/app/tracker", icon: Activity, label: "Track" },
  { href: "/guau/app/perfil", icon: User, label: "Perfil" },
];

export default function AppNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/guau/app") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-100 dark:border-zinc-800/60 p-6 z-40">
        <Link href="/guau/app" prefetch={false} className="flex items-center gap-2.5 px-2 py-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-primary-700 dark:text-primary-300 tracking-tight">Blis Club</span>
        </Link>
        <nav className="flex flex-col gap-1.5 flex-1">
          {desktopTabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-zinc-100 dark:border-zinc-800/60 px-3 py-2 flex items-center justify-around h-16">
          {mobileTabs.map((tab) => {
            const active = isActive(tab.href);
            const isCenter = tab.center;

            if (isCenter) {
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  prefetch={false}
                  className="relative -mt-8 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(89,86,233,0.55)] border-4 border-white dark:border-zinc-950 transition-transform active:scale-95">
                    <tab.icon className="w-7 h-7" strokeWidth={2.2} />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={false}
                className={`flex items-center justify-center rounded-2xl p-3 transition-colors ${
                  active
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <tab.icon className="w-6 h-6" strokeWidth={active ? 2.2 : 1.6} />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
