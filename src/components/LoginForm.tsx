"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PawPrint } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-3">
        <PawPrint className="w-12 h-12 mx-auto text-secondary-600 dark:text-secondary-400" />
        <h2 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300">
          ¡Magic Link enviado!
        </h2>
        <p className="text-sm text-secondary-600 dark:text-secondary-400">
          Revisa <strong>{email}</strong>. Te enviamos un enlace mágico para acceder a tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tutor@blis.club"
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {error && (
        <p className="text-sm text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-950 rounded-lg p-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar Magic Link"}
      </button>
    </form>
  );
}
