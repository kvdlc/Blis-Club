"use client";

import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";
import { UserPill } from "@/components/UserPill";

export function KidsAppHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4 h-10 print:hidden">
      <button onClick={() => router.push("/kids/app")} className="flex md:hidden items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-kids-glow">
          <Palette className="h-5 w-5" />
        </div>
        <span className="text-base font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
          Kids Club
        </span>
      </button>
      <div className="hidden md:block" />
      <UserPill appSlug="kids" variant="light" />
    </div>
  );
}


