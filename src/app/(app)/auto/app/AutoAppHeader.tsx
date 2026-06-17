"use client";

import { usePathname } from "next/navigation";
import { CarSwitcher } from "@/components/CarSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import { Bell } from "lucide-react";

export function AutoAppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/auto/app" || pathname === "/auto/app/";

  return (
    <div className={`flex items-center justify-between mb-4 h-10 relative z-20 ${isHome ? "text-zinc-200" : "text-zinc-900"}`}>
      <CarSwitcher variant={isHome ? "dark" : "light"} />
      <div className="flex items-center gap-2">
        <SearchOverlay variant={isHome ? "dark" : "light"} />
        <button
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
            isHome
              ? "bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
              : "bg-white border border-zinc-200 shadow-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <Bell className="w-4 h-4" />
        </button>
        <UserPill appSlug="auto" variant={isHome ? "dark" : "light"} />
      </div>
    </div>
  );
}
