"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";

interface Props {
  sessions: { id: string; activity_type: string; duration_min: number; circuit_time_seconds: number | null; fecha: string }[];
}

export function AgilidadClient({ sessions }: Props) {
  const router = useRouter();

  const bestCircuit = sessions.filter((s) => s.circuit_time_seconds && s.circuit_time_seconds > 0)
    .length > 0
    ? Math.min(...sessions.filter((s) => s.circuit_time_seconds!).map((s) => s.circuit_time_seconds!))
    : null;

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Agilidad</h1>
      </div>

      {bestCircuit && (
        <div className="card-soft rounded-[1.5rem] p-5 flex items-center gap-4 bg-accent-50/60 dark:bg-accent-950/20">
          <div className="w-12 h-12 rounded-2xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
            <Zap className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">Récord Personal</p>
            <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{bestCircuit}s</p>
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <p className="text-center text-zinc-400 py-8 text-sm">Sin sesiones de agility registradas.</p>
      )}

      {sessions.map((s, i) => (
        <div key={i} className="card-soft rounded-[1.25rem] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold capitalize">{s.activity_type}</p>
            <p className="text-xs text-zinc-500">{s.fecha} · {s.duration_min}min</p>
          </div>
          {s.circuit_time_seconds && (
            <span className={`text-sm font-bold ${s.circuit_time_seconds === bestCircuit ? "text-accent-600" : "text-zinc-600"}`}>
              {s.circuit_time_seconds}s
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
