"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import {
  Droplets, BadgeCheck, Flag, PenLine, X, Check, Loader2
} from "lucide-react";

type MainPhase = "selecting" | "active" | "evaluating" | "done";
type EvalStep = "traffic" | "triggers" | "digestive";

const TRIGGER_OPTIONS = [
  { tag: "Otros Perros", emoji: "🐕" },
  { tag: "Motos", emoji: "🛵" },
  { tag: "Gatos", emoji: "🐱" },
  { tag: "Ruidos Fuertes", emoji: "🔊" },
  { tag: "Gente", emoji: "🚶" },
  { tag: "Bicicletas", emoji: "🚲" },
  { tag: "Niños", emoji: "👶" },
  { tag: "Coches", emoji: "🚗" },
];

interface Props {
  allDogs: Dog[];
  userId: string;
  onDone: () => void;
  onClose: () => void;
}

const STORAGE_KEY = "blis_active_walk";

interface StoredWalk {
  startTime: string;
  dogIds: string[];
  pipiCounts: Record<string, number>;
  popoCounts: Record<string, number>;
  pipiTimes: Record<string, string[]>;
  popoTimes: Record<string, string[]>;
}

export function WalkSession({ allDogs, userId, onDone, onClose }: Props) {
  const supabase = createClient();

  const [mainPhase, setMainPhase] = useState<MainPhase>("selecting");

  // Walk data
  const [walkStartTime, setWalkStartTime] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  const [pipiCounts, setPipiCounts] = useState<Record<string, number>>({});
  const [popoCounts, setPopoCounts] = useState<Record<string, number>>({});
  const [pipiTimes, setPipiTimes] = useState<Record<string, string[]>>({});
  const [popoTimes, setPopoTimes] = useState<Record<string, string[]>>({});

  // Per-dog evaluation
  const [evalIndex, setEvalIndex] = useState(0);
  const [evalStep, setEvalStep] = useState<EvalStep>("traffic");
  const [evals, setEvals] = useState<Record<string, { traffic: string | null; triggers: string[]; stool: number | null }>>({});

  // Trigger UI state (shared during evaluation)
  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [showCustomTrigger, setShowCustomTrigger] = useState(false);

  const [saving, setSaving] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: StoredWalk = JSON.parse(saved);
        setWalkStartTime(data.startTime);
        setSelectedDogIds(data.dogIds);
        setPipiCounts(data.pipiCounts || {});
        setPopoCounts(data.popoCounts || {});
        setPipiTimes(data.pipiTimes || {});
        setPopoTimes(data.popoTimes || {});
        setMainPhase("active");
      }
    } catch { /* ignore */ }
  }, []);

  // Timer
  useEffect(() => {
    if (mainPhase === "active" && walkStartTime) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - new Date(walkStartTime).getTime()) / 1000));
      }, 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [mainPhase, walkStartTime]);

  const persist = (updates: Partial<StoredWalk>) => {
    try {
      const base: StoredWalk = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, ...updates }));
    } catch { /* ignore */ }
  };

  const nowISO = () => new Date().toISOString();

  // ─── SELECTING ───
  const startWalk = () => {
    if (selectedDogIds.length === 0) return;
    const startTime = nowISO();
    const initialPipi: Record<string, number> = {};
    const initialPopo: Record<string, number> = {};
    const initialPipiTimes: Record<string, string[]> = {};
    const initialPopoTimes: Record<string, string[]> = {};
    selectedDogIds.forEach((id) => {
      initialPipi[id] = 0;
      initialPopo[id] = 0;
      initialPipiTimes[id] = [];
      initialPopoTimes[id] = [];
    });

    setWalkStartTime(startTime);
    setPipiCounts(initialPipi);
    setPopoCounts(initialPopo);
    setPipiTimes(initialPipiTimes);
    setPopoTimes(initialPopoTimes);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      startTime,
      dogIds: selectedDogIds,
      pipiCounts: initialPipi,
      popoCounts: initialPopo,
      pipiTimes: initialPipiTimes,
      popoTimes: initialPopoTimes,
    }));

    setMainPhase("active");
  };

  const addPipi = (dogId: string) => {
    const time = nowISO();
    setPipiCounts((prev) => {
      const next = { ...prev, [dogId]: (prev[dogId] || 0) + 1 };
      return next;
    });
    setPipiTimes((prev) => {
      const next = { ...prev, [dogId]: [...(prev[dogId] || []), time] };
      persist({ pipiTimes: next });
      return next;
    });
    persist({ pipiCounts: { ...pipiCounts, [dogId]: (pipiCounts[dogId] || 0) + 1 } });
  };

  const addPopo = (dogId: string) => {
    const time = nowISO();
    setPopoCounts((prev) => {
      const next = { ...prev, [dogId]: (prev[dogId] || 0) + 1 };
      return next;
    });
    setPopoTimes((prev) => {
      const next = { ...prev, [dogId]: [...(prev[dogId] || []), time] };
      persist({ popoTimes: next });
      return next;
    });
    persist({ popoCounts: { ...popoCounts, [dogId]: (popoCounts[dogId] || 0) + 1 } });
  };

  // ─── ACTIVE → EVALUATING ───
  const handleEndWalk = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const initEvals: Record<string, { traffic: string | null; triggers: string[]; stool: number | null }> = {};
    selectedDogIds.forEach((id) => {
      initEvals[id] = { traffic: null, triggers: [], stool: null };
    });
    setEvals(initEvals);
    setEvalIndex(0);
    setEvalStep("traffic");
    setTriggers([]);
    setMainPhase("evaluating");
  };

  // ─── PER-DOG EVALUATION ───
  const currentDogId = selectedDogIds[evalIndex];
  const currentDog = allDogs.find((d) => d.id === currentDogId);
  const hasPopo = (popoCounts[currentDogId] || 0) > 0;

  const handleEvalTraffic = (light: string) => {
    setEvals((prev) => ({ ...prev, [currentDogId]: { ...prev[currentDogId], traffic: light } }));
    if (light !== "green") {
      setTriggers([]);
      setEvalStep("triggers");
    } else if (hasPopo) {
      setEvalStep("digestive");
    } else {
      advanceEval();
    }
  };

  const toggleTrigger = (tag: string) => {
    setTriggers((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTrigger = () => {
    const trimmed = customTrigger.trim();
    if (trimmed && !triggers.includes(trimmed)) setTriggers((prev) => [...prev, trimmed]);
    setCustomTrigger("");
    setShowCustomTrigger(false);
  };

  const handleEvalTriggersDone = () => {
    setEvals((prev) => ({ ...prev, [currentDogId]: { ...prev[currentDogId], triggers } }));
    if (hasPopo) {
      setEvalStep("digestive");
    } else {
      advanceEval();
    }
  };

  const handleEvalStool = (rating: number) => {
    setEvals((prev) => ({ ...prev, [currentDogId]: { ...prev[currentDogId], stool: rating } }));
    advanceEval();
  };

  const advanceEval = () => {
    if (evalIndex + 1 < selectedDogIds.length) {
      setEvalIndex((prev) => prev + 1);
      setEvalStep("traffic");
      setTriggers([]);
    } else {
      // All dogs evaluated → save
      saveAllWalks();
    }
  };

  // ─── SAVE ───
  const saveAllWalks = async () => {
    setSaving(true);
    const endTime = new Date();
    const endTimeStr = endTime.toISOString();
    const startTime = new Date(walkStartTime);
    const durationSec = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    for (const dogId of selectedDogIds) {
      const e = evals[dogId] || { traffic: null, triggers: [], stool: null };
      await supabase.from("walks").insert({
        dog_id: dogId,
        start_time: walkStartTime,
        end_time: endTimeStr,
        duration_sec: durationSec,
        pipi_count: pipiCounts[dogId] || 0,
        popo_count: popoCounts[dogId] || 0,
        traffic_light: e.traffic,
        trigger_tags: e.triggers,
        stool_rating: e.stool,
      });

      if (e.stool) {
        await supabase.from("digestive_logs").insert({
          dog_id: dogId,
          fecha: new Date().toISOString().slice(0, 10),
          stool_type: e.stool,
        });
      }
    }

    // Streak
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", userId).eq("streak_type", "walk").maybeSingle();
    if (streak) {
      const s = streak as { id: string; last_activity_date: string; current_streak: number; longest_streak: number };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (s.last_activity_date !== today) {
        if (s.last_activity_date === yesterdayStr) {
          const newStreak = s.current_streak + 1;
          await supabase.from("user_streaks").update({
            current_streak: newStreak,
            longest_streak: Math.max(s.longest_streak, newStreak),
            last_activity_date: today,
          }).eq("id", s.id);
        } else {
          await supabase.from("user_streaks").update({ current_streak: 1, last_activity_date: today }).eq("id", s.id);
        }
      }
    } else {
      await supabase.from("user_streaks").insert({
        user_id: userId, streak_type: "walk", current_streak: 1, longest_streak: 1, last_activity_date: today,
      });
    }

    localStorage.removeItem(STORAGE_KEY);
    setMainPhase("done");
    setSaving(false);
  };

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;

  const closeAfterDone = () => {
    localStorage.removeItem(STORAGE_KEY);
    onDone();
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // ─── RENDER ───

  if (saving) {
    return (
      <div className="card-soft rounded-[1.5rem] p-8 flex flex-col items-center gap-4 border-2 border-primary-200 dark:border-primary-800">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Guardando paseo{selectedDogIds.length > 1 ? "s" : ""}...</p>
      </div>
    );
  }

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-5 bg-white dark:bg-zinc-900 border-2 border-primary-200 dark:border-primary-800">
      {/* ═══ SELECTING ═══ */}
      {mainPhase === "selecting" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">¿Quién va al paseo?</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
          <div className="space-y-2">
            {allDogs.map((dog) => {
              const selected = selectedDogIds.includes(dog.id);
              return (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDogIds((prev) => selected ? prev.filter((id) => id !== dog.id) : [...prev, dog.id])}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    selected ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50" : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    selected ? "bg-primary-500 border-primary-500" : "border-zinc-300 dark:border-zinc-600"
                  }`}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{dog.nombre}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={startWalk}
            disabled={selectedDogIds.length === 0}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/25"
          >
            COMENZAR PASEO{selectedDogIds.length > 0 ? ` (${selectedDogIds.length})` : ""}
          </button>
        </div>
      )}

      {/* ═══ ACTIVE ═══ */}
      {mainPhase === "active" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center py-2">
            <p className="text-5xl font-bold tabular-nums text-primary-600 dark:text-primary-400">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {selectedDogIds.length} perro{selectedDogIds.length > 1 ? "s" : ""} paseando
            </p>
          </div>

          {allDogs.filter((d) => selectedDogIds.includes(d.id)).map((dog) => (
            <div key={dog.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{dog.nombre}</p>
              <div className="flex gap-3">
                <button onClick={() => addPipi(dog.id)}
                  className="flex-1 flex flex-col items-center gap-1 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-xl p-3 active:scale-95 transition-transform">
                  <Droplets className="w-6 h-6 text-warning-500" />
                  <span className="text-xs font-semibold text-warning-600 dark:text-warning-400">Pipí</span>
                  {(pipiCounts[dog.id] || 0) > 0 && (
                    <span className="bg-warning-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pipiCounts[dog.id]}</span>
                  )}
                </button>
                <button onClick={() => addPopo(dog.id)}
                  className="flex-1 flex flex-col items-center gap-1 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl p-3 active:scale-95 transition-transform">
                  <BadgeCheck className="w-6 h-6 text-secondary-500" />
                  <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400">Popó</span>
                  {(popoCounts[dog.id] || 0) > 0 && (
                    <span className="bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{popoCounts[dog.id]}</span>
                  )}
                </button>
              </div>
              {/* Event timestamps */}
              {((pipiTimes[dog.id]?.length || 0) > 0 || (popoTimes[dog.id]?.length || 0) > 0) && (
                <div className="text-[10px] text-zinc-400 space-y-0.5 mt-2">
                  {pipiTimes[dog.id]?.map((t, i) => (
                    <div key={`p-${i}`} className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5 text-warning-400" /> Pipí #{i + 1} — {formatTime(t)}</div>
                  ))}
                  {popoTimes[dog.id]?.map((t, i) => (
                    <div key={`o-${i}`} className="flex items-center gap-1"><BadgeCheck className="w-2.5 h-2.5 text-secondary-400" /> Popó #{i + 1} — {formatTime(t)}</div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button onClick={handleEndWalk}
            className="w-full bg-danger-600 hover:bg-danger-700 text-white rounded-2xl py-4 font-bold text-lg transition-colors active:scale-[0.98]">
            <Flag className="w-5 h-5 inline mr-2" />
            TERMINAR PASEO
          </button>
        </div>
      )}

      {/* ═══ EVALUATING (per dog) ═══ */}
      {mainPhase === "evaluating" && currentDog && (
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-xs text-zinc-400">
              Evaluando {evalIndex + 1} de {selectedDogIds.length}
            </p>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">{currentDog.nombre}</h3>
          </div>

          {/* Step: traffic */}
          {evalStep === "traffic" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-zinc-500">¿Cómo estuvo su paseo?</p>
              <div className="flex gap-4 justify-center">
                {[
                  { color: "bg-secondary-500", label: "Calma", value: "green" },
                  { color: "bg-warning-500", label: "Tensión", value: "yellow" },
                  { color: "bg-danger-500", label: "Estrés", value: "red" },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => handleEvalTraffic(opt.value)}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all">
                    <div className={`w-14 h-14 rounded-full ${opt.color} shadow-lg`} />
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: triggers */}
          {evalStep === "triggers" && (
            <div className="space-y-5">
              <p className="text-sm text-zinc-500 text-center">¿Qué causó la reacción?</p>
              <div className="grid grid-cols-3 gap-3">
                {TRIGGER_OPTIONS.map((opt) => {
                  const selected = triggers.includes(opt.tag);
                  return (
                    <button key={opt.tag} onClick={() => toggleTrigger(opt.tag)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                        selected ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm" : "border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
                      }`}>
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className={`text-[10px] font-semibold leading-tight text-center ${selected ? "text-primary-700 dark:text-primary-300" : "text-zinc-600 dark:text-zinc-400"}`}>{opt.tag}</span>
                    </button>
                  );
                })}
                <button onClick={() => setShowCustomTrigger(!showCustomTrigger)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    showCustomTrigger ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50" : "border-dashed border-zinc-300 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/20"
                  }`}>
                  <span className="text-3xl">✏️</span>
                  <span className="text-[10px] font-semibold text-zinc-500 leading-tight text-center">Otro</span>
                </button>
              </div>
              {showCustomTrigger && (
                <div className="flex gap-2">
                  <input type="text" value={customTrigger} onChange={(e) => setCustomTrigger(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomTrigger()}
                    placeholder="Describe qué más causó la reacción..."
                    className="flex-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20" autoFocus />
                  <button onClick={addCustomTrigger} className="rounded-xl bg-primary-600 text-white px-4 py-3 text-sm font-bold active:scale-95"><PenLine className="w-4 h-4" /></button>
                </div>
              )}
              {triggers.filter((t) => !TRIGGER_OPTIONS.some((o) => o.tag === t)).length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {triggers.filter((t) => !TRIGGER_OPTIONS.some((o) => o.tag === t)).map((t) => (
                    <span key={t} className="flex items-center gap-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs px-3 py-1.5 rounded-full">
                      {t}
                      <button onClick={() => setTriggers((prev) => prev.filter((x) => x !== t))} className="ml-1 text-primary-400 hover:text-danger-500">×</button>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={handleEvalTriggersDone}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-4 font-bold text-lg active:scale-[0.98]">
                Continuar
              </button>
            </div>
          )}

          {/* Step: digestive */}
          {evalStep === "digestive" && (
            <div className="space-y-6 text-center">
              <p className="text-sm text-zinc-500">¿Cómo estaban las heces de {currentDog.nombre}?</p>
              <div className="flex gap-2 justify-center">
                {[
                  { n: 1, e: "💎", l: "Dura" },
                  { n: 2, e: "🟤", l: "Forma" },
                  { n: 3, e: "✅", l: "Normal" },
                  { n: 4, e: "💩", l: "Blanda" },
                  { n: 5, e: "💧", l: "Líquida" },
                ].map((s) => (
                  <button key={s.n} onClick={() => handleEvalStool(s.n)}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent hover:border-primary-400 active:scale-95">
                    <span className="text-2xl">{s.e}</span>
                    <span className="text-[10px] text-zinc-500">{s.l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ DONE ═══ */}
      {mainPhase === "done" && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center mx-auto">
            <Flag className="w-8 h-8 text-secondary-500" />
          </div>
          <h3 className="text-lg font-bold text-secondary-600 dark:text-secondary-400">¡Paseo guardado!</h3>
          <p className="text-sm text-zinc-500">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} · {selectedDogIds.length} perro{selectedDogIds.length > 1 ? "s" : ""}
          </p>
          {/* Per-dog summary */}
          <div className="space-y-2 text-left">
            {allDogs.filter((d) => selectedDogIds.includes(d.id)).map((dog) => {
              const e = evals[dog.id];
              const trafficLabel = e?.traffic === "green" ? "Calma" : e?.traffic === "yellow" ? "Tensión" : e?.traffic === "red" ? "Estrés" : "—";
              return (
                <div key={dog.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-xs">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">{dog.nombre}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-zinc-500">
                    <span>Semáforo: <span className={e?.traffic === "green" ? "text-secondary-600" : e?.traffic === "yellow" ? "text-warning-600" : "text-danger-600"}>{trafficLabel}</span></span>
                    <span>Pipí: {pipiCounts[dog.id] || 0}</span>
                    <span>Popó: {popoCounts[dog.id] || 0}</span>
                    {e?.stool && <span>Heces: {e.stool}/5</span>}
                  </div>
                  {((pipiTimes[dog.id]?.length || 0) > 0 || (popoTimes[dog.id]?.length || 0) > 0) && (
                    <div className="mt-1.5 space-y-0.5 text-[10px] text-zinc-400">
                      {pipiTimes[dog.id]?.map((t, i) => (
                        <div key={`dp-${i}`}>Pipí #{i + 1}: {formatTime(t)}</div>
                      ))}
                      {popoTimes[dog.id]?.map((t, i) => (
                        <div key={`do-${i}`}>Popó #{i + 1}: {formatTime(t)}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={closeAfterDone} className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-3 font-bold text-sm active:scale-[0.98]">
            Listo
          </button>
        </div>
      )}
    </div>
  );
}
