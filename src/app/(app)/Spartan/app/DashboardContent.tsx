"use client";

import { Shield, Dumbbell, Flame, CheckSquare, ArrowRight, Trophy, Target } from "lucide-react";
import Link from "next/link";

const quotes = [
  "No hay hombre que no pueda hacer más de lo que cree que puede. — Séneca",
  "El dolor que sientes hoy es la fuerza que sentirás mañana.",
  "La disciplina es el puente entre las metas y los logros. — Jim Rohn",
  "Un hombre se vuelve fuerte cuando acepta su responsabilidad.",
  "No reces por una vida fácil, reza por la fuerza para soportar una difícil. — Bruce Lee",
  "El carácter no se desarrolla en la calma, sino en la tormenta.",
];

export default function DashboardContent() {
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="relative -mx-4 -mt-14 px-4 pt-14 min-h-screen bg-gradient-to-b from-red-950 via-zinc-950 to-zinc-950 text-zinc-200">
      <div className="space-y-5 pt-4 pb-8">
        {/* Quote of the day */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0 mt-0.5">
              <Flame className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Frase del día</p>
              <p className="text-sm text-zinc-300 leading-relaxed italic">{quote}</p>
            </div>
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xs font-medium text-zinc-500">Hábitos hoy</p>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">0/0</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xs font-medium text-zinc-500">Entrenamientos</p>
            </div>
            <p className="text-2xl font-extrabold text-zinc-100">0</p>
            <p className="text-[10px] text-zinc-600">esta semana</p>
          </div>
        </div>

        {/* Quick nav cards */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Acceso rápido</p>

          <Link href="/Spartan/app/motivacion" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100">Motivación</p>
              <p className="text-xs text-zinc-500">Libros, videos y películas</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </Link>

          <Link href="/Spartan/app/gimnasio" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100">Gimnasio</p>
              <p className="text-xs text-zinc-500">Rutinas, ejercicios y progreso</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </Link>

          <Link href="/Spartan/app/habitos" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-100">Hábitos</p>
              <p className="text-xs text-zinc-500">Seguimiento de disciplina diaria</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </Link>
        </div>

        {/* Goals placeholder */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tus metas</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="w-10 h-10 text-zinc-700 mb-2" />
            <p className="text-sm text-zinc-500">Define tu primera meta</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Establece objetivos en Motivación y hazles seguimiento aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
