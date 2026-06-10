"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Subscription, Plan } from "@/types/database";
import { ArrowLeft, User, Camera, Check, KeyRound, ShieldAlert, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { CountrySelect } from "@/components/CountrySelect";
import { PhoneInput } from "@/components/PhoneInput";
import { uploadPhotoFromDataUrl } from "@/lib/storage";
import { ImageEditor } from "@/components/ImageEditor";
import { TimezonePicker } from "@/components/TimezonePicker";

export default function EditProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">Cargando...</div>}>
      <EditProfilePage />
    </Suspense>
  );
}

function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<(Subscription & { plans: Plan }) | null>(null);
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [timezone, setTimezone] = useState("America/Lima");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");

  // Password
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/"); return; }
      const [{ data: p }, { data: sub }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("subscriptions").select("*, plans(*)").eq("user_id", user.id).maybeSingle(),
      ]);
      const pr = p as Profile | null;
      if (pr) {
        setProfile(pr);
        setAvatar(pr.avatar_url ?? "");
        setFirstName(pr.first_name ?? "");
        setLastName(pr.last_name ?? "");
        setCountry(pr.country ?? "");
        setWhatsapp(pr.whatsapp ?? "");
        setTimezone(pr.timezone ?? "America/Lima");
      }
      setSubscription(sub as (Subscription & { plans: Plan }) | null);
      setLoading(false);
    };
    load();
  }, []);

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      first_name: firstName, 
      last_name: lastName, 
      country, 
      whatsapp,
      timezone,
      avatar_url: avatar || null,
    };

    // Try update first, if it affects 0 rows, insert
    const { error: updateErr } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (updateErr) {
      console.error("Update error:", updateErr);
      // Fallback: try upsert
      const { error: upsertErr } = await supabase.from("profiles").upsert({ id: user.id, ...payload, email: profile?.email, display_name: profile?.display_name }, { onConflict: "id" });
      if (upsertErr) console.error("Upsert error:", upsertErr);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const createPassword = async () => {
    setPwError(""); setPwSuccess(false);
    if (newPw.length < 6) { setPwError("Mínimo 6 caracteres"); return; }
    if (newPw !== confirmPw) { setPwError("No coinciden"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message.includes("recent") ? "Sesión antigua. Cierra sesión y vuelve a ingresar." : error.message); }
    else { setPwSuccess(true); setNewPw(""); setConfirmPw(""); setShowCreatePw(false); setTimeout(() => setPwSuccess(false), 3000); }
  };

  const changePassword = async () => {
    setPwError(""); setPwSuccess(false);
    if (!currentPw) { setPwError("Ingresa tu contraseña actual"); return; }
    if (newPw.length < 6) { setPwError("Mínimo 6 caracteres"); return; }
    if (newPw !== confirmPw) { setPwError("No coinciden"); return; }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: profile?.email ?? "", password: currentPw });
    if (signInError) { setPwError("Contraseña actual incorrecta"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError(error.message); }
    else { setPwSuccess(true); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowChangePw(false); setTimeout(() => setPwSuccess(false), 3000); }
  };

  if (loading) return <div className="text-center py-20 text-zinc-400">Cargando...</div>;

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900">Editar Perfil</h1>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-secondary-600 bg-secondary-50 rounded-full px-2 py-1">
            <Check className="w-3 h-3" /> Guardado
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <label htmlFor="avatarUpload" className="relative w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center border-2 border-dashed border-primary-300 cursor-pointer hover:border-primary-500 transition-colors overflow-hidden group">
          {avatar ? (<img src={avatar} alt="" className="w-full h-full object-cover" />) : (<User className="w-10 h-10 text-primary-400 group-hover:scale-110 transition-transform" />)}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            {uploading ? (<Loader2 className="w-6 h-6 text-white animate-spin" />) : (<Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />)}
          </div>
        </label>
        <input type="file" accept="image/*" className="hidden" id="avatarUpload"
          onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const blobUrl = URL.createObjectURL(file); setEditorSrc(blobUrl); setEditorOpen(true); e.target.value = ""; }} />
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-zinc-500 block mb-1">Nombre</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm" placeholder="Kevin" /></div>
        <div><label className="text-xs text-zinc-500 block mb-1">Apellido</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm" placeholder="Valdez" /></div>
      </div>

      <div><label className="text-xs text-zinc-500 block mb-1">Correo electrónico</label><input type="email" value={profile?.email ?? ""} disabled className="w-full rounded-xl bg-zinc-100 border border-zinc-200 px-3 py-2 text-sm text-zinc-400 cursor-not-allowed" /></div>
      <div><label className="text-xs text-zinc-500 block mb-1">País</label><CountrySelect value={country} onChange={setCountry} /></div>
      <div><label className="text-xs text-zinc-500 block mb-1">WhatsApp</label><PhoneInput value={whatsapp} onChange={setWhatsapp} defaultCountryCode={country || undefined} /></div>
      <div><label className="text-xs text-zinc-500 block mb-1">Zona Horaria</label><TimezonePicker value={timezone} onChange={setTimezone} /></div>

      {/* Save */}
      <button onClick={saveProfile} className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98] ${saved ? "bg-secondary-500 text-white" : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"}`}>
        {saved ? <><Check className="w-4 h-4 inline mr-1" /> Perfil Guardado</> : <><Check className="w-4 h-4 inline mr-1" /> Guardar Cambios</>}
      </button>

      {/* Subscription */}
      {subscription && (
        <div className="card-soft rounded-[1.25rem] p-4 space-y-1">
          <p className="text-sm font-bold text-zinc-800">Plan {(subscription.plans as Plan)?.name ?? "Free"}</p>
          <p className={`text-xs font-semibold ${subscription.status === "active" ? "text-secondary-600" : "text-warning-600"}`}>Estado: {subscription.status}</p>
          {subscription.current_period_end && <p className="text-[10px] text-zinc-400">Vence: {new Date(subscription.current_period_end).toLocaleDateString("es")}</p>}
        </div>
      )}

      {/* Password */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-zinc-800">Seguridad</h3>
        {pwSuccess && <p className="text-xs text-secondary-600 font-semibold bg-secondary-50 rounded-xl p-2 text-center">¡Contraseña actualizada!</p>}
        <button onClick={() => { setShowCreatePw(!showCreatePw); setShowChangePw(false); }} className="w-full flex items-center justify-between card-soft rounded-[1.25rem] p-4 text-sm text-primary-600 font-medium">
          <div className="flex items-center gap-2"><KeyRound className="w-4 h-4" /> Crear contraseña</div>
          {showCreatePw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showCreatePw && (
          <div className="space-y-2 p-4 rounded-xl bg-primary-50/30">
            <p className="text-[10px] text-zinc-500">Si ingresaste con Magic Link y no tienes contraseña</p>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Nueva contraseña" className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm" />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirmar" className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm" />
            {pwError && <p className="text-xs text-danger-600">{pwError}</p>}
            <button onClick={createPassword} className="w-full bg-primary-600 text-white rounded-xl py-2 text-sm font-bold">Crear Contraseña</button>
          </div>
        )}
        <button onClick={() => { setShowChangePw(!showChangePw); setShowCreatePw(false); }} className="w-full flex items-center justify-between card-soft rounded-[1.25rem] p-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Cambiar contraseña</div>
          {showChangePw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showChangePw && (
          <div className="space-y-2 p-4 rounded-xl bg-zinc-50">
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Contraseña actual" className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm" />
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Nueva contraseña" className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm" />
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirmar" className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm" />
            {pwError && <p className="text-xs text-danger-600">{pwError}</p>}
            <button onClick={changePassword} className="w-full bg-primary-600 text-white rounded-xl py-2 text-sm font-bold">Actualizar Contraseña</button>
          </div>
        )}
      </div>

      {/* Image Editor */}
      {editorOpen && (
        <ImageEditor open={editorOpen} onClose={() => setEditorOpen(false)} imageUrl={editorSrc}
          onSave={async (dataUrl) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUploading(true);
            const url = await uploadPhotoFromDataUrl(dataUrl, user.id);
            if (url) setAvatar(url);
            setUploading(false);
            setEditorOpen(false);
          }} circleSize={180} />
      )}
    </div>
  );
}
