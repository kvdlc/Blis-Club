"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Walk, Dog } from "@/types/database";
import { Pause, Flame, Zap } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  walks: Walk[];
  dog: Dog | null;
  agilitySessions: { id: string; activity_type: string; duration_min: number; circuit_time_seconds: number | null; fecha: string }[];
  streakDays: number;
  userId: string;
}

type SubTab = "paseos" | "agility";

function getTrafficColor(light: string | null) {
  switch (light) {
    case "green": return "bg-secondary-500";
    case "yellow": return "bg-warning-500";
    case "red": return "bg-danger-500";
    default: return "bg-zinc-200 dark:bg-zinc-700";
  }
}

export function TrackerClient({ walks, dog, agilitySessions, streakDays }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("paseos");

  // Heatmap data - last 30 days
  const heatmapData = useMemo(() => {
    const map: Record<string, { date: string; avg: number | null }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key, avg: null };
    }
    const byDate: Record<string, number[]> = {};
    walks.forEach((w) => {
      const key = w.start_time.slice(0, 10);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(w.traffic_light === "green" ? 1 : w.traffic_light === "yellow" ? 2 : 3);
    });
    Object.entries(byDate).forEach(([key, vals]) => {
      map[key] = { date: key, avg: vals.reduce((a, b) => a + b, 0) / vals.length };
    });
    return Object.values(map);
  }, [walks]);

  // Reactivity chart - weekly data
  const reactivityData = useMemo(() => {
    const weeks: Record<string, { week: string; red: number; yellow: number; green: number; total: number }> = {};
    walks.forEach((w) => {
      const d = new Date(w.start_time);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: key, red: 0, yellow: 0, green: 0, total: 0 };
      weeks[key].total++;
      if (w.traffic_light === "red") weeks[key].red++;
      else if (w.traffic_light === "yellow") weeks[key].yellow++;
      else if (w.traffic_light === "green") weeks[key].green++;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-8).map((w) => ({
      name: new Date(w.week).toLocaleDateString("es", { day: "numeric", month: "short" }),
      Verde: w.green,
      Amarillo: w.yellow,
      Rojo: w.red,
    }));
  }, [walks]);

  // PR for agility
  const bestCircuit = useMemo(() => {
    const valid = agilitySessions.filter((s) => s.circuit_time_seconds && s.circuit_time_seconds > 0);
    return valid.length > 0 ? Math.min(...valid.map((s) => s.circuit_time_seconds!)) : null;
  }, [agilitySessions]);

  const greenCount = walks.filter((w) => w.traffic_light === "green").length;
  const walkTotal = walks.length || 1;
  const greenPct = Math.round((greenCount / walkTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Iniciar Paseo big button */}
      <Link
        href="/guau/app/tracker/paseo"
        className="flex items-center justify-center gap-3 w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-5 font-bold text-lg shadow-lg shadow-primary-600/20 transition-colors active:scale-[0.98]"
      >
        <Pause className="w-6 h-6" />
        INICIAR PASEO
      </Link>

      {!dog ? (
        <p className="text-center text-zinc-500 py-8">Registra un perro para empezar a trackear paseos.</p>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{walks.length}</p>
              <p className="text-[10px] text-zinc-500">Paseos totales</p>
            </div>
            <div className="bg-secondary-50 dark:bg-secondary-950 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 text-center">
              <p className="text-2xl font-bold text-secondary-600">{greenPct}%</p>
              <p className="text-[10px] text-zinc-500">En verde</p>
            </div>
            <div className="bg-warning-50 dark:bg-warning-950 rounded-2xl border border-warning-200 dark:border-warning-800 p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-warning-500" />
                <span className="text-2xl font-bold text-warning-600">{streakDays}</span>
              </div>
              <p className="text-[10px] text-zinc-500">Días de racha</p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex gap-2">
            {(["paseos", "agility"] as SubTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  subTab === t ? "bg-primary-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"
                }`}
              >
                {t === "paseos" ? "Paseos" : "Agility"}
              </button>
            ))}
          </div>

          {subTab === "paseos" && (
            <>
              {/* Heatmap */}
              {heatmapData.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <h3 className="text-xs font-semibold text-zinc-500 mb-3">CALENDARIO MENSUAL</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {heatmapData.map((day, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-md ${
                          day.avg === null ? "bg-zinc-100 dark:bg-zinc-800" :
                          day.avg <= 1.5 ? "bg-secondary-400" :
                          day.avg <= 2.5 ? "bg-warning-400" :
                          "bg-danger-400"
                        }`}
                        title={day.date}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4 mt-2 justify-center">
                    {[
                      { color: "bg-secondary-400", label: "Verde" },
                      { color: "bg-warning-400", label: "Amarillo" },
                      { color: "bg-danger-400", label: "Rojo" },
                    ].map((l) => (
                      <span key={l.label} className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <span className={`w-3 h-3 rounded ${l.color}`} /> {l.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactivity chart */}
              {reactivityData.length > 1 && (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <h3 className="text-xs font-semibold text-zinc-500 mb-3">EVOLUCIÓN SEMANAL</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reactivityData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="Verde" stackId="a" fill="#16a34a" />
                      <Bar dataKey="Amarillo" stackId="a" fill="#ea580c" />
                      <Bar dataKey="Rojo" stackId="a" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}

          {subTab === "agility" && (
            <div className="space-y-4">
              {bestCircuit && (
                <div className="bg-accent-50 dark:bg-accent-950 rounded-2xl border border-accent-200 dark:border-accent-800 p-4 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-accent-500" />
                  <div>
                    <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">Récord Personal</p>
                    <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{bestCircuit}s</p>
                  </div>
                </div>
              )}

              {agilitySessions.map((s, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="flex items-center justify-between">
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
                </div>
              ))}

              {agilitySessions.length === 0 && (
                <p className="text-center text-zinc-400 py-8 text-sm">Sin sesiones de agility registradas.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
