"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PaintBucket, Brush, Eraser, RotateCcw, Download, Save, Check, ArrowLeft, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadKidsDataUrl } from "@/lib/storage";
import { floodFill } from "@/lib/kids/coloring-utils";
import { DownloadPdfButton } from "./DownloadPdfButton";
import { buildPuzzlePageSpec } from "@/lib/kids/book-content";
import { CrosswordTool } from "./tools/CrosswordTool";
import { WordSearchTool } from "./tools/WordSearchTool";
import { MazeTool } from "./tools/MazeTool";
import { DotToDotTool } from "./tools/DotToDotTool";
import type { KidsActivity } from "@/lib/kids";

const PUZZLE_CATS = ["crucigrama", "sopa_letras", "laberinto", "unir_puntos"];
const BOOK_LABEL: Record<string, string> = {
  colorear: "Libro para colorear",
  crucigrama: "Libro de crucigramas",
  sopa_letras: "Libro de sopa de letras",
  laberinto: "Libro de laberintos",
  unir_puntos: "Libro de unir puntos",
};

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#facc15", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899",
  "#78350f", "#111827", "#ffffff",
];

type Mode = "fill" | "brush" | "eraser";

interface BookPage { image_url?: string; text?: string }

export function BookReader({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number }) => void;
}) {
  const pages: BookPage[] = Array.isArray(activity.data?.pages) ? activity.data.pages : [];
  const [pageIndex, setPageIndex] = useState(0);
  const [color, setColor] = useState("#f97316");
  const [mode, setMode] = useState<Mode>("fill");
  const [saving, setSaving] = useState(false);
  const [savedPage, setSavedPage] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const lastPt = useRef<[number, number] | null>(null);

  const page = pages[pageIndex];
  const imageUrl = page?.image_url;

  const size = 900;

  const loadImage = useCallback((url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;
    const img = new Image();
    img.crossOrigin = "anonymous";
    const draw = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    };
    img.onload = () => { imgRef.current = img; draw(); };
    img.onerror = () => { img.src = `/api/kids/image-proxy?url=${encodeURIComponent(url)}`; };
    img.src = url;
  }, []);

  useEffect(() => {
    if (imageUrl) loadImage(imageUrl);
  }, [imageUrl, loadImage]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * canvas.width, ((e.clientY - rect.top) / rect.height) * canvas.height];
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const [x, y] = pos(e);
    if (mode === "fill") {
      floodFill(ctx, Math.round(x), Math.round(y), color, 48);
    } else {
      drawingRef.current = true;
      lastPt.current = [x, y];
    }
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || mode === "fill") return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const [x, y] = pos(e);
    ctx.strokeStyle = mode === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = mode === "eraser" ? 34 : 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(...(lastPt.current ?? [x, y]));
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPt.current = [x, y];
  };
  const onUp = () => { drawingRef.current = false; lastPt.current = null; };

  const resetPage = () => { if (imageUrl) loadImage(imageUrl); };

  const downloadPage = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${activity.title.replace(/\s+/g, "-").toLowerCase()}-pagina-${pageIndex + 1}.png`;
    a.click();
  };

  const savePage = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const canvas = canvasRef.current!;
    if (user) {
      const url = await uploadKidsDataUrl(canvas.toDataURL("image/png"), user.id, `libro-${pageIndex + 1}`);
      if (url) setSavedPage(pageIndex);
    }
    setSaving(false);
  };

  if (!pages.length) {
    return <div className="kids-card p-8 text-center text-sm font-bold text-zinc-500">Este libro no tiene páginas.</div>;
  }

  // ── Libros de puzzles (renderizan la herramienta por página) ──
  if (PUZZLE_CATS.includes(activity.category_slug)) {
    const spec = buildPuzzlePageSpec(activity.category_slug, pageIndex);
    const fake = { ...activity, data: spec } as KidsActivity;
    const noop = () => {};
    return (
      <div className="space-y-5">
        <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-kids-600">{BOOK_LABEL[activity.category_slug]}</p>
              <p className="text-sm font-black text-zinc-800">Página {pageIndex + 1} de {pages.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DownloadPdfButton url={`/api/kids/book-pdf/${activity.id}`} filename={activity.title} className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95" />
            <button onClick={() => onComplete({ stars: 3 })} className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-2.5 text-sm font-black text-white shadow-kids-glow">
              <Check className="h-4 w-4" /> ¡Terminé!
            </button>
          </div>
        </div>

        <div key={pageIndex}>
          {page?.image_url ? (
            <div className="kids-card flex justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.image_url} alt="" className="max-h-[70vh] w-full rounded-2xl bg-white object-contain" />
            </div>
          ) : (
            <>
              {activity.category_slug === "crucigrama" && <CrosswordTool activity={fake} onComplete={noop} />}
              {activity.category_slug === "sopa_letras" && <WordSearchTool activity={fake} onComplete={noop} />}
              {activity.category_slug === "laberinto" && <MazeTool activity={fake} onComplete={noop} />}
              {activity.category_slug === "unir_puntos" && <DotToDotTool activity={fake} onComplete={noop} />}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700 shadow-md disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Anterior
          </button>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {pages.map((_, i) => (
              <button key={i} onClick={() => setPageIndex(i)}
                className={`h-9 w-9 shrink-0 rounded-lg text-xs font-black ${i === pageIndex ? "bg-kids-500 text-white" : "bg-white text-zinc-500 shadow-sm"}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))} disabled={pageIndex === pages.length - 1}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-kids-500 px-4 py-3 text-sm font-black text-white shadow-kids-glow disabled:opacity-40">
            Siguiente <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Encabezado del libro */}
      <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-kids-400 to-kids-600 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-kids-600">Libro para colorear</p>
            <p className="text-sm font-black text-zinc-800">Página {pageIndex + 1} de {pages.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton url={`/api/kids/book-pdf/${activity.id}`} filename={activity.title} className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95" />
          <button onClick={() => onComplete({ stars: 3 })} className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-2.5 text-sm font-black text-white shadow-kids-glow">
            <Check className="h-4 w-4" /> ¡Terminé!
          </button>
        </div>
      </div>

      {/* Paleta */}
      <div className="kids-card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`} style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full border-2 transition-transform active:scale-90 ${color === c ? "border-zinc-800 scale-110" : "border-white shadow"}`} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBtn active={mode === "fill"} onClick={() => setMode("fill")} icon={<PaintBucket className="h-4 w-4" />} label="Rellenar" />
          <ModeBtn active={mode === "brush"} onClick={() => setMode("brush")} icon={<Brush className="h-4 w-4" />} label="Pincel" />
          <ModeBtn active={mode === "eraser"} onClick={() => setMode("eraser")} icon={<Eraser className="h-4 w-4" />} label="Borrador" />
          <button onClick={resetPage} className="ml-auto inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-2 text-sm font-black text-zinc-600">
            <RotateCcw className="h-4 w-4" /> Reiniciar
          </button>
        </div>
      </div>

      {/* Lienzo */}
      <div className="kids-card mx-auto w-full max-w-[560px] p-3">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="aspect-square w-full touch-none rounded-2xl"
          style={{ cursor: mode === "fill" ? "crosshair" : "pointer" }}
        />
      </div>

      {/* Navegación + acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700 shadow-md disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>
        <div className="flex items-center gap-2">
          <button onClick={downloadPage} className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700 shadow-md">
            <Download className="h-4 w-4" /> Descargar
          </button>
          <button onClick={savePage} disabled={saving} className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-black text-white shadow-md disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {savedPage === pageIndex ? "¡Guardado!" : "Guardar"}
          </button>
        </div>
        <button onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))} disabled={pageIndex === pages.length - 1}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-kids-500 px-4 py-3 text-sm font-black text-white shadow-kids-glow disabled:opacity-40">
          Siguiente <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Miniaturas */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {pages.map((p, i) => (
          <button key={i} onClick={() => setPageIndex(i)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === pageIndex ? "border-kids-500" : "border-transparent"}`}>
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-zinc-100 text-[10px] font-bold text-zinc-400">{i + 1}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-black transition-colors ${active ? "bg-kids-500 text-white shadow" : "bg-zinc-100 text-zinc-600"}`}>
      {icon} {label}
    </button>
  );
}



