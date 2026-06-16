"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, ChevronRight } from "lucide-react";

export function UserPill({ appSlug = "guau", variant = "dark" }: { appSlug?: string; variant?: "dark" | "light" }) {
  const [profile, setProfile] = useState<{ display_name?: string; first_name?: string; last_name?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("first_name, last_name, avatar_url").eq("id", user.id).single();
      setProfile(data);
    };
    load();
  }, []);

  const name = profile?.first_name || profile?.display_name || (appSlug === "auto" ? "Conductor" : "Tutor");

  const isDark = variant === "dark";

  return (
    <Link href={`/${appSlug}/app/perfil`} className={`flex items-center gap-2 rounded-full pl-2.5 pr-1.5 py-1 transition-all shrink-0 ${ isDark ? "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10" : "bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50" }`}>
      <span className={`text-xs font-medium max-w-[80px] truncate ${ isDark ? "text-zinc-400" : "text-zinc-600" }`}>
        {name}
      </span>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden border-2 shrink-0 ${ isDark ? "bg-zinc-800 border-white/10" : "bg-zinc-100 border-zinc-200" }`}>
        <img src={profile?.avatar_url || "/icons/user-default.png"} alt="" className="w-full h-full object-cover object-center" />
      </div>
    </Link>
  );
}
