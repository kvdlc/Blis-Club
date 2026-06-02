"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Zap, CheckCircle, Loader2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createTrial } from "@/lib/trial";

interface Props {
  appSlug?: string;
  redirectTo?: string;
  className?: string;
  buttonText?: string;
  placeholder?: string;
}

export default function InlineRegister({
  appSlug = "guau",
  redirectTo,
  buttonText = "Empezar ahora",
  placeholder = "tu@correo.com",
  className = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name || email.split("@")[0], app_category: appSlug },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Auto login after signup
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      // If auto-login fails, still show success (user may need to verify email)
      setSent(true);
      setLoading(false);
      return;
    }

    // Create trial
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await createTrial(user.id, appSlug);
      const next = redirectTo || `/${appSlug}/app`;
      router.push(next);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className={`bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-100 dark:border-secondary-800/60 rounded-2xl p-6 text-center space-y-3 ${className}`}>
        <div className="w-12 h-12 mx-auto rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-secondary-600" />
        </div>
        <h3 className="text-base font-bold text-secondary-700 dark:text-secondary-300">¡Revisa tu correo!</h3>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Te enviamos un enlace a <span className="font-semibold">{email}</span> para confirmar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        style={{ backgroundImage: "none" }}
      />
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mín. 6 caracteres)"
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-11 pr-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white py-3.5 font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50 shadow-lg shadow-primary-500/25"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
        {loading ? "Creando cuenta..." : buttonText}
      </button>
      {error && (
        <p className="text-xs text-danger-600 bg-danger-50 dark:bg-danger-950/40 rounded-xl p-2.5">{error}</p>
      )}
    </form>
  );
}
