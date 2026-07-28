"use client";

import { usePathname } from "next/navigation";
import { UserPill } from "@/components/UserPill";
import { Shield } from "lucide-react";

export function SpartanAppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/Spartan/app" || pathname === "/Spartan/app/";

  return (
    <div className={`flex items-center justify-between mb-4 h-10 relative z-20 ${isHome ? "text-zinc-200" : "text-zinc-900"}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isHome ? "bg-white/10" : "bg-red-600/10"}`}>
          <Shield className={`w-4 h-4 ${isHome ? "text-red-400" : "text-red-600"}`} strokeWidth={2.5} />
        </div>
        <span className={`text-sm font-bold ${isHome ? "text-zinc-300" : "text-zinc-700"}`}>Spartan</span>
      </div>
      <div className="flex items-center gap-2">
        <UserPill appSlug="Spartan" variant={isHome ? "dark" : "light"} />
      </div>
    </div>
  );
}
