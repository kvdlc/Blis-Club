"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Crown, LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KID_AVATAR_COLORS, type KidsProfile } from "@/lib/kids";

export default function PerfilPage() {
  const router = useRouter();
  const [account, setAccount] = useState<{ name: string; email: string } | null>(null);
  const [kids, setKids] = useState<KidsProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(KID_AVATAR_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [{ data: profile }, { data: kidsData }] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, email").eq("id", user.id).maybeSingle(),
        supabase.from("kids_profiles").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);
      setAccount({
        name: [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Familia",
        email: profile?.email || user.email || "",
      });
      setKids((kidsData ?? []) as KidsProfile[]);
      setLoading(false);
    };
    load();
  }, []);

  const addKid = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("kids_profiles")
        .insert({ user_id: user.id, name: name.trim(), avatar: null, color })
        .select()
        .single();
      if (data) setKids((prev) => [...prev, data as KidsProfile]);
    }
    setName("");
    setAdding(false);
    setSaving(false);
  };

  const removeKid = async (id: string) => {
    const supabase = createClient();
    setKids((prev) => prev.filter((k) => k.id !== id));
    await supabase.from("kids_profiles").delete().eq("id", id);
  };

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-kids-500" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Cuenta */}
      <div className="kids-card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 text-2xl font-black text-white">
          {(account?.name || "F").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>{account?.name}</h1>
          <p className="text-xs font-semibold text-zinc-500">{account?.email}</p>
        </div>
        <button onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-transform active:scale-90" title="Salir">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      {/* Perfiles de niños */}
      <div className="kids-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
            Perfiles de niños
          </h2>
          <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded-full bg-kids-100 px-3 py-1.5 text-xs font-black text-kids-700">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kids.map((k) => (
            <div key={k.id} className="relative flex flex-col items-center gap-2 rounded-2xl p-4" style={{ backgroundColor: k.color }}>
              <button onClick={() => removeKid(k.id)} className="absolute right-2 top-2 text-zinc-500/70 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-black text-zinc-600">
                {k.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={k.avatar_url} alt={k.name} className="h-full w-full object-cover" />
                ) : (
                  k.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-sm font-black text-zinc-700">{k.name}</span>
            </div>
          ))}
          {kids.length === 0 && !adding && (
            <p className="col-span-2 text-sm font-semibold text-zinc-400 sm:col-span-3">
              Agrega a tus pequeños para personalizar la experiencia.
            </p>
          )}
        </div>

        {adding && (
          <div className="mt-4 space-y-3 rounded-2xl bg-orange-50 p-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del niño/a"
              className="w-full rounded-xl border-2 border-zinc-200 bg-white p-2.5 text-sm font-bold outline-none focus:border-kids-400"
            />
            <div className="flex flex-wrap gap-1.5">
              {KID_AVATAR_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`h-8 w-8 rounded-full ${color === c ? "ring-2 ring-zinc-700" : ""}`} />
              ))}
            </div>
            <button onClick={addKid} disabled={saving || !name.trim()} className="w-full rounded-xl bg-kids-500 py-2.5 text-sm font-black text-white disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        )}
      </div>

      {/* Suscripción */}
      <Link href="/kids/app/suscripcion" className="kids-card flex items-center gap-4 p-5 transition-transform hover:scale-[1.01]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Crown className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-base font-black text-zinc-800">Plan de Kids Club</p>
          <p className="text-xs font-semibold text-zinc-500">Desbloquea toda la biblioteca y descarga sin límites.</p>
        </div>
        <Crown className="h-5 w-5 text-amber-500" />
      </Link>
    </div>
  );
}
