"use client";

import { useState, useEffect } from "react";
import { AgilityObstaclePicker } from "@/components/AgilityObstaclePicker";
import type { Dog, AgilityObstacle, AgilityFoulType, AgilitySessionType } from "@/types/database";
import { Play, Zap, X, Settings } from "lucide-react";

interface Props {
  dog: Dog;
  onStart: (config: SessionConfig) => void;
  onClose: () => void;
  onQuickStart?: (config: SessionConfig) => void;
}

export interface SessionConfig {
  sessionTypeId: string | null;
  difficulty: string;
  selectedObstacles: AgilityObstacle[];
  penaltySettings: Record<string, number>;
  sessionTypeName?: string;
}

export function AgilitySetup({ dog, onStart, onClose, onQuickStart }: Props) {
  const [sessionTypeId, setSessionTypeId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("principiante");
  const [sessionTypes, setSessionTypes] = useState<AgilitySessionType[]>([]);
  const [foulTypes, setFoulTypes] = useState<AgilityFoulType[]>([]);
  const [penaltySettings, setPenaltySettings] = useState<Record<string, number>>({});
  const [showPenaltyConfig, setShowPenaltyConfig] = useState(false);
  const [selectedObstacles, setSelectedObstacles] = useState<AgilityObstacle[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasPreset, setHasPreset] = useState(false);
  const [presetLoading, setPresetLoading] = useState(true);

  // Load session types and foul types
  useEffect(() => {
    Promise.all([
      fetch("/api/agility/session-types").then((r) => r.json()),
      fetch("/api/agility/fouls").then((r) => r.json()),
    ])
      .then(([typesRes, foulsRes]) => {
        if (typesRes.sessionTypes) setSessionTypes(typesRes.sessionTypes);
        if (foulsRes.foulTypes) {
          setFoulTypes(foulsRes.foulTypes);
          const defaults: Record<string, number> = {};
          foulsRes.foulTypes.forEach((f: AgilityFoulType) => {
            defaults[f.id] = f.default_time_penalty_seconds;
          });
          setPenaltySettings(defaults);
        }
      })
      .catch((err) => {
        console.error("Error loading agility config:", err);
        setLoadError("Error cargando configuración. Intenta recargar la página.");
      });
  }, []);

  // Check for preset when sessionTypeId changes
  useEffect(() => {
    if (!sessionTypeId || !dog?.id) {
      setHasPreset(false);
      setPresetLoading(false);
      return;
    }
    setPresetLoading(true);
    fetch(`/api/agility/presets?dog_id=${dog.id}&session_type_id=${sessionTypeId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.preset) {
          setHasPreset(true);
          // Preload obstacles from preset
          const presetAny = j.preset as any;
          const obsIds = Array.isArray(presetAny.obstacles)
            ? presetAny.obstacles
            : Array.isArray(presetAny.standard_obstacles)
            ? presetAny.standard_obstacles
            : [];
          if (obsIds.length > 0) {
            fetch("/api/agility/obstacles")
              .then((r) => r.json())
              .then((j2) => {
                if (j2.obstacles) {
                  const obstacleIds = obsIds.map((o: any) => o.obstacle_id || o);
                  const matched = j2.obstacles.filter((o: AgilityObstacle) => obstacleIds.includes(o.id));
                  setSelectedObstacles(matched);
                }
              });
          }
          if (presetAny.difficulty_level) {
            setDifficulty(presetAny.difficulty_level);
          }
        } else {
          setHasPreset(false);
          setSelectedObstacles([]);
        }
        setPresetLoading(false);
      })
      .catch(() => {
        setHasPreset(false);
        setPresetLoading(false);
      });
  }, [sessionTypeId, dog.id]);

  const handleStart = () => {
    const sessionType = sessionTypes.find((s) => s.id === sessionTypeId);
    onStart({
      sessionTypeId,
      difficulty,
      selectedObstacles,
      penaltySettings,
      sessionTypeName: sessionType?.name,
    });
  };

  const handleQuickStart = () => {
    const sessionType = sessionTypes.find((s) => s.id === sessionTypeId);
    if (onQuickStart) {
      onQuickStart({
        sessionTypeId,
        difficulty,
        selectedObstacles,
        penaltySettings,
        sessionTypeName: sessionType?.name,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Configurar entrenamiento</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {loadError && (
        <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs">
          {loadError}
        </div>
      )}

      {/* Quick start shortcut */}
      {hasPreset && !presetLoading && (
        <button
          onClick={handleQuickStart}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-warning-400 to-warning-500 text-white font-bold text-sm active:scale-[0.97] transition-all shadow-lg shadow-warning-500/25"
        >
          <Zap className="w-5 h-5 fill-current" />
          ⚡ Entrenamiento rápido (usar config guardada)
        </button>
      )}

      {/* Session Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
          <span>🎯</span> Tipo de sesión
        </label>
        {sessionTypes.length === 0 ? (
          <p className="text-xs text-zinc-400 py-2">Cargando tipos de sesión...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {sessionTypes.map((st) => {
              const isActive = sessionTypeId === st.id;
              const emojiMap: Record<string, string> = {
                'entrenamiento-libre': '🎾',
                'circuito-estandar': '🏆',
                'jumpers': '⚡',
                'agility-contacto': '🐾',
                'snooker': '🎱',
                'gamblers': '🎲',
                'steeplechase': '🏃',
                'relevos': '👯',
                'power-speed': '💪',
                'secuencia-tecnica': '🧩',
              };
              return (
                <button
                  key={st.id}
                  onClick={() => setSessionTypeId(st.id)}
                  className={`p-3 rounded-xl border-2 text-left text-xs transition-all active:scale-[0.97] ${
                    isActive
                      ? "border-accent-400 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-950/40 dark:to-accent-900/40 shadow-md"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{emojiMap[st.slug] || '🏁'}</span>
                    <span className={`font-bold ${isActive ? 'text-accent-700 dark:text-accent-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {st.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 pl-5">{st.description}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
          <span>📊</span> Nivel
        </label>
        <div className="flex gap-2">
          {[
            { key: "principiante", label: "Principiante", emoji: "🌱", color: "bg-secondary-500" },
            { key: "intermedio", label: "Intermedio", emoji: "🔥", color: "bg-warning-500" },
            { key: "avanzado", label: "Avanzado", emoji: "👑", color: "bg-danger-500" },
          ].map((lvl) => {
            const isActive = difficulty === lvl.key;
            return (
              <button
                key={lvl.key}
                onClick={() => setDifficulty(lvl.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all active:scale-[0.97] flex flex-col items-center gap-0.5 ${
                  isActive
                    ? `${lvl.color} text-white shadow-lg`
                    : `bg-white dark:bg-zinc-900 text-zinc-500 border-2 border-zinc-100 dark:border-zinc-800`
                }`}
              >
                <span className="text-base">{lvl.emoji}</span>
                <span>{lvl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Penalty config */}
      <div className="space-y-2">
        <button
          onClick={() => setShowPenaltyConfig(!showPenaltyConfig)}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <span className="text-sm">⚙️</span>
          <span>Penalizaciones por defecto</span>
          <span className={`transition-transform ${showPenaltyConfig ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showPenaltyConfig && (
          <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
            {foulTypes.length === 0 ? (
              <p className="text-xs text-zinc-400">Cargando tipos de faltas...</p>
            ) : (
              foulTypes.map((ft) => (
                <div key={ft.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{ft.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">+</span>
                    <input
                      type="number"
                      value={penaltySettings[ft.id] ?? ft.default_time_penalty_seconds}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setPenaltySettings((prev) => ({ ...prev, [ft.id]: val }));
                      }}
                      className="w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-1 text-center text-xs"
                    />
                    <span className="text-zinc-400">seg</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Obstacles */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
          <span>🚧</span> Obstáculos del circuito
          {selectedObstacles.length > 0 && (
            <span className="text-[10px] text-zinc-400 ml-1">({selectedObstacles.length})</span>
          )}
        </label>
        <AgilityObstaclePicker
          selected={selectedObstacles}
          onChange={setSelectedObstacles}
        />
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={selectedObstacles.length === 0}
        className="w-full bg-gradient-to-r from-accent-500 via-accent-600 to-accent-700 text-white rounded-2xl py-4 font-black text-lg disabled:opacity-40 active:scale-[0.97] transition-all shadow-xl shadow-accent-500/30 flex items-center justify-center gap-2"
      >
        <span className="text-2xl">🚀</span>
        <span>INICIAR CIRCUITO</span>
      </button>
    </div>
  );
}
