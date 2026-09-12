"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Zap, ShieldCheck, Star, ArrowRight, Sparkles, Dumbbell, Flame,
  Target, HeartPulse, Trophy, TrendingUp, Lock, CalendarClock, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createTrial } from "@/lib/trial";

const FEATURES = [
  { icon: Dumbbell, title: "Rutinas y entrenamiento", desc: "Planes por objetivo con series, repeticiones y seguimiento de cada sesión." },
  { icon: Flame, title: "Hábitos y rachas", desc: "Construye disciplina con hábitos diarios y rachas que no quieres romper." },
  { icon: Trophy, title: "Retos y motivación", desc: "Desafíos y contenido para mantenerte enfocado cuando bajan las ganas." },
  { icon: TrendingUp, title: "Métricas de progreso", desc: "Gráficos de avance: peso, marcas, sesiones y hábitos cumplidos." },
  { icon: CalendarClock, title: "Planificación", desc: "Organiza tu semana de entrenamiento y no improvises más." },
  { icon: HeartPulse, title: "Bienestar", desc: "Sigue tu estado físico y tus objetivos de salud en un solo lugar." },
];

const STEPS = [
  { icon: Zap, title: "1. Crea tu cuenta gratis", desc: "Regístrate en menos de un minuto. Sin tarjeta." },
  { icon: Target, title: "2. Define tu objetivo", desc: "Elige tu meta y arma tu primera rutina y hábitos." },
  { icon: TrendingUp, title: "3. Entrena y mide", desc: "Registra sesiones, mantén rachas y ve tu progreso." },
];

function translateSignupError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already exists"))
    return "Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.";
  if (m.includes("password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid email")) return "El correo no es válido.";
  if (m.includes("too many requests") || m.includes("rate limit")) return "Demasiados intentos. Espera un momento.";
  return msg;
}

export default function SpartanWebGPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const goToForm = () => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Ingresa tu correo electrónico."); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError("");

    const fullName = `${firstName} ${lastName}`.trim();
    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          display_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          app_category: "Spartan",
        },
      },
    });

    if (signErr) { setError(translateSignupError(signErr.message)); setLoading(false); return; }

    const user = data.user;
    if (data.session && user) {
      await createTrial(user.id, "Spartan");
      window.location.assign("/Spartan/app");
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden min-h-[100dvh] bg-[#0a0a0f] text-zinc-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-spartan-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-orange-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/Spartan/web" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white font-extrabold text-sm">B</div>
          <span className="font-extrabold text-sm">Blis <span className="text-spartan-400">Spartan</span></span>
        </Link>
        <Link href="/Spartan/web" className="text-xs font-bold text-zinc-300 hover:text-spartan-400 transition-colors">Ver planes Pro</Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-10 text-center">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-[11px] font-bold text-white bg-[linear-gradient(120deg,#be0b3c,#f97316)] px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Registro gratis
        </motion.span>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-4xl sm:text-6xl font-black leading-[1.05] mb-5">
          Empieza a forjar
          <span className="block bg-gradient-to-r from-spartan-400 via-red-400 to-orange-400 bg-clip-text text-transparent">tu mejor versión.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Crea tu cuenta gratis y empieza a entrenar con propósito: rutinas, hábitos, retos y métricas.
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={goToForm} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white px-6 py-3.5 font-bold text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] active:scale-[0.98] transition-transform">
            <Zap className="w-4 h-4" /> Crear cuenta gratis
          </button>
          <Link href="/Spartan/web" className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.06] border border-white/12 px-6 py-3.5 font-bold text-sm hover:bg-white/[0.1] transition-colors">
            Ver planes Pro
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1 mt-7">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-spartan-400 fill-spartan-400" />)}
          <span className="text-sm font-bold ml-2">4.9/5</span>
          <span className="text-xs text-zinc-500 ml-2">· +2.000 usuarios</span>
        </div>
      </section>

      {/* Steps */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative rounded-3xl p-6 bg-white/[0.03] border border-white/[0.08]">
                <span className="absolute top-5 right-5 text-4xl font-black text-white/[0.05]">{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-spartan-500 to-spartan-700 flex items-center justify-center text-white mb-4"><Icon className="w-6 h-6" /></div>
                <h3 className="text-base font-extrabold mb-1.5">{s.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-8">Todo lo que puedes hacer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-3xl p-5 bg-white/[0.03] border border-white/[0.08]">
                <div className="w-11 h-11 rounded-2xl bg-spartan-500/10 border border-spartan-500/20 text-spartan-400 flex items-center justify-center mb-3"><Icon className="w-5 h-5" /></div>
                <h3 className="text-sm font-extrabold mb-1.5">{f.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Registro */}
      <section id="registro" className="relative z-10 max-w-md mx-auto px-4 py-12 scroll-mt-16">
        <div className="rounded-[2rem] p-6 sm:p-8 bg-white/[0.04] border border-spartan-500/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black mb-1">Crea tu cuenta gratis</h2>
            <p className="text-xs text-zinc-500">Sin tarjeta. Empieza en menos de un minuto.</p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-spartan-500/10 border border-spartan-500/20 flex items-center justify-center"><Check className="w-7 h-7 text-spartan-400" /></div>
              <h3 className="text-lg font-bold">Revisa tu correo</h3>
              <p className="text-sm text-zinc-400 mt-1">Te enviamos un enlace a {email} para confirmar tu cuenta.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="email" required placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
                <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
              </div>
              <input type="password" required autoComplete="new-password" placeholder="Contraseña (mínimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-spartan-500/30" />
              {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl p-2.5">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white py-3.5 font-bold text-sm shadow-[0_8px_24px_-4px_rgba(190,11,60,0.55)] active:scale-[0.98] disabled:opacity-50 transition-transform">
                {loading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta...</>) : (<><Zap className="w-4 h-4" /> Crear cuenta gratis <ArrowRight className="w-4 h-4" /></>)}
              </button>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500"><Lock className="w-3 h-3" /> Sin tarjeta. Cancela cuando quieras.</div>
              <p className="text-center text-xs text-zinc-400">¿Ya tienes cuenta? <Link href="/" className="font-semibold text-spartan-400 hover:underline">Inicia sesión</Link></p>
            </form>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-spartan-600 to-spartan-700 p-8 sm:p-10 text-center">
          <div className="relative">
            <Users className="w-8 h-8 text-white/90 mx-auto mb-3" />
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Únete a los que ya entrenan con disciplina</h2>
            <p className="text-sm text-white/85 mb-6 max-w-lg mx-auto">Empieza gratis hoy y pasa a Pro cuando quieras.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={goToForm} className="rounded-2xl bg-white text-spartan-700 px-6 py-3.5 font-black text-sm hover:bg-white/90 transition-colors">Crear cuenta gratis</button>
              <Link href="/Spartan/web" className="rounded-2xl bg-black/20 border border-white/30 text-white px-6 py-3.5 font-bold text-sm hover:bg-black/30 transition-colors">Ver planes Pro</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-4 pb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-500">
          <Link href="/legal/terminos" className="hover:text-spartan-400 transition-colors">Términos</Link>
          <span>·</span>
          <Link href="/legal/privacidad" className="hover:text-spartan-400 transition-colors">Privacidad</Link>
          <span>·</span>
          <Link href="/legal/reembolsos" className="hover:text-spartan-400 transition-colors">Reembolsos</Link>
        </div>
        <p className="text-[10px] text-zinc-500 mt-3">© 2026 Blis Club. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
