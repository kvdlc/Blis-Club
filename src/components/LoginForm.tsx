"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, CheckCircle, KeyRound, Link2, UserPlus, User } from "lucide-react";
import { getUserApps, createTrial } from "@/lib/trial";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic" | "register">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const refCookie = document.cookie.split("; ").find((r) => r.startsWith("blis_referral_code="));
    const refCode = refCookie ? refCookie.split("=")[1] : "";
    const nextPath = refCode ? `/guau/web?ref=${refCode}` : "/guau/app";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        data: { app_category: "guau" },
      },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }

    // Multi-app routing: check user_apps
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const apps = await getUserApps(user.id);
      if (apps.length === 0) {
        // No apps yet, create trial for guau
        await createTrial(user.id, "guau");
        router.push("/guau/app");
      } else if (apps.length === 1) {
        router.push(`/${apps[0].app_slug}/app`);
      } else {
        router.push("/?switcher=1");
      }
    } else {
      router.push("/guau/app");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Leer ?ref= de la URL o de la cookie
    const urlParams = new URLSearchParams(window.location.search);
    const urlRef = urlParams.get("ref");
    const refCookie = document.cookie.split("; ").find((r) => r.startsWith("blis_referral_code="));
    const refCode = urlRef || (refCookie ? refCookie.split("=")[1] : "");
    
    const nextPath = refCode ? `/guau/app?ref=${refCode}` : "/guau/app";
    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          display_name: fullName, 
          first_name: firstName,
          last_name: lastName,
          app_category: "guau",
          referral_code: refCode,
        },
        emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-100 dark:border-secondary-800/60 rounded-[1.5rem] p-8 text-center space-y-3 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-secondary-600" />
        </div>
        <h2 className="text-lg font-bold text-secondary-700 dark:text-secondary-300">
          {mode === "register" ? "¡Registro exitoso!" : "¡Magic Link enviado!"}
        </h2>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          {mode === "register"
            ? `Revisa ${email}. Te enviamos un enlace para confirmar tu cuenta.`
            : `Revisa ${email}. Te enviamos un enlace mágico para acceder.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
        {[
          { key: "password" as const, label: "Ingresar", icon: KeyRound },
          { key: "register" as const, label: "Registrarse", icon: UserPlus },
          { key: "magic" as const, label: "Magic Link", icon: Link2 },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold transition-all ${
              mode === m.key ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500"
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={mode === "register" ? handleRegister : mode === "magic" ? handleMagicLink : handlePasswordLogin} className="space-y-4">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nombre"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Apellido</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellido"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input id="email" type="text" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tutor@blis.club"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
        </div>

        {(mode === "password" || mode === "register") && (
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950/40 rounded-xl p-3">{error}</p>
        )}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary-600/25">
          {loading ? "Cargando..." : mode === "register" ? "Crear cuenta" : mode === "magic" ? "Enviar Magic Link" : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}
