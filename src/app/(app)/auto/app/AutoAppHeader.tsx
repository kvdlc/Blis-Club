"use client";

import { CarSwitcher } from "@/components/CarSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import { Bell } from "lucide-react";

export function AutoAppHeader() {
  return (
    <div className="flex items-center justify-between mb-4 h-10 relative z-20 text-zinc-300">
      <CarSwitcher variant="dark" />
      <div className="flex items-center gap-2">
        <SearchOverlay variant="dark" />
        <button className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:text-zinc-100 hover:bg-white/10">
          <Bell className="w-4 h-4" />
        </button>
        <UserPill appSlug="auto" variant="dark" />
      </div>
    </div>
  );
}
