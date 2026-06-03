"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AgilityObstaclePicker } from "@/components/AgilityObstaclePicker";
import { PhotoCollageEditor } from "@/components/PhotoCollageEditor";
import { toPng } from "html-to-image";
import type { Dog, AgilityObstacle, AgilityFoulType, AgilitySessionType } from "@/types/database";
import {
  Play, Square, RotateCcw, Settings, Camera, X, Check, Zap,
  ChevronLeft, Trophy, Share2, Download, ImagePlus, Video, Clapperboard
} from "lucide-react";

interface StoredSession {
  startTime: string;
  dogId: string;
  elapsedTotal: number;
  elapsedLap: number;
  lapTimes: number[];
  selectedObstacles: AgilityObstacle[];
  foulsMap: Record<string, number>;
  penaltySettings: Record<string, number>;
  sessionTypeId: string | null;
  difficulty: string;
  photos: string[];
}

interface Props {
  dog: Dog;
  userId: string;
  onClose: () => void;
}

const STORAGE_KEY = "blis_active_agility";

export function AgilityTimer({ dog, userId, onClose }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  const supabase = createClient();

  const [phase, setPhase] = useState<"config" | "active" | "done">("config");
  const [sessionTypeId, setSessionTypeId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("principiante");
  const [sessionTypes, setSessionTypes] = useState<AgilitySessionType[]>([]);
  const [foulTypes, setFoulTypes] = useState<AgilityFoulType[]>([]);
  const [penaltySettings, setPenaltySettings] = useState<Record<string, number>>({});
  const [showPenaltyConfig, setShowPenaltyConfig] = useState(false);

  const [startTime, setStartTime] = useState<string>("");
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [elapsedLap, setElapsedLap] = useState(0);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [selectedObstacles, setSelectedObstacles] = useState<AgilityObstacle[]>([]);
  const [foulsMap, setFoulsMap] = useState<Record<string, number>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [showCollageEditor, setShowCollageEditor] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load session types and foul types
  useEffect(() => {
    fetch("/api/agility/session-types")
      .then((r) => r.json())
      .then((j) => { if (j.sessionTypes) setSessionTypes(j.sessionTypes); });

    fetch("/api/agility/fouls")
      .then((r) => r.json())
      .then((j) => {
        if (j.foulTypes) {
          setFoulTypes(j.foulTypes);
          const defaults: Record<string, number> = {};
          j.foulTypes.forEach((f: AgilityFoulType) => {
            defaults[f.id] = f.default_time_penalty_seconds;
          });
          setPenaltySettings(defaults);
        }
      });
  }, []);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: StoredSession = JSON.parse(saved);
        setStartTime(data.startTime);
        setElapsedTotal(data.elapsedTotal);
        setElapsedLap(data.elapsedLap);
        setLapTimes(data.lapTimes || []);
        setSelectedObstacles(data.selectedObstacles || []);
        setFoulsMap(data.foulsMap || {});
        setPenaltySettings(data.penaltySettings || {});
        setSessionTypeId(data.sessionTypeId);
        setDifficulty(data.difficulty || "principiante");
        setPhotos(data.photos || []);
        setPhase("active");
      }
    } catch { /* ignore */ }
  }, []);

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

  const persist = useCallback((updates: Partial<StoredSession>) => {
    try {
      const base: StoredSession = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as any;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, ...updates }));
    } catch { /* ignore */ }
  }, []);

  const startSession = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    setElapsedTotal(0);
    setElapsedLap(0);
    setLapTimes([]);
    setPhase("active");
    setIsRunning(true);

    const data: StoredSession = {
      startTime: now,
      dogId: dog.id,
      elapsedTotal: 0,
      elapsedLap: 0,
      lapTimes: [],
      selectedObstacles,
      foulsMap,
      penaltySettings,
      sessionTypeId,
      difficulty,
      photos,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const markLap = () => {
    if (!isRunning) return;
    const lap = elapsedLap;
    setLapTimes((prev) => [...prev, lap]);
    setElapsedLap(0);
    persist({ lapTimes: [...lapTimes, lap] });
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const handleEndSession = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase("done");
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculate net time
  const totalFouls = Object.values(foulsMap).reduce((a, b) => a + b, 0);
  const totalPenaltySeconds = Object.entries(foulsMap).reduce((sum, [obsId, count]) => {
    // Map obstacle to foul type roughly; for simplicity, all regular obstacles use generic penalty
    // In a real app we'd track per-obstacle foul type; here we sum generic penalty per foul
    const genericPenalty = Object.values(penaltySettings)[0] ?? 5;
    return sum + count * genericPenalty;
  }, 0);

  const rawTime = elapsedTotal;
  const netTime = rawTime + totalPenaltySeconds;
  const isCleanRun = totalFouls === 0;
  const isDisqualified = false; // TODO: track wrong-course separately

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
  };

  const handleFoulsChange = (obstacleId: string, fouls: number) => {
    setFoulsMap((prev) => {
      const next = { ...prev, [obstacleId]: fouls };
      persist({ foulsMap: next });
      return next;
    });
  };

  const handleObstaclesChange = (obs: AgilityObstacle[]) => {
    setSelectedObstacles(obs);
    persist({ selectedObstacles: obs });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || photos.length >= 3) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < Math.min(files.length, 3 - photos.length); i++) {
      const file = files[i];
      // Compress image
      const compressed = await compressImage(file, 1080, 0.8);
      if (compressed) newPhotos.push(compressed);
    }
    const updated = [...photos, ...newPhotos].slice(0, 3);
    setPhotos(updated);
    persist({ photos: updated });
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
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    persist({ photos: updated });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("El video no puede superar los 10MB");
      return;
    }

    // Optional: check duration (we can't easily check on client without loading full video, 
    // but we'll warn user. Server/API can enforce if needed)
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreviewUrl(url);
  };

  const saveSession = async () => {
    setSaving(true);

    // Upload photos to Supabase Storage
    const photoUrls: string[] = [];
    for (const photo of photos) {
      try {
        const blob = await (await fetch(photo)).blob();
        const path = `agility/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("agility-photos")
          .upload(path, blob, { contentType: "image/jpeg", upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("agility-photos").getPublicUrl(path);
          photoUrls.push(urlData.publicUrl);
        }
      } catch (e) {
        console.error("Photo upload error:", e);
      }
    }

    // Upload video if exists
    let videoUrl: string | null = null;
    if (videoFile) {
      try {
        const path = `agility-videos/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("agility-photos")
          .upload(path, videoFile, { contentType: "video/mp4", upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("agility-photos").getPublicUrl(path);
          videoUrl = urlData.publicUrl;
        }
      } catch (e) {
        console.error("Video upload error:", e);
      }
    }

    const sessionType = sessionTypes.find((s) => s.id === sessionTypeId);

    const payload = {
      dog_id: dog.id,
      fecha: new Date().toISOString().slice(0, 10),
      activity_type: sessionType?.name || "Entrenamiento libre",
      duration_min: Math.ceil(rawTime / 60),
      circuit_time_seconds: rawTime,
      notes: `${lapTimes.length} vueltas. ${totalFouls} faltas totales.`,
      session_type_id: sessionTypeId,
      lesson_id: lessonId,
      difficulty_level: difficulty,
      fouls_total: totalFouls,
      clean_run: isCleanRun && !isDisqualified,
      time_fault: false,
      raw_time_seconds: rawTime,
      net_time_seconds: netTime,
      obstacles: selectedObstacles.map((o) => ({
        obstacle_id: o.id,
        used: true,
        fouls_count: foulsMap[o.id] ?? 0,
        notes: null,
      })),
      penalty_settings: Object.entries(penaltySettings).map(([foulTypeId, seconds]) => ({
        foul_type_id: foulTypeId,
        penalty_seconds: seconds,
      })),
      photo_urls: photoUrls,
      video_url: videoUrl,
    };

    try {
      const res = await fetch("/api/agility/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSession(json.session);
        // Check for new badges
        try {
          await fetch("/api/agility/check-badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dog_id: dog.id }),
          });
        } catch (e) {
          console.error("Badge check error:", e);
        }
        // If photos exist, show collage editor first
        if (photos.length > 0) {
          setShowCollageEditor(true);
        } else {
          // Generate share card
          setTimeout(() => generateShareCard(), 100);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const generateShareCard = async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 2 });
      setShareCardUrl(dataUrl);
    } catch (e) {
      console.error("Share card generation error:", e);
    }
  };

  const downloadShareCard = () => {
    if (!shareCardUrl) return;
    const link = document.createElement("a");
    link.download = `blis-agility-${dog.nombre}-${Date.now()}.png`;
    link.href = shareCardUrl;
    link.click();
  };

  const shareNative = async () => {
    if (!shareCardUrl) return;
    try {
      const blob = await (await fetch(shareCardUrl)).blob();
      const file = new File([blob], "blis-agility.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${dog.nombre} - Entrenamiento de Agilidad`,
          text: `¡${dog.nombre} completó un circuito en ${formatTime(rawTime)} en Blis Club!`,
          files: [file],
        });
      } else {
        downloadShareCard();
      }
    } catch (e) {
      downloadShareCard();
    }
  };

  const backToAcademy = () => {
    if (lessonId) {
      // Navigate back to the lesson
      router.push(`/guau/app/academia/agilidad/lesson/${lessonId}`);
    } else {
      onClose();
    }
  };

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-5 bg-white dark:bg-zinc-900 border-2 border-accent-200 dark:border-accent-800">
      {/* ═══ CONFIG PHASE ═══ */}
      {phase === "config" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Configurar sesión</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Session Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500">Tipo de sesión</label>
            <div className="grid grid-cols-2 gap-2">
              {sessionTypes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSessionTypeId(st.id)}
                  className={`p-3 rounded-xl border-2 text-left text-xs transition-all ${
                    sessionTypeId === st.id
                      ? "border-accent-400 bg-accent-50 dark:bg-accent-950/40"
                      : "border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{st.name}</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{st.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500">Nivel</label>
            <div className="flex gap-2">
              {["principiante", "intermedio", "avanzado"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    difficulty === lvl
                      ? "bg-accent-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Penalty config */}
          <div className="space-y-2">
            <button
              onClick={() => setShowPenaltyConfig(!showPenaltyConfig)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-500"
            >
              <Settings className="w-3.5 h-3.5" />
              Penalizaciones por defecto
            </button>
            {showPenaltyConfig && (
              <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                {foulTypes.map((ft) => (
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
                ))}
              </div>
            )}
          </div>

          {/* Obstacles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500">Obstáculos del circuito</label>
            <AgilityObstaclePicker
              selected={selectedObstacles}
              onChange={handleObstaclesChange}
            />
          </div>

          <button
            onClick={startSession}
            disabled={selectedObstacles.length === 0}
            className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-accent-500/25"
          >
            <Play className="w-5 h-5 inline mr-2 fill-current" />
            INICIAR CIRCUITO
          </button>
        </div>
      )}

      {/* ═══ ACTIVE PHASE ═══ */}
      {phase === "active" && (
        <div className="space-y-6">
          {/* Timer display */}
          <div className="flex flex-col items-center py-2">
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tiempo Total</p>
              <p className="text-5xl font-bold tabular-nums text-accent-600 dark:text-accent-400">
                {formatTime(elapsedTotal)}
              </p>
            </div>
            {lapTimes.length > 0 && (
              <div className="mt-2 text-center">
                <p className="text-[10px] font-bold text-zinc-400">Vuelta actual</p>
                <p className="text-2xl font-bold tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatTime(elapsedLap)}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isRunning
                  ? "bg-warning-500 text-white shadow-lg shadow-warning-500/20"
                  : "bg-accent-600 text-white shadow-lg shadow-accent-600/20"
              }`}
            >
              {isRunning ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {isRunning ? "PAUSAR" : "REANUDAR"}
            </button>
            <button
              onClick={markLap}
              className="flex-1 py-4 rounded-2xl font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              VUELTA
            </button>
          </div>

          {/* Lap times */}
          {lapTimes.length > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">Vueltas</p>
              {lapTimes.map((lap, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Vuelta {i + 1}</span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Obstacles with fouls */}
          {selectedObstacles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-500">Obstáculos y faltas</p>
              <AgilityObstaclePicker
                selected={selectedObstacles}
                onChange={handleObstaclesChange}
                onFoulsChange={handleFoulsChange}
                foulsMap={foulsMap}
                showFouls={true}
              />
            </div>
          )}

          {/* Photos */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500">Fotos ({photos.length}/3)</p>
            <div className="flex gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px]">Añadir</span>
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

          {/* Video */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500">Video ({videoFile ? '1/1' : '0/1'} - máx 10MB)</p>
            {videoPreviewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black">
                <video src={videoPreviewUrl} controls className="w-full max-h-48" />
                <button
                  onClick={() => { setVideoFile(null); setVideoPreviewUrl(null); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full h-16 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Clapperboard className="w-5 h-5" />
                <span className="text-xs">Añadir video corto (5 seg)</span>
              </button>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{totalFouls}</p>
              <p className="text-[10px] text-zinc-400">Faltas</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-accent-600">+{totalPenaltySeconds}s</p>
              <p className="text-[10px] text-zinc-400">Penalización</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{formatTime(netTime)}</p>
              <p className="text-[10px] text-zinc-400">Tiempo Neto</p>
            </div>
          </div>

          {/* End */}
          <button
            onClick={handleEndSession}
            className="w-full bg-danger-600 hover:bg-danger-700 text-white rounded-2xl py-4 font-bold text-sm transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5 fill-current" />
            TERMINAR SESIÓN
          </button>
        </div>
      )}

      {/* ═══ DONE PHASE ═══ */}
      {phase === "done" && (
        <div className="space-y-5">
          {!savedSession ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">¡Sesión completada!</h3>
                <p className="text-sm text-zinc-500">{dog.nombre} lo hizo increíble.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-accent-600">{formatTime(rawTime)}</p>
                  <p className="text-[10px] text-zinc-400">Tiempo bruto</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{formatTime(netTime)}</p>
                  <p className="text-[10px] text-zinc-400">Tiempo neto</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{totalFouls}</p>
                  <p className="text-[10px] text-zinc-400">Faltas</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{selectedObstacles.length}</p>
                  <p className="text-[10px] text-zinc-400">Obstáculos</p>
                </div>
              </div>

              {isCleanRun && (
                <div className="bg-secondary-50 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-800 rounded-xl p-3 text-center">
                  <span className="text-sm font-bold text-secondary-700 dark:text-secondary-300">🎉 CLEAN RUN — Sin faltas!</span>
                </div>
              )}

              <button
                onClick={saveSession}
                disabled={saving}
                className="w-full bg-accent-600 text-white rounded-2xl py-4 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all"
              >
                {saving ? "Guardando..." : "Guardar sesión"}
              </button>
            </>
          ) : showCollageEditor && photos.length > 0 ? (
            <PhotoCollageEditor
              photos={photos}
              dogName={dog.nombre}
              sessionTitle={sessionTypes.find((s) => s.id === sessionTypeId)?.name || "Agility"}
              rawTime={rawTime}
              netTime={netTime}
              isCleanRun={isCleanRun}
              onDone={() => setShowCollageEditor(false)}
            />
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-lg font-bold text-secondary-700 dark:text-secondary-300">¡Guardado!</h3>
              </div>

              {/* Share Card (hidden, used for html-to-image) */}
              <div
                ref={shareCardRef}
                className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-[1.5rem] p-6 text-white relative overflow-hidden"
                style={{ width: 600, height: 400 }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-black">{dog.nombre}</h2>
                      <p className="text-accent-100 text-sm">{sessionTypes.find(s => s.id === sessionTypeId)?.name || "Agility"}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                      B
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-black tabular-nums">{formatTime(rawTime)}</p>
                      <p className="text-xs text-accent-100">Tiempo bruto</p>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div className="text-center">
                      <p className="text-4xl font-black tabular-nums">{formatTime(netTime)}</p>
                      <p className="text-xs text-accent-100">Tiempo neto</p>
                    </div>
                  </div>

                  {isCleanRun && (
                    <div className="text-center">
                      <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">
                        🏆 CLEAN RUN
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-accent-200">
                    <span>Blis Club · Agility</span>
                    <span>{new Date().toLocaleDateString("es-ES")}</span>
                  </div>
                </div>
              </div>

              {/* Video preview */}
              {videoPreviewUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Video de la sesión</p>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black">
                    <video src={videoPreviewUrl} controls className="w-full max-h-40" />
                  </div>
                </div>
              )}

              {photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Fotos de la sesión</p>
                  <div className="flex gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCollageEditor(true)}
                    className="w-full py-3 rounded-xl bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-300 font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Crear collage para compartir
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={downloadShareCard}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
                <button
                  onClick={shareNative}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-600 text-white font-bold text-sm active:scale-[0.98] transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>

              <div className="flex gap-2">
                {lessonId && (
                  <button
                    onClick={backToAcademy}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm active:scale-[0.98] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a la Academia
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
                >
                  Listo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
