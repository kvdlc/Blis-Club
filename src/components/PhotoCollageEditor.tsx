"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { MoveLeft, MoveRight, Star, StarOff, Download, Share2, X, ImagePlus } from "lucide-react";

interface Props {
  photos: string[];
  dogName: string;
  sessionTitle: string;
  rawTime: number;
  netTime: number;
  isCleanRun: boolean;
  onDone: () => void;
}

export function PhotoCollageEditor({
  photos: initialPhotos,
  dogName,
  sessionTitle,
  rawTime,
  netTime,
  isCleanRun,
  onDone,
}: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos.slice(0, 3));
  const [mainIndex, setMainIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  const moveLeft = (idx: number) => {
    if (idx === 0) return;
    const next = [...photos];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setPhotos(next);
    if (mainIndex === idx) setMainIndex(idx - 1);
    else if (mainIndex === idx - 1) setMainIndex(idx);
  };

  const moveRight = (idx: number) => {
    if (idx === photos.length - 1) return;
    const next = [...photos];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setPhotos(next);
    if (mainIndex === idx) setMainIndex(idx + 1);
    else if (mainIndex === idx + 1) setMainIndex(idx);
  };

  const setAsMain = (idx: number) => setMainIndex(idx);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const generateCollage = async () => {
    if (!collageRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(collageRef.current, { cacheBust: true, pixelRatio: 2 });
      setExportedUrl(dataUrl);
    } catch (e) {
      console.error("Collage export error:", e);
    }
    setExporting(false);
  };

  const downloadCollage = () => {
    if (!exportedUrl) return;
    const link = document.createElement("a");
    link.download = `blis-collage-${dogName}-${Date.now()}.png`;
    link.href = exportedUrl;
    link.click();
  };

  const shareCollage = async () => {
    if (!exportedUrl) return;
    try {
      const blob = await (await fetch(exportedUrl)).blob();
      const file = new File([blob], "blis-collage.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${dogName} - Entrenamiento de Agilidad`,
          text: `¡Mira el entrenamiento de ${dogName} en Blis Club!`,
          files: [file],
        });
      } else {
        downloadCollage();
      }
    } catch (e) {
      downloadCollage();
    }
  };

  return (
    <div className="space-y-5">
      {!exportedUrl ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Editar collage</h3>
            <button onClick={onDone} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          <p className="text-xs text-zinc-500">Reordena las fotos y selecciona la principal.</p>

          {/* Thumbnail editor */}
          <div className="space-y-2">
            {photos.map((photo, idx) => (
              <div
                key={`${photo}-${idx}`}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                  idx === mainIndex
                    ? "border-accent-400 bg-accent-50 dark:bg-accent-950/30"
                    : "border-zinc-100 dark:border-zinc-800"
                }`}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {idx === mainIndex && (
                    <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-accent-500 text-white flex items-center justify-center">
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {idx === mainIndex ? "Foto principal" : `Foto ${idx + 1}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveLeft(idx)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 active:scale-95"
                  >
                    <MoveLeft className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => moveRight(idx)}
                    disabled={idx === photos.length - 1}
                    className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center disabled:opacity-30 active:scale-95"
                  >
                    <MoveRight className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => setAsMain(idx)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center active:scale-95 transition-colors ${
                      idx === mainIndex
                        ? "bg-accent-100 dark:bg-accent-900 text-accent-600"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-accent-500"
                    }`}
                    title="Establecer como principal"
                  >
                    {idx === mainIndex ? <Star className="w-3.5 h-3.5 fill-current" /> : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-500">Vista previa del collage</p>
            <div
              ref={collageRef}
              className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 rounded-[1.5rem] p-4 space-y-3"
              style={{ width: 540, maxWidth: "100%" }}
            >
              {/* Main photo */}
              <div className="relative rounded-[1.25rem] overflow-hidden aspect-[4/3] bg-zinc-200 dark:bg-zinc-800">
                <img src={photos[mainIndex]} alt="Principal" className="w-full h-full object-cover" />
                {isCleanRun && (
                  <div className="absolute top-3 left-3 bg-secondary-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-current" /> CLEAN RUN
                  </div>
                )}
              </div>

              {/* Secondary photos */}
              <div className="grid grid-cols-2 gap-2">
                {photos.filter((_, i) => i !== mainIndex).map((photo, i) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-square bg-zinc-200 dark:bg-zinc-800">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {/* If only 1 secondary photo, fill with placeholder or nothing */}
                {photos.filter((_, i) => i !== mainIndex).length === 1 && (
                  <div className="rounded-xl overflow-hidden aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-zinc-300" />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between bg-white/60 dark:bg-zinc-800/60 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-center flex-1">
                  <p className="text-lg font-black text-accent-600">{formatTime(rawTime)}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Bruto</p>
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
                <div className="text-center flex-1">
                  <p className="text-lg font-black text-zinc-800 dark:text-zinc-200">{formatTime(netTime)}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Neto</p>
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700" />
                <div className="text-center flex-1">
                  <p className="text-lg font-black text-zinc-800 dark:text-zinc-200">{sessionTitle}</p>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">{dogName}</p>
                </div>
              </div>

              {/* Brand */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">B</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400">Blis Club · Agility</span>
              </div>
            </div>
          </div>

          <button
            onClick={generateCollage}
            disabled={exporting}
            className="w-full bg-accent-600 text-white rounded-2xl py-4 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            {exporting ? "Generando..." : "Generar collage para compartir"}
          </button>
        </>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">¡Collage listo!</h3>
            <p className="text-sm text-zinc-500">Descárgalo o compártelo en redes</p>
          </div>

          <div className="rounded-[1.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <img src={exportedUrl} alt="Collage" className="w-full h-auto" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadCollage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
            <button
              onClick={shareCollage}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-600 text-white font-bold text-sm active:scale-[0.98] transition-all"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>

          <button
            onClick={onDone}
            className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-sm"
          >
            Listo
          </button>
        </>
      )}
    </div>
  );
}
