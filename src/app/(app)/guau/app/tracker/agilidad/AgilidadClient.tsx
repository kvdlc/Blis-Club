"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AgilityForm } from "@/components/AgilityForm";
import { AgilityChallenges } from "@/components/AgilityChallenges";
import { TrainingAssistant } from "@/components/TrainingAssistant";
import { AgilitySetup, type SessionConfig } from "@/components/AgilitySetup";
import { AgilityRun, type RunData } from "@/components/AgilityRun";
import { AgilityReview } from "@/components/AgilityReview";
import type { AgilitySession, Dog, AgilitySessionType, AgilitySessionObstacle, AgilityObstacle, AgilityCircuit, AgilityCustomCircuit } from "@/types/database";
import {
  ArrowLeft, Zap, Play, Plus, Trophy, Clock, Target,
  Flame, Calendar, Trash2, TrendingUp, Eye, EyeOff,
  ChevronDown, ChevronUp, Star
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  sessions: AgilitySession[];
  dog: Dog | null;
  userId: string;
}

export function AgilidadClient({ sessions, dog, userId }: Props) {
  const router = useRouter();
  const [wizardStep, setWizardStep] = useState<null | "setup" | "run" | "review">(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [runData, setRunData] = useState<RunData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sessionList, setSessionList] = useState<AgilitySession[]>(sessions);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sessionTypes, setSessionTypes] = useState<AgilitySessionType[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionObstacles, setSessionObstacles] = useState<Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]>>({});

  // Circuits
  const [circuits, setCircuits] = useState<AgilityCircuit[]>([]);
  const [customCircuits, setCustomCircuits] = useState<AgilityCustomCircuit[]>([]);
  const [showManageCircuits, setShowManageCircuits] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState<AgilityCircuit | AgilityCustomCircuit | null>(null);
  const [showSessions, setShowSessions] = useState(false);

  // Load circuits
  useMemo(() => {
    fetch("/api/agility/circuits")
      .then((r) => r.json())
      .then((j) => {
        if (j.circuits) setCircuits(j.circuits);
        if (j.customCircuits) setCustomCircuits(j.customCircuits);
      });
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

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSaved = () => {
    setWizardStep(null);
    setSessionConfig(null);
    setRunData(null);
    setShowForm(false);
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

  const toggleCircuitVisibility = async (circuitId: string, isCustom: boolean, currentVisible: boolean) => {
    const endpoint = isCustom ? "/api/agility/circuits" : "/api/admin/circuits";
    try {
      await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: circuitId, is_visible: !currentVisible }),
      });
      if (isCustom) {
        setCustomCircuits((prev) =>
          prev.map((c) => (c.id === circuitId ? { ...c, is_visible: !currentVisible } : c))
        );
      } else {
        setCircuits((prev) =>
          prev.map((c) => (c.id === circuitId ? { ...c, is_visible: !currentVisible } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startCircuit = (circuit: AgilityCircuit | AgilityCustomCircuit) => {
    setSelectedCircuit(circuit);
    setShowForm(false);
    setWizardStep(null);
    // Preload circuit config and go to setup
    const circuitAny = circuit as any;
    const obsIds = Array.isArray(circuitAny.standard_obstacles)
      ? circuitAny.standard_obstacles
      : Array.isArray(circuitAny.obstacles)
      ? circuitAny.obstacles
      : [];
    
    fetch("/api/agility/obstacles")
      .then((r) => r.json())
      .then((j) => {
        let matched: AgilityObstacle[] = [];
        if (j.obstacles && obsIds.length > 0) {
          const obstacleIds = obsIds.map((o: any) => o.obstacle_id || o);
          matched = j.obstacles.filter((o: AgilityObstacle) => obstacleIds.includes(o.id));
        }
        setSessionConfig({
          sessionTypeId: circuit.session_type_id || null,
          difficulty: circuit.difficulty_level || "principiante",
          selectedObstacles: matched,
          penaltySettings: {},
          sessionTypeName: circuit.name,
        });
        setWizardStep("setup");
      })
      .catch(() => {
        // If obstacles fail to load, still open setup so user can configure manually
        setSessionConfig({
          sessionTypeId: circuit.session_type_id || null,
          difficulty: circuit.difficulty_level || "principiante",
          selectedObstacles: [],
          penaltySettings: {},
          sessionTypeName: circuit.name,
        });
        setWizardStep("setup");
      });
  };

  const visibleCircuits = [...circuits, ...customCircuits].filter((c) => c.is_visible !== false);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Agilidad</h1>
      </div>

      {/* 🎯 BOTONES PRINCIPALES — ARRIBA */}
      {dog && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setWizardStep("setup"); setShowForm(false); setSelectedCircuit(null); setSessionConfig(null); }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-accent-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Circuito
          </button>
          <button
            onClick={() => { setShowForm(true); setWizardStep(null); setSelectedCircuit(null); }}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            Circuito Personalizado
          </button>
        </div>
      )}

      {/* 🏃 CIRCUITOS RÁPIDOS */}
      {visibleCircuits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Circuitos rápidos</h3>
            <button
              onClick={() => setShowManageCircuits(!showManageCircuits)}
              className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Gestionar
            </button>
          </div>

          {!showManageCircuits ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
              {visibleCircuits.map((circuit) => {
                const obstacleCount = Array.isArray((circuit as any).standard_obstacles) 
                  ? (circuit as any).standard_obstacles.length 
                  : (Array.isArray((circuit as any).obstacles) ? (circuit as any).obstacles.length : 0);
                const isCustom = "user_id" in circuit;
                return (
                  <button
                    key={circuit.id}
                    onClick={() => startCircuit(circuit)}
                    className="snap-start flex flex-col items-center gap-2 p-4 rounded-[1.25rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 min-w-[140px] active:scale-[0.97] transition-all hover:border-accent-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                      {isCustom ? <Star className="w-5 h-5 text-accent-600" /> : <Zap className="w-5 h-5 text-accent-600" />}
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 text-center leading-tight">{circuit.name}</span>
                    <span className="text-[10px] text-zinc-400">{obstacleCount} obstáculos</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      circuit.difficulty_level === "principiante" ? "bg-secondary-100 text-secondary-700" :
                      circuit.difficulty_level === "intermedio" ? "bg-warning-100 text-warning-700" :
                      "bg-danger-100 text-danger-700"
                    }`}>
                      {circuit.difficulty_level || "General"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">Toca el ojo para ocultar/mostrar circuitos</p>
              {[...circuits, ...customCircuits].map((circuit) => {
                const isCustom = "user_id" in circuit;
                return (
                  <div key={circuit.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      {isCustom ? <Star className="w-4 h-4 text-accent-500" /> : <Zap className="w-4 h-4 text-accent-500" />}
                      <span className="text-xs font-semibold">{circuit.name}</span>
                    </div>
                    <button
                      onClick={() => toggleCircuitVisibility(circuit.id, isCustom, circuit.is_visible ?? true)}
                      className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
                    >
                      {(circuit.is_visible ?? true) ? <Eye className="w-3.5 h-3.5 text-zinc-500" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

      {/* Wizard Overlay */}
      {wizardStep && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 overflow-y-auto">
          {wizardStep === "setup" && dog && (
            <AgilitySetup
              dog={dog}
              onStart={(config) => { setSessionConfig(config); setWizardStep("run"); }}
              onClose={() => { setWizardStep(null); setSessionConfig(null); }}
              onQuickStart={(config) => { setSessionConfig(config); setWizardStep("run"); }}
            />
          )}
          {wizardStep === "run" && dog && sessionConfig && (
            <AgilityRun
              dog={dog}
              userId={userId}
              config={sessionConfig}
              onFinish={(data) => { setRunData(data); setWizardStep("review"); }}
              onClose={() => { setWizardStep("setup"); }}
            />
          )}
          {wizardStep === "review" && dog && runData && (
            <AgilityReview
              dog={dog}
              userId={userId}
              runData={runData}
              onSaved={handleSaved}
              onClose={handleSaved}
            />
          )}
        </div>
      )}
      {showForm && dog && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 overflow-y-auto">
          <AgilityForm
            dog={dog}
            userId={userId}
            onClose={() => setShowForm(false)}
            onSaved={handleSaved}
          />
        </div>
      )}

      {/* Evolution Chart — only if data exists */}
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
      <AgilityChallenges sessions={sessionList} />

      {/* Training Assistant */}
      {dog && <TrainingAssistant sessions={sessionList} dog={dog} />}

      {/* Sessions list — collapsible */}
      <div className="space-y-3">
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="w-full flex items-center justify-between p-4 rounded-[1.25rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Sesiones anteriores</span>
            <span className="text-xs text-zinc-400">({filteredSessions.length})</span>
          </div>
          {showSessions ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSessions && (
          <div className="space-y-3">
            {/* Filter by session type */}
            {sessionTypes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
                <button
                  onClick={() => setFilterType(null)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterType === null ? "bg-accent-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Todas
                </button>
                {sessionTypes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterType(st.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filterType === st.id ? "bg-accent-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
            )}

            {filteredSessions.length === 0 && (
              <p className="text-center text-zinc-400 py-8 text-sm">Sin sesiones de agilidad registradas.</p>
            )}

            {filteredSessions.map((s) => {
              const isBest = s.circuit_time_seconds === bestCircuit && bestCircuit !== null;
              const isExpanded = expandedSession === s.id;
              return (
                <div key={s.id} className="card-soft rounded-[1.25rem] p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.activity_type}</p>
                        {s.clean_run && (
                          <span className="text-[10px] font-bold bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 px-2 py-0.5 rounded-full">Clean Run</span>
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

                  {s.video_url && (
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black">
                      <video src={s.video_url} controls className="w-full max-h-32" />
                    </div>
                  )}

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
                          {obs.fouls_count > 0 && <span className="text-warning-600 font-bold">{obs.fouls_count} faltas</span>}
                        </div>
                      ))}
                      {s.notes && <p className="text-[10px] text-zinc-400 mt-2">{s.notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
