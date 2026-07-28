"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { User, Settings, Save } from "lucide-react";

interface Props {
  userId: string;
  profile: Profile | null;
}

export default function ProfileClient({ userId, profile }: Props) {
  const router = useRouter();
  const [editingProfile, setEditingProfile] = useState(false);
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    display_name: profile?.display_name || "",
    whatsapp: profile?.whatsapp || "",
    country: profile?.country || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      display_name: form.display_name || null,
      whatsapp: form.whatsapp || null,
      country: form.country || null,
    }).eq("id", userId);
    setSaving(false);
    setEditingProfile(false);
    router.refresh();
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-spartan-500/10 border border-spartan-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-spartan-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Perfil</h1>
          <p className="text-xs text-zinc-500">Tu información personal</p>
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spartan-600 to-spartan-800 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(190,11,60,0.3)] shrink-0">
              {(profile?.first_name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">{profile?.first_name ? `${profile.first_name} ${profile?.last_name || ""}` : "Usuario Spartan"}</h2>
              {profile?.display_name && <p className="text-sm text-zinc-500">@{profile.display_name}</p>}
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} className="ml-auto w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {editingProfile && (
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre</label>
                  <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-spartan-500/20 focus:border-spartan-500/50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Apellido</label>
                  <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-spartan-500/20 focus:border-spartan-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre público</label>
                <input type="text" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-spartan-500/20 focus:border-spartan-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-spartan-500/20 focus:border-spartan-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">País</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-spartan-500/20 focus:border-spartan-500/50" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(190,11,60,0.3)]">
                <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-zinc-300 mb-4">Estadísticas</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-spartan-500/5 border border-spartan-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-spartan-400">0</p>
            <p className="text-[10px] font-medium text-spartan-400/70">Rutinas creadas</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-400">0</p>
            <p className="text-[10px] font-medium text-emerald-400/70">Días de racha</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-400">0</p>
            <p className="text-[10px] font-medium text-amber-400/70">Sesiones gym</p>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-400">0</p>
            <p className="text-[10px] font-medium text-blue-400/70">Recursos guardados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
