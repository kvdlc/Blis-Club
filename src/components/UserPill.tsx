"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, ChevronRight } from "lucide-react";

export function UserPill() {
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

  const name = profile?.first_name || profile?.display_name || "Tutor";

  return (
    <Link href="/guau/app/perfil" className="flex items-center gap-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 pl-2.5 pr-1.5 py-1 transition-all hover:shadow-sm shrink-0">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 max-w-[80px] truncate">
        {name}
      </span>
      <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-600 shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <User className="w-3.5 h-3.5 text-primary-500" />
        )}
      </div>
    </Link>
  );
}
