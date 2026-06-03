"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgilityTimer } from "@/components/AgilityTimer";
import { AgilityForm } from "@/components/AgilityForm";
import { AgilityChallenges } from "@/components/AgilityChallenges";
import { TrainingAssistant } from "@/components/TrainingAssistant";
import type { AgilitySession, Dog, AgilitySessionType, AgilitySessionObstacle, AgilityObstacle } from "@/types/database";
import {
  ArrowLeft, Zap, Play, Plus, Trophy, Clock, Target,
  Flame, Calendar, Trash2, TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  sessions: AgilitySession[];
  dog: Dog | null;
  userId: string;
}

export function AgilidadClient({ sessions, dog, userId }: Props) {
  const router = useRouter();
  const [showTimer, setShowTimer] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sessionList, setSessionList] = useState<AgilitySession[]>(sessions);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<AgilitySessionType[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionObstacles, setSessionObstacles] = useState<Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]>>({});

  // Load session types
  useMemo(() => {
    fetch("/api/agility/session-types")
      .then((r) => r.json())
      .then((j) => { if (j.sessionTypes) setSessionTypes(j.sessionTypes); });
  }, []);

  const filteredSessions = useMemo(() => {
    if (!filterType) return sessionList;
    return sessionList.filter((s) => s.session_type_id === filterType);
  }, [sessionList, filterType]);

  const bestCircuit = useMemo(() => {
    const withTime = sessionList.filter((s) => (s.circuit_time_seconds ?? 0) > 0);
    if (withTime.length === 0) return null;
    return Math.min(...withTime.map((s) => s.circuit_time_seconds!));
  }, [sessionList]);

  const bestNetTime = useMemo(() => {
    const withNet = sessionList.filter((s) => (s.net_time_seconds ?? 0) > 0);
    if (withNet.length === 0) return null;
    return Math.min(...withNet.map((s) => s.net_time_seconds!));
  }, [sessionList]);

  const totalSessions = sessionList.length;
  const cleanRuns = sessionList.filter((s) => s.clean_run).length;
  const totalObstacles = sessionList.reduce((sum, s) => sum + (s.obstacles_completed_count ?? 0), 0);

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  const handleSaved = () => {
    setShowTimer(false);
    setShowForm(false);
    // Refresh sessions
    fetch(`/api/agility/sessions?dog_id=${dog?.id}`)
      .then((r) => r.json())
      .then((j) => { if (j.sessions) setSessionList(j.sessions); });
    router.refresh();
  };

  const loadSessionObstacles = async (sessionId: string) => {
    if (sessionObstacles[sessionId]) {
      setExpandedSession(expandedSession === sessionId ? null : sessionId);
      return;
    }
    const res = await fetch(`/api/agility/session-obstacles?session_id=${sessionId}`);
    const json = await res.json();
    if (json.obstacles) {
      setSessionObstacles((prev) => ({ ...prev, [sessionId]: json.obstacles }));
      setExpandedSession(sessionId);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm("¿Eliminar esta sesión?")) return;
    await fetch(`/api/agility/session?id=${sessionId}`, { method: "DELETE" });
    setSessionList((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Agilidad</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-soft rounded-[1.5rem] p-4 flex items-center gap-3 bg-accent-50/60 dark:bg-accent-950/20">
          <div className="w-10 h-10 rounded-2xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-600" />
          </div>
          <div>
            <p className="text-xs text-accent-600 dark:text-accent-400 font-semibold">Récord bruto</p>
            <p className="text-xl font-bold text-accent-700 dark:text-accent-300">{formatTime(bestCircuit)}</p>
          </div>
        </div>
        <div className="card-soft rounded-[1.5rem] p-4 flex items-center gap-3 bg-secondary-50/60 dark:bg-secondary-950/20">
          <div className="w-10 h-10 rounded-2xl bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 font-semibold">Récord neto</p>
            <p className="text-xl font-bold text-secondary-700 dark:text-secondary-300">{formatTime(bestNetTime)}</p>
          </div>
        </div>
        <div className="card-soft rounded-[1.5rem] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">Clean Runs</p>
            <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{cleanRuns}</p>
          </div>
        </div>
        <div className="card-soft rounded-[1.5rem] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
            <Flame className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <p className="text-xs text-warning-600 dark:text-warning-400 font-semibold">Total</p>
            <p className="text-xl font-bold text-warning-700 dark:text-warning-300">{totalSessions}</p>
          </div>
        </div>
      </div>

      {/* Evolution Chart */}
      {filteredSessions.length > 1 && (
        <div className="card-soft rounded-[1.5rem] p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Evolución de tiempos</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={[...filteredSessions]
                .filter((s) => s.net_time_seconds && s.net_time_seconds > 0)
                .reverse()
                .map((s, i) => ({
                  name: `S${i + 1}`,
                  bruto: s.raw_time_seconds ?? s.circuit_time_seconds ?? 0,
                  neto: s.net_time_seconds ?? s.circuit_time_seconds ?? 0,
                  fecha: s.fecha,
                }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value: number) => [`${value}s`, ""]}
              />
              <Line type="monotone" dataKey="bruto" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Bruto" />
              <Line type="monotone" dataKey="neto" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Neto" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Challenges */}
      <AgilityChallenges />

      {/* Training Assistant */}
      {dog && <TrainingAssistant sessions={sessionList} dog={dog} />}

      {/* Action buttons */}
      {dog && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setShowTimer(true); setShowForm(false); }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-accent-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Circuito
          </button>
          <button
            onClick={() => { setShowForm(true); setShowTimer(false); }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Manual
          </button>
        </div>
      )}

      {/* Timer / Form */}
      {showTimer && dog && (
        <AgilityTimer dog={dog} userId={userId} onClose={() => setShowTimer(false)} />
      )}
      {showForm && dog && (
        <AgilityForm dog={dog} userId={userId} onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}

      {/* Filter by session type */}
      {sessionTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setFilterType(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterType === null
                ? "bg-accent-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Todas
          </button>
          {sessionTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterType(st.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === st.id
                  ? "bg-accent-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        {filteredSessions.length === 0 && (
          <p className="text-center text-zinc-400 py-8 text-sm">Sin sesiones de agilidad registradas.</p>
        )}

        {filteredSessions.map((s) => {
          const isBest = s.circuit_time_seconds === bestCircuit && bestCircuit !== null;
          const isExpanded = expandedSession === s.id;

          return (
            <div key={s.id} className="card-soft rounded-[1.25rem] p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.activity_type}</p>
                    {s.clean_run && (
                      <span className="text-[10px] font-bold bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 px-2 py-0.5 rounded-full">
                        Clean Run
                      </span>
                    )}
                    {isBest && (
                      <span className="text-[10px] font-bold bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Récord
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {s.fecha}
                    <span className="mx-1">·</span>
                    <span className="capitalize">{s.difficulty_level}</span>
                  </p>
                </div>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-danger-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Times */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{formatTime(s.raw_time_seconds ?? s.circuit_time_seconds)}</p>
                  <p className="text-[10px] text-zinc-400">Bruto</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-accent-600">{formatTime(s.net_time_seconds ?? s.circuit_time_seconds)}</p>
                  <p className="text-[10px] text-zinc-400">Neto</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{s.fouls_total}</p>
                  <p className="text-[10px] text-zinc-400">Faltas</p>
                </div>
              </div>

              {/* Photo collage */}
              {s.video_url && (
                <div className="flex gap-1.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <img src={s.video_url} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Expand details */}
              <button
                onClick={() => loadSessionObstacles(s.id)}
                className="w-full text-xs font-semibold text-zinc-500 hover:text-accent-600 py-1 transition-colors"
              >
                {isExpanded ? "Ocultar detalles" : "Ver obstáculos"}
              </button>

              {isExpanded && sessionObstacles[s.id] && (
                <div className="space-y-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  {sessionObstacles[s.id].map((obs) => (
                    <div key={obs.id} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">{obs.obstacle?.name}</span>
                      {obs.fouls_count > 0 && (
                        <span className="text-warning-600 font-bold">{obs.fouls_count} faltas</span>
                      )}
                    </div>
                  ))}
                  {s.notes && (
                    <p className="text-[10px] text-zinc-400 mt-2">{s.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
