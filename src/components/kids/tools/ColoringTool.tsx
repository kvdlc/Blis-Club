"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaintBucket, Brush, Eraser, Undo2, RotateCcw, Download, Save, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadKidsDataUrl } from "@/lib/storage";
import { floodFill } from "@/lib/kids/coloring-utils";
import { COLORING_TEMPLATES } from "./coloring-templates";
import type { KidsActivity } from "@/lib/kids";

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#facc15", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
  "#78350f", "#111827", "#ffffff",
];

type Mode = "fill" | "brush" | "eraser";

export function ColoringTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number }) => void;
}) {
  const imageUrl: string | undefined = activity.data?.image_url || activity.cover_url || undefined;
  const templateName: string | undefined = activity.data?.template;
  const template = templateName ? COLORING_TEMPLATES[templateName] : undefined;
  const isRaster = !!imageUrl;

  const [color, setColor] = useState("#f97316");
  const [mode, setMode] = useState<Mode>("fill");
  const [fills, setFills] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ id: string; prev?: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const rasterRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  // Raster (imagen generada): cargar en canvas
  useEffect(() => {
    if (!isRaster) return;
    const canvas = rasterRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 800;
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    };
    img.onerror = () => { img.src = `/api/kids/image-proxy?url=${encodeURIComponent(imageUrl!)}`; };
    img.src = imageUrl!;
  }, [isRaster, imageUrl]);

  // Overlay de trazos libres (para plantillas)
  const strokesRef = useRef<{ color: string; width: number; pts: [number, number][] }[]>([]);
  const drawingRef = useRef(false);

  const redrawOverlay = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    for (const s of strokesRef.current) {
      if (s.pts.length < 2) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.pts[0][0], s.pts[0][1]);
      for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
      ctx.stroke();
    }
  }, []);

  const overlayPos = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = overlayRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return [x, y];
  };

  const onOverlayDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode === "fill") return;
    drawingRef.current = true;
    const stroke = { color: mode === "eraser" ? "#ffffff" : color, width: mode === "eraser" ? 32 : 10, pts: [overlayPos(e)] };
    strokesRef.current.push(stroke);
    redrawOverlay();
  };
  const onOverlayMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const s = strokesRef.current[strokesRef.current.length - 1];
    s.pts.push(overlayPos(e));
    redrawOverlay();
  };
  const onOverlayUp = () => { drawingRef.current = false; };

  // Raster flood fill
  const fillRaster = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== "fill") return;
    const canvas = rasterRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 0);
    ctx.restore();
    floodFill(ctx, x, y, color, 48);
  };

  const buildPngAsync = async (): Promise<string | null> => {
    const size = 800;
    const out = document.createElement("canvas");
    out.width = size;
    out.height = size;
    const ctx = out.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    if (isRaster) {
      ctx.drawImage(rasterRef.current!, 0, 0, size, size);
    } else if (svgRef.current) {
      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const im = new Image();
          im.onload = () => resolve(im);
          im.onerror = reject;
          im.src = url;
        });
        ctx.drawImage(img, 0, 0, size, size);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (overlayRef.current) ctx.drawImage(overlayRef.current, 0, 0, size, size);
    return out.toDataURL("image/png");
  };

  const handleDownload = async () => {
    const png = await buildPngAsync();
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = `${activity.title.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const png = await buildPngAsync();
    if (user && png) {
      const url = await uploadKidsDataUrl(png, user.id, "colorear");
      if (url) setSaved(true);
    }
    setSaving(false);
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFills((f) => {
      const copy = { ...f };
      if (last.prev) copy[last.id] = last.prev;
      else delete copy[last.id];
      return copy;
    });
  };

  const reset = () => {
    setFills({});
    setHistory([]);
    strokesRef.current = [];
    redrawOverlay();
    if (isRaster) {
      const canvas = rasterRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const w = img.width * scale; const h = img.height * scale;
          ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        };
        img.onerror = () => { img.src = `/api/kids/image-proxy?url=${encodeURIComponent(imageUrl!)}`; };
        img.src = imageUrl!;
      }
    }
  };

  if (!isRaster && !template) {
    return (
      <div className="kids-card p-8 text-center">
        <p className="text-sm font-bold text-zinc-500">Esta lámina todavía no tiene un dibujo para colorear.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Paleta y modos */}
      <div className="kids-card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              style={{ backgroundColor: c }}
              className={`h-9 w-9 rounded-full border-2 transition-transform active:scale-90 ${
                color === c ? "border-zinc-800 scale-110" : "border-white shadow"
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBtn active={mode === "fill"} onClick={() => setMode("fill")} icon={<PaintBucket className="h-4 w-4" />} label="Rellenar" />
          <ModeBtn active={mode === "brush"} onClick={() => setMode("brush")} icon={<Brush className="h-4 w-4" />} label="Pincel" />
          <ModeBtn active={mode === "eraser"} onClick={() => setMode("eraser")} icon={<Eraser className="h-4 w-4" />} label="Borrador" />
          <div className="ml-auto flex items-center gap-2">
            <IconBtn onClick={undo} title="Deshacer"><Undo2 className="h-4 w-4" /></IconBtn>
            <IconBtn onClick={reset} title="Reiniciar"><RotateCcw className="h-4 w-4" /></IconBtn>
          </div>
        </div>
      </div>

      {/* Lienzo */}
      <div className="kids-card mx-auto w-full max-w-[560px] overflow-hidden p-3">
        <div className="relative aspect-square w-full">
          {isRaster ? (
            <canvas
              ref={rasterRef}
              onClick={fillRaster}
              className="h-full w-full touch-none rounded-2xl"
              style={{ cursor: mode === "fill" ? "crosshair" : "pointer" }}
            />
          ) : (
            <>
              <svg
                ref={svgRef}
                viewBox={template!.viewBox}
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 h-full w-full rounded-2xl"
                style={{ background: "#ffffff" }}
              >
                {template!.regions.map((r) => (
                  <g
                    key={r.id}
                    fill={fills[r.id] ?? "#ffffff"}
                    stroke="#1f2937"
                    strokeWidth={3}
                    strokeLinejoin="round"
                    onClick={() => {
                      if (mode !== "fill") return;
                      setHistory((h) => [...h, { id: r.id, prev: fills[r.id] }]);
                      setFills((f) => ({ ...f, [r.id]: color }));
                    }}
                    className="cursor-pointer"
                  >
                    {r.node}
                  </g>
                ))}
              </svg>
              <canvas
                ref={overlayRef}
                width={800}
                height={800}
                onPointerDown={onOverlayDown}
                onPointerMove={onOverlayMove}
                onPointerUp={onOverlayUp}
                onPointerLeave={onOverlayUp}
                className="absolute inset-0 h-full w-full touch-none rounded-2xl"
                style={{ pointerEvents: mode === "fill" ? "none" : "auto" }}
              />
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={handleDownload} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md">
          <Download className="h-4 w-4" /> Descargar
        </button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-3 text-sm font-black text-white shadow-md disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "¡Guardado!" : "Guardar dibujo"}
        </button>
        <button onClick={() => onComplete({ stars: 3 })} className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-3 text-sm font-black text-white shadow-kids-glow">
          <Check className="h-4 w-4" /> ¡Terminé!
        </button>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-black transition-colors ${
        active ? "bg-kids-500 text-white shadow" : "bg-zinc-100 text-zinc-600"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-transform active:scale-90">
      {children}
    </button>
  );
}
