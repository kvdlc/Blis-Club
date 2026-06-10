"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Dog, AgilityObstacle, AgilityFoulType, AgilitySessionType } from "@/types/database";
import { Play, Square, RotateCcw, X, ChevronUp, ChevronDown } from "lucide-react";

export interface SessionConfig {
  sessionTypeId: string | null;
  difficulty: string;
  selectedObstacles: AgilityObstacle[];
  penaltySettings: Record<string, number>;
  sessionTypeName?: string;
}

export interface FoulEntry {
  id: string;
  obstacle_id: string;
  foul_type_id: string;
  lap: number;
  timestamp: number;
}

export interface RunData {
  lapTimes: number[];
  rawTime: number;
  netTime: number;
  fouls: FoulEntry[];
  photos: string[];
  startTime: string;
  config: SessionConfig;
}

interface Props {
  dog: Dog;
  userId: string;
  config: SessionConfig;
  onFinish: (data: RunData) => void;
  onClose: () => void;
}

const STORAGE_KEY = "blis_active_agility_run";

export function AgilityRun({ dog, userId, config, onFinish, onClose }: Props) {
  const router = useRouter();
  const [startTime, setStartTime] = useState<string>("");
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [elapsedLap, setElapsedLap] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fouls, setFouls] = useState<FoulEntry[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [foulTypes, setFoulTypes] = useState<AgilityFoulType[]>([]);
  const [showFoulSelector, setShowFoulSelector] = useState<AgilityObstacle | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load foul types
  useEffect(() => {
    fetch("/api/agility/fouls")
      .then((r) => r.json())
      .then((j) => { if (j.foulTypes) setFoulTypes(j.foulTypes); });
  }, []);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.dogId === dog.id && data.config?.sessionTypeId === config.sessionTypeId) {
          setStartTime(data.startTime || "");
          setElapsedTotal(data.elapsedTotal || 0);
          setElapsedLap(data.elapsedLap || 0);
          setLapTimes(data.lapTimes || []);
          setFouls(data.fouls || []);
          setPhotos(data.photos || []);
          if (data.startTime) setIsRunning(true);
        }
      }
    } catch { /* ignore */ }
  }, [dog.id, config.sessionTypeId]);

  // Timer
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const start = new Date(startTime).getTime();
        const total = Math.floor((now - start) / 1000);
        const lastLapEnd = lapTimes.reduce((a, b) => a + b, 0);
        setElapsedTotal(total);
        setElapsedLap(total - lastLapEnd);
      }, 100);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isRunning, startTime, lapTimes]);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dogId: dog.id,
        config,
        startTime,
        elapsedTotal,
        elapsedLap,
        lapTimes,
        fouls,
        photos,
      }));
    } catch { /* ignore */ }
  }, [dog.id, config, startTime, elapsedTotal, elapsedLap, lapTimes, fouls, photos]);

  useEffect(() => { persist(); }, [persist]);

  const startTimer = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setElapsedTotal(0);
    setElapsedLap(0);
    setIsRunning(true);
  };

  const toggleTimer = () => setIsRunning((p) => !p);

  const markLap = () => {
    if (!isRunning) return;
    const lap = elapsedLap;
    setLapTimes((prev) => [...prev, lap]);
    setElapsedLap(0);
  };

  const handleEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    localStorage.removeItem(STORAGE_KEY);

    const totalPenalty = fouls.reduce((sum, f) => {
      const penalty = config.penaltySettings[f.foul_type_id] ?? 5;
      return sum + penalty;
    }, 0);

    onFinish({
      lapTimes,
      rawTime: elapsedTotal,
      netTime: elapsedTotal + totalPenalty,
      fouls,
      photos,
      startTime,
      config,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  // Default foul type by obstacle category
  const getDefaultFoulType = (obstacle: AgilityObstacle): string => {
    const mapping: Record<string, string> = {
      contacto: "falta-contacto",
      salto: "derribo",
      slalom: "slalom-incompleto",
      tunel: "negativa",
      entrenamiento: "negativa",
    };
    const targetSlug = mapping[obstacle.category] || "negativa";
    const ft = foulTypes.find((f) => f.slug === targetSlug);
    return ft?.id || foulTypes[0]?.id || "";
  };

  const addFoul = (obstacle: AgilityObstacle) => {
    const foulTypeId = getDefaultFoulType(obstacle);
    if (!foulTypeId) return;
    setFouls((prev) => [...prev, {
      id: Math.random().toString(36).slice(2),
      obstacle_id: obstacle.id,
      foul_type_id: foulTypeId,
      lap: lapTimes.length + 1,
      timestamp: Date.now(),
    }]);
  };

  const removeLastFoulForObstacle = (obstacleId: string) => {
    setFouls((prev) => {
      const idx = prev.findLastIndex((f) => f.obstacle_id === obstacleId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const countFoulsForObstacle = (obstacleId: string) => {
    return fouls.filter((f) => f.obstacle_id === obstacleId).length;
  };

  const handleLongPressStart = (obstacle: AgilityObstacle) => {
    const timer = setTimeout(() => {
      setShowFoulSelector(obstacle);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || photos.length >= 3) return;
    const newPhotos: string[] = [];
    for (let i = 0; i < Math.min(files.length, 3 - photos.length); i++) {
      const compressed = await compressImage(files[i], 1080, 0.8);
      if (compressed) newPhotos.push(compressed);
    }
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
  };

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculate penalty
  const totalPenaltySeconds = fouls.reduce((sum, f) => {
    return sum + (config.penaltySettings[f.foul_type_id] ?? 5);
  }, 0);

  const getFoulTypeName = (foulTypeId: string) => {
    return foulTypes.find((f) => f.id === foulTypeId)?.name || "Falta";
  };

  if (!startTime) {
    // Not started yet, show start screen
    return (
      <div className="card-soft rounded-[1.5rem] p-5 space-y-5 bg-white border-2 border-accent-200">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold text-zinc-800">Listo para entrenar</h3>
          <p className="text-sm text-zinc-500">{config.sessionTypeName || "Entrenamiento"} · {config.difficulty} · {config.selectedObstacles.length} obstáculos</p>
        </div>
        <button
          onClick={startTimer}
          className="w-full bg-gradient-to-r from-accent-500 via-accent-600 to-accent-700 text-white rounded-2xl py-5 font-black text-xl active:scale-[0.97] transition-all shadow-xl shadow-accent-500/30 flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          INICIAR CRONÓMETRO
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-700 font-bold text-sm"
        >
          Volver a configuración
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col h-screen">
      {/* Timer zone - 30% */}
      <div className="flex flex-col items-center justify-center py-4 border-b border-zinc-100">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tiempo Total</p>
        <p className="text-6xl font-black tabular-nums text-accent-600 leading-none">
          {formatTime(elapsedTotal)}
        </p>
        {lapTimes.length > 0 && (
          <div className="text-center mt-1">
            <p className="text-[10px] font-bold text-zinc-400">Vuelta {lapTimes.length + 1}</p>
            <p className="text-xl font-bold tabular-nums text-zinc-500">{formatTime(elapsedLap)}</p>
          </div>
        )}
      </div>

      {/* Controls - 15% */}
      <div className="p-3 grid grid-cols-2 gap-2 border-b border-zinc-100">
        <button
          onClick={toggleTimer}
          className={`py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${ isRunning ? "bg-warning-500 text-white shadow-lg shadow-warning-500/20" : "bg-accent-600 text-white shadow-lg shadow-accent-600/20" }`}
        >
          {isRunning ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          {isRunning ? "PAUSA" : "REANUDAR"}
        </button>
        <button
          onClick={markLap}
          className="py-3.5 rounded-2xl font-bold text-sm bg-zinc-100 text-zinc-700 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          VUELTA
        </button>
        <button
          onClick={handleEnd}
          className="col-span-2 py-3.5 rounded-2xl font-bold text-sm bg-danger-600 text-white active:scale-[0.97] transition-all shadow-lg shadow-danger-600/20 flex items-center justify-center gap-2"
        >
          <Square className="w-5 h-5 fill-current" />
          🏁 TERMINAR ENTRENAMIENTO
        </button>
      </div>

      {/* Config summary - collapsible */}
      <div className="border-b border-zinc-100">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors"
        >
          <span>📋 {config.sessionTypeName || "Sesión"} · {config.difficulty} · {config.selectedObstacles.length} obstáculos</span>
          <span className="flex items-center gap-1">
            {totalPenaltySeconds > 0 && <span className="text-warning-600 font-bold">+{totalPenaltySeconds}s</span>}
            {showConfig ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </button>
        {showConfig && (
          <div className="px-3 pb-2 space-y-1 text-xs text-zinc-400">
            <p>Penalización base: +{Object.values(config.penaltySettings)[0] ?? 5}s por falta</p>
            <p>Faltas registradas: {fouls.length}</p>
            {!isRunning && (
              <button
                onClick={onClose}
                className="text-accent-600 font-semibold mt-1"
              >
                ✏️ Editar configuración (reiniciará timer)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Foul zone - remaining space */}
      <div className="flex-1 overflow-y-auto bg-red-50/60 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-red-700 flex items-center gap-1">
            <span>🚫</span> FALTAS
          </h3>
          <span className="text-xs font-bold text-red-600">{fouls.length} total</span>
        </div>

        {config.selectedObstacles.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">Sin obstáculos configurados</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {config.selectedObstacles.map((obs) => {
              const foulCount = countFoulsForObstacle(obs.id);
              return (
                <button
                  key={obs.id}
                  onClick={() => addFoul(obs)}
                  onMouseDown={() => handleLongPressStart(obs)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(obs)}
                  onTouchEnd={handleLongPressEnd}
                  className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all active:scale-[0.95] ${ foulCount > 0 ? "bg-red-100 border-red-300" : "bg-white border-zinc-200" }`}
                >
                  <span className="text-2xl">{CATEGORY_CONFIG[obs.category]?.emoji || "🏁"}</span>
                  <span className="text-[11px] font-bold leading-tight text-zinc-700">{obs.name}</span>
                  {foulCount > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {foulCount}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeLastFoulForObstacle(obs.id); }}
                        className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-[10px] active:scale-95"
                      >
                        −
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {fouls.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Registro de faltas</p>
            {fouls.map((f, idx) => (
              <div key={f.id} className="flex items-center justify-between text-xs bg-white rounded-lg px-2 py-1">
                <span className="text-zinc-600">
                  V{f.lap}: {config.selectedObstacles.find((o) => o.id === f.obstacle_id)?.name}
                </span>
                <span className="text-red-600 font-semibold">{getFoulTypeName(f.foul_type_id)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="p-3 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-500">Fotos ({photos.length}/3)</span>
        </div>
        <div className="flex gap-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center text-[8px]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-0.5 text-zinc-400 hover:bg-zinc-50 transition-colors"
            >
              <span className="text-lg">📷</span>
              <span className="text-[8px]">Añadir</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Foul selector modal (long press) */}
      {showFoulSelector && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowFoulSelector(null)}>
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-zinc-800">
              ¿Qué falta en {showFoulSelector.name}?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {foulTypes.map((ft) => (
                <button
                  key={ft.id}
                  onClick={() => {
                    setFouls((prev) => [...prev, {
                      id: Math.random().toString(36).slice(2),
                      obstacle_id: showFoulSelector.id,
                      foul_type_id: ft.id,
                      lap: lapTimes.length + 1,
                      timestamp: Date.now(),
                    }]);
                    setShowFoulSelector(null);
                  }}
                  className="p-3 rounded-xl border-2 border-zinc-100 text-left active:scale-[0.97] transition-all hover:border-accent-300"
                >
                  <span className="text-xs font-bold text-zinc-700">{ft.name}</span>
                  <p className="text-[10px] text-zinc-400">+{ft.default_time_penalty_seconds}s</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFoulSelector(null)}
              className="w-full py-3 rounded-xl bg-zinc-100 text-zinc-700 font-bold text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reuse category config from picker
const CATEGORY_CONFIG: Record<string, { emoji: string }> = {
  contacto: { emoji: "🐾" },
  salto: { emoji: "🦘" },
  slalom: { emoji: "〰️" },
  tunel: { emoji: "🌀" },
  entrenamiento: { emoji: "🎯" },
};
