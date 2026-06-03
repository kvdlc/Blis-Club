"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Droplets, BadgeCheck, Flag, PawPrint, PenLine } from "lucide-react";

type Phase = "active" | "evaluate" | "triggers" | "digestive" | "done";

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

export default function WalkPage() {
  const router = useRouter();
  const supabase = createClient();

  const [phase, setPhase] = useState<Phase>("active");
  const [seconds, setSeconds] = useState(0);
  const [pipiCount, setPipiCount] = useState(0);
  const [popoCount, setPopoCount] = useState(0);
  const [trafficLight, setTrafficLight] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState("");
  const [showCustomTrigger, setShowCustomTrigger] = useState(false);
  const [stoolRating, setStoolRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [dogName, setDogName] = useState<string>("");

  const startTime = useRef(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Cargar nombre del perro
    const loadDog = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dog } = await supabase.from("dogs").select("nombre").eq("owner_id", user.id).limit(1).single();
        if (dog) setDogName((dog as { nombre: string }).nombre);
      }
    };
    loadDog();

    intervalRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime.current.getTime()) / 1000));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleEndWalk = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("evaluate");
  };

  const handleTrafficSelect = async (light: string) => {
    setTrafficLight(light);
    if (light === "green") {
      if (popoCount > 0) { setPhase("digestive"); }
      else { await saveWalk(light, [], null); }
    } else {
      setPhase("triggers");
    }
  };

  const toggleTrigger = (tag: string) => {
    setTriggers((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const addCustomTrigger = () => {
    const trimmed = customTrigger.trim();
    if (trimmed && !triggers.includes(trimmed)) {
      setTriggers((prev) => [...prev, trimmed]);
    }
    setCustomTrigger("");
    setShowCustomTrigger(false);
  };

  const handleTriggersDone = () => {
    if (popoCount > 0) { setPhase("digestive"); }
    else { saveWalk(trafficLight!, triggers, null); }
  };

  const handleStoolSelect = (rating: number) => {
    setStoolRating(rating);
    saveWalk(trafficLight!, triggers, rating);
  };

  const saveWalk = async (light: string, triggerList: string[], stool: number | null) => {
    setSaving(true);
    const endTime = new Date();
    const durationSec = Math.floor((endTime.getTime() - startTime.current.getTime()) / 1000);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { data: dog } = await supabase.from("dogs").select("id").eq("owner_id", user.id).limit(1).single();
    if (!dog) { setSaving(false); return; }

    await supabase.from("walks").insert({
      dog_id: (dog as { id: string }).id,
      start_time: startTime.current.toISOString(),
      end_time: endTime.toISOString(),
      duration_sec: durationSec,
      pipi_count: pipiCount,
      popo_count: popoCount,
      traffic_light: light,
      trigger_tags: triggerList,
      stool_rating: stool,
    });

    if (stool) {
      await supabase.from("digestive_logs").insert({
        dog_id: (dog as { id: string }).id,
        fecha: new Date().toISOString().slice(0, 10),
        stool_type: stool,
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).eq("streak_type", "walk").maybeSingle();

    if (streak) {
      const s = streak as { id: string; last_activity_date: string; current_streak: number; longest_streak: number };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (s.last_activity_date === today) {
        // Already logged today
      } else if (s.last_activity_date === yesterdayStr) {
        const newStreak = s.current_streak + 1;
        await supabase.from("user_streaks").update({
          current_streak: newStreak,
          longest_streak: Math.max(s.longest_streak, newStreak),
          last_activity_date: today,
        }).eq("id", s.id);
      } else {
        await supabase.from("user_streaks").update({ current_streak: 1, last_activity_date: today }).eq("id", s.id);
      }
    } else {
      await supabase.from("user_streaks").insert({
        user_id: user.id, streak_type: "walk", current_streak: 1, longest_streak: 1, last_activity_date: today,
      });
    }

    setPhase("done");
    setSaving(false);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex flex-col min-h-[80vh] relative">
      {/* ═══ LOADING OVERLAY ═══ */}
      {saving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center gap-5 text-center px-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center">
                <PawPrint className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Analizando resultados...</p>
              {dogName && <p className="text-sm text-white/70">Guardando paseo de {dogName}</p>}
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ PHASE: ACTIVE ═══ */}
      {phase === "active" && (
        <>
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <p className="text-6xl font-bold tabular-nums text-primary-600 dark:text-primary-400">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>

            <div className="flex gap-6">
              <button
                onClick={() => setPipiCount((c) => c + 1)}
                className="flex flex-col items-center gap-2 bg-warning-50 dark:bg-warning-950 border-2 border-warning-300 dark:border-warning-700 rounded-2xl p-6 active:scale-95 transition-transform min-w-[100px]"
              >
                <Droplets className="w-8 h-8 text-warning-500" />
                <span className="text-xs font-semibold text-warning-600">Pipí</span>
                {pipiCount > 0 && (
                  <span className="bg-warning-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{pipiCount}</span>
                )}
              </button>
              <button
                onClick={() => setPopoCount((c) => c + 1)}
                className="flex flex-col items-center gap-2 bg-secondary-50 dark:bg-secondary-950 border-2 border-secondary-300 dark:border-secondary-700 rounded-2xl p-6 active:scale-95 transition-transform min-w-[100px]"
              >
                <BadgeCheck className="w-8 h-8 text-secondary-500" />
                <span className="text-xs font-semibold text-secondary-600">Popó</span>
                {popoCount > 0 && (
                  <span className="bg-secondary-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{popoCount}</span>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleEndWalk}
            className="w-full bg-danger-600 hover:bg-danger-700 text-white rounded-2xl py-4 font-bold text-lg transition-colors active:scale-[0.98]"
          >
            <Flag className="w-5 h-5 inline mr-2" />
            TERMINAR PASEO
          </button>
        </>
      )}

      {/* ═══ PHASE: EVALUATE ═══ */}
      {phase === "evaluate" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">¿Cómo estuvo el paseo?</h2>
          <div className="flex gap-4">
            {[
              { color: "bg-secondary-500", label: "Calma", value: "green", ring: "ring-secondary-300" },
              { color: "bg-warning-500", label: "Tensión", value: "yellow", ring: "ring-warning-300" },
              { color: "bg-danger-500", label: "Estrés", value: "red", ring: "ring-danger-300" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleTrafficSelect(opt.value)}
                className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:scale-105 active:scale-95 transition-all"
              >
                <div className={`w-16 h-16 rounded-full ${opt.color} shadow-lg`} />
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PHASE: TRIGGERS (rediseñado con tarjetas + emojis) ═══ */}
      {phase === "triggers" && (
        <div className="flex-1 flex flex-col space-y-6 overflow-auto">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 text-center">
            ¿Qué causó la reacción?
          </h2>
          <div className="grid grid-cols-3 gap-3 px-2">
            {TRIGGER_OPTIONS.map((opt) => {
              const selected = triggers.includes(opt.tag);
              return (
                <button
                  key={opt.tag}
                  onClick={() => toggleTrigger(opt.tag)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                    selected
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm"
                      : "border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className={`text-[10px] font-semibold leading-tight text-center ${selected ? "text-primary-700 dark:text-primary-300" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {opt.tag}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setShowCustomTrigger(!showCustomTrigger)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                showCustomTrigger
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm"
                  : "border-dashed border-zinc-300 dark:border-zinc-700 bg-white/40 dark:bg-zinc-900/20"
              }`}
            >
              <span className="text-3xl">✏️</span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 leading-tight text-center">Otro</span>
            </button>
          </div>

          {showCustomTrigger && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomTrigger()}
                placeholder="Describe qué más causó la reacción..."
                className="flex-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                autoFocus
              />
              <button
                onClick={addCustomTrigger}
                className="rounded-xl bg-primary-600 text-white px-4 py-3 text-sm font-bold active:scale-95 transition-transform"
              >
                <PenLine className="w-4 h-4" />
              </button>
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

          <button
            onClick={handleTriggersDone}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-4 font-bold text-lg"
          >
            Continuar
          </button>
        </div>
      )}

      {/* ═══ PHASE: DIGESTIVE ═══ */}
      {phase === "digestive" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 text-center">
            ¿Cómo estaban las heces?
          </h2>
          <div className="flex gap-2">
            {[
              { n: 1, e: "💎", l: "Dura" },
              { n: 2, e: "🟤", l: "Forma" },
              { n: 3, e: "✅", l: "Normal" },
              { n: 4, e: "💩", l: "Blanda" },
              { n: 5, e: "💧", l: "Líquida" },
            ].map((s) => (
              <button
                key={s.n}
                onClick={() => handleStoolSelect(s.n)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                  stoolRating === s.n
                    ? "bg-primary-100 dark:bg-primary-950 border-2 border-primary-500"
                    : "bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent"
                }`}
              >
                <span className="text-2xl">{s.e}</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{s.l}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PHASE: DONE ═══ */}
      {phase === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Flag className="w-10 h-10 text-secondary-500" />
          </div>
          <h2 className="text-xl font-bold text-secondary-600 dark:text-secondary-400">
            ¡Paseo guardado!
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} · {pipiCount} pipí · {popoCount} popó
          </p>
          {trafficLight && (
            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
              trafficLight === "green" ? "bg-secondary-100 text-secondary-700" :
              trafficLight === "yellow" ? "bg-warning-100 text-warning-700" :
              "bg-danger-100 text-danger-700"
            }`}>
              {trafficLight === "green" ? "Paseo en calma" : trafficLight === "yellow" ? "Paseo tenso" : "Paseo estresante"}
            </span>
          )}
          <button
            onClick={() => router.push("/guau/app/tracker")}
            className="w-full max-w-xs bg-primary-600 hover:bg-primary-700 text-white rounded-2xl py-4 font-bold"
          >
            Ver progreso
          </button>
        </div>
      )}
    </div>
  );
}
