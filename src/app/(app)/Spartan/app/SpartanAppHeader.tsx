"use client";

import { UserPill } from "@/components/UserPill";
import { Shield } from "lucide-react";

export function SpartanAppHeader() {
  return (
    <div className="flex items-center justify-between mb-4 h-10 relative z-20 text-zinc-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-spartan-400" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-zinc-300">Spartan</span>
      </div>
      <div className="flex items-center gap-2">
        <UserPill appSlug="Spartan" variant="dark" />
      </div>
    </div>
  );
}
