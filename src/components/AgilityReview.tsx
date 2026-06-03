"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PhotoCollageEditor } from "@/components/PhotoCollageEditor";
import { toPng } from "html-to-image";
import type { Dog, AgilityFoulType, AgilityObstacle } from "@/types/database";
import { X, Check, Trash2, ImagePlus, Download, Share2 } from "lucide-react";
import type { RunData, SessionConfig } from "./AgilityRun";

interface Props {
  dog: Dog;
  userId: string;
  runData: RunData;
  onSaved: () => void;
  onClose: () => void;
}

export function AgilityReview({ dog, userId, runData, onSaved, onClose }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [fouls, setFouls] = useState(runData.fouls);
  const [photos, setPhotos] = useState(runData.photos);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCollageEditor, setShowCollageEditor] = useState(false);
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { config, rawTime, netTime, lapTimes } = runData;
  const isCleanRun = fouls.length === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const removeFoul = (foulId: string) => {
    setFouls((prev) => prev.filter((f) => f.id !== foulId));
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

  const saveSession = async () => {
    setSaving(true);

    // Upload photos
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

    // Build obstacles payload
    const obstaclePayload = config.selectedObstacles.map((o) => {
      const obstacleFouls = fouls.filter((f) => f.obstacle_id === o.id);
      return {
        obstacle_id: o.id,
        used: true,
        fouls_count: obstacleFouls.length,
        notes: obstacleFouls.map((f) => f.foul_type_id).join(", "),
      };
    });

    // Build penalty settings
    const penaltyPayload = Object.entries(config.penaltySettings).map(([foulTypeId, seconds]) => ({
      foul_type_id: foulTypeId,
      penalty_seconds: seconds,
    }));

    const payload = {
      dog_id: dog.id,
      fecha: new Date().toISOString().slice(0, 10),
      activity_type: config.sessionTypeName || "Entrenamiento libre",
      duration_min: Math.ceil(rawTime / 60),
      circuit_time_seconds: rawTime,
      notes: `${lapTimes.length} vueltas. ${fouls.length} faltas totales.`,
      session_type_id: config.sessionTypeId,
      difficulty_level: config.difficulty,
      fouls_total: fouls.length,
      clean_run: isCleanRun,
      time_fault: false,
      raw_time_seconds: rawTime,
      net_time_seconds: netTime,
      obstacles: obstaclePayload,
      penalty_settings: penaltyPayload,
      photo_urls: photoUrls,
      video_url: photoUrls[0] || null,
    };

    try {
      const res = await fetch("/api/agility/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        // Check badges
        try {
          await fetch("/api/agility/check-badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dog_id: dog.id }),
          });
        } catch (e) {
          console.error("Badge check error:", e);
        }
        // Generate share card
        setTimeout(() => generateShareCard(), 100);
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

  if (saved) {
    return (
      <div className="card-soft rounded-[1.5rem] p-5 space-y-5 bg-white dark:bg-zinc-900 border-2 border-accent-200 dark:border-accent-800">
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
                <p className="text-accent-100 text-sm">{config.sessionTypeName || "Agility"}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">B</div>
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
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold">🏆 CLEAN RUN</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-accent-200">
              <span>Blis Club · Agility</span>
              <span>{new Date().toLocaleDateString("es-ES")}</span>
            </div>
          </div>
        </div>

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

        {showCollageEditor && photos.length > 0 && (
          <PhotoCollageEditor
            photos={photos}
            dogName={dog.nombre}
            sessionTitle={config.sessionTypeName || "Agility"}
            rawTime={rawTime}
            netTime={netTime}
            isCleanRun={isCleanRun}
            onDone={() => setShowCollageEditor(false)}
          />
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

        <button
          onClick={onSaved}
          className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
        >
          Listo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-4 pb-8 space-y-5 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Resumen del entrenamiento</h3>
        <p className="text-sm text-zinc-500">{dog.nombre} lo hizo increíble.</p>
      </div>

      {/* Stats grid */}
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
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{fouls.length}</p>
          <p className="text-[10px] text-zinc-400">Faltas</p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">{config.selectedObstacles.length}</p>
          <p className="text-[10px] text-zinc-400">Obstáculos</p>
        </div>
      </div>

      {isCleanRun && (
        <div className="bg-secondary-50 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-800 rounded-xl p-3 text-center">
          <span className="text-sm font-bold text-secondary-700 dark:text-secondary-300">🏆 CLEAN RUN — Sin faltas!</span>
        </div>
      )}

      {/* Fouls list - editable */}
      {fouls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Faltas registradas</h4>
          <div className="space-y-1.5">
            {fouls.map((foul) => {
              const obstacle = config.selectedObstacles.find((o) => o.id === foul.obstacle_id);
              return (
                <div
                  key={foul.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{CATEGORY_CONFIG[obstacle?.category || ""]?.emoji || "🏁"}</span>
                    <div>
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{obstacle?.name || "Obstáculo"}</p>
                      <p className="text-[10px] text-zinc-400">Vuelta {foul.lap}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFoul(foul.id)}
                    className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 flex items-center justify-center hover:bg-danger-100 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
          <span>📷</span> Fotos ({photos.length}/3)
        </label>
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

      {/* Save button */}
      <button
        onClick={saveSession}
        disabled={saving}
        className="w-full bg-accent-600 text-white rounded-2xl py-4 font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-accent-600/25 flex items-center justify-center gap-2"
      >
        {saving ? "Guardando..." : "💾 GUARDAR SESIÓN"}
      </button>
    </div>
  );
}

const CATEGORY_CONFIG: Record<string, { emoji: string }> = {
  contacto: { emoji: "🐾" },
  salto: { emoji: "🦘" },
  slalom: { emoji: "〰️" },
  tunel: { emoji: "🌀" },
  entrenamiento: { emoji: "🎯" },
};
