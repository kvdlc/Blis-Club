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
        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
          <User className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Perfil</h1>
          <p className="text-xs text-zinc-500">Tu información personal</p>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] shrink-0">
              {(profile?.first_name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-800">
                {profile?.first_name ? `${profile.first_name} ${profile?.last_name || ""}` : "Usuario Spartan"}
              </h2>
              {profile?.display_name && (
                <p className="text-sm text-zinc-500">@{profile.display_name}</p>
              )}
            </div>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="ml-auto w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <Settings className="w-4 h-4 text-zinc-600" />
            </button>
          </div>

          {editingProfile && (
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Apellido</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nombre público</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="@usuario"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">WhatsApp</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="+51 999 999 999"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">País</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Perú"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-5">
        <h3 className="text-sm font-bold text-zinc-700 mb-4">Estadísticas</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-red-600">0</p>
            <p className="text-[10px] font-medium text-red-500">Rutinas creadas</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">0</p>
            <p className="text-[10px] font-medium text-emerald-500">Días de racha</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-orange-600">0</p>
            <p className="text-[10px] font-medium text-orange-500">Sesiones gym</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-blue-600">0</p>
            <p className="text-[10px] font-medium text-blue-500">Recursos guardados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
