"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { getUserApps, createTrial } from "@/lib/trial";

function translateAuthError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Tu correo aún no está confirmado. Revisa tu bandeja.";
  if (m.includes("too many requests") || m.includes("rate limit")) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("invalid email")) return "El correo no es válido.";
  return msg;
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
        return;
      }

      const apps = await getUserApps(user.id);
      if (!active) return;

      if (apps.length >= 2) {
        // Ya estamos en "/": el selector de apps (server) ya se renderiza.
        // Solo ocultamos el formulario, SIN recargar (evita el bucle de refresco).
        setIsLoggedIn(true);
        setCheckingAuth(false);
      } else if (apps.length === 1) {
        window.location.assign(`/${apps[0].app_slug}/app`);
      } else {
        await createTrial(user.id, "guau");
        window.location.assign("/guau/app");
      }
    };
    checkAuth();

    // Si el usuario cierra sesión desde el selector de apps, volver a mostrar el formulario
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_OUT" || !session) {
        setIsLoggedIn(false);
        setCheckingAuth(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (isLoggedIn) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.assign("/guau/app");
      return;
    }

    const apps = await getUserApps(user.id);
    if (apps.length >= 2) {
      // Recarga única para que el selector de apps se renderice desde el servidor.
      window.location.assign("/");
    } else if (apps.length === 1) {
      window.location.assign(`/${apps[0].app_slug}/app`);
    } else {
      await createTrial(user.id, "guau");
      window.location.assign("/guau/app");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 mb-2">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@blis.club"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-zinc-900/25"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Ingresando...
          </>
        ) : (
          <>
            Iniciar Sesión <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
