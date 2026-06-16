"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, ChevronRight } from "lucide-react";

export function UserPill({ appSlug = "guau" }: { appSlug?: string }) {
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

  return (
    <Link href={`/${appSlug}/app/perfil`} className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 pl-2.5 pr-1.5 py-1 transition-all hover:shadow-sm shrink-0">
      <span className="text-xs font-medium text-zinc-600 max-w-[80px] truncate">
        {name}
      </span>
      <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center overflow-hidden border-2 border-white shrink-0">
        <img src={profile?.avatar_url || "/icons/user-default.png"} alt="" className="w-full h-full object-cover object-center" />
      </div>
    </Link>
  );
}
