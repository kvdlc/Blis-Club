"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, UtensilsCrossed, Activity, User } from "lucide-react";

const tabs = [
  { href: "/guau/app/academia", icon: GraduationCap, label: "Academia" },
  { href: "/guau/app/nutricion", icon: UtensilsCrossed, label: "Nutrición" },
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
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4 z-40">
        <Link href="/guau/app" className="flex items-center gap-2 px-3 py-2 mb-8">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Blis Club</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 z-40 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab, i) => {
            const active = isActive(tab.href);
            const isTrack = tab.href === "/guau/app/tracker";
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  isTrack
                    ? "-mt-5 bg-primary-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-primary-600/30"
                    : active
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-zinc-400 dark:text-zinc-600"
                }`}
                style={isTrack ? { minWidth: 56, minHeight: 56 } : { minWidth: 48 }}
              >
                {isTrack ? (
                  <tab.icon className="w-6 h-6" />
                ) : (
                  <>
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{tab.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
