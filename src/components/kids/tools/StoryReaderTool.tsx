"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2, Square, Check, BookOpen } from "lucide-react";
import { DownloadPdfButton } from "@/components/kids/DownloadPdfButton";
import type { KidsActivity } from "@/lib/kids";

interface StoryPage {
  text: string;
  emoji?: string;
  image_url?: string;
}

export function StoryReaderTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number }) => void;
}) {
  const pages: StoryPage[] = useMemo(() => {
    const p = activity.data?.pages;
    if (Array.isArray(p) && p.length) return p as StoryPage[];
    return [{ text: "Había una vez..." }];
  }, [activity]);

  const [i, setI] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const touchX = useRef<number | null>(null);

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const readAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stop();
    const u = new SpeechSynthesisUtterance(pages[i].text);
    u.lang = "es-ES";
    u.rate = 0.9;
    u.pitch = 1.15;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  useEffect(() => () => stop(), []);

  const go = (d: number) => {
    stop();
    setI((prev) => Math.max(0, Math.min(pages.length - 1, prev + d)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, pages.length]);

  const page = pages[i];
  const last = i === pages.length - 1;

  return (
    <div className="space-y-4">
      {/* Encabezado del libro */}
      <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-pink-600">Cuento ilustrado</p>
            <p className="text-sm font-black text-zinc-800">Página {i + 1} de {pages.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DownloadPdfButton url={`/api/kids/book-pdf/${activity.id}`} filename={activity.title} className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95" />
          <button onClick={() => onComplete({ stars: 3 })} className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-2.5 text-sm font-black text-white shadow-kids-glow">
            <Check className="h-4 w-4" /> ¡Terminé!
          </button>
        </div>
      </div>

      {/* Página (formato libro vertical) */}
      <div
        className="kids-card mx-auto w-full max-w-[520px] overflow-hidden"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <div className="relative flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-pink-100 via-fuchsia-100 to-violet-100">
          {page.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={page.image_url} alt="" className="h-full w-full object-contain" />
          ) : (
            <BookOpen className="h-16 w-16 text-white/80" />
          )}
          <span className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-black text-zinc-500 backdrop-blur">
            {i + 1} / {pages.length}
          </span>
        </div>
        <div className="p-5">
          <p className="min-h-[4.5rem] text-center text-lg font-bold leading-relaxed text-zinc-700" style={{ fontFamily: "var(--font-nunito)" }}>
            {page.text}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => go(-1)} disabled={i === 0} className="inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700 shadow-md disabled:opacity-40">
          <ArrowLeft className="h-4 w-4" /> Anterior
        </button>
        {speaking ? (
          <button onClick={stop} className="inline-flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-md">
            <Square className="h-4 w-4" /> Detener
          </button>
        ) : (
          <button onClick={readAloud} className="inline-flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-black text-white shadow-md">
            <Volume2 className="h-4 w-4" /> Leer en voz alta
          </button>
        )}
        {last ? (
          <button onClick={() => onComplete({ stars: 3 })} className="inline-flex items-center gap-1.5 rounded-2xl bg-kids-500 px-5 py-3 text-sm font-black text-white shadow-kids-glow">
            <Check className="h-4 w-4" /> Terminé
          </button>
        ) : (
          <button onClick={() => go(1)} className="inline-flex items-center gap-1.5 rounded-2xl bg-kids-500 px-4 py-3 text-sm font-black text-white shadow-kids-glow">
            Siguiente <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Miniaturas para saltar de página */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {pages.map((p, idx) => (
          <button key={idx} onClick={() => { stop(); setI(idx); }}
            className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-zinc-100 ${idx === i ? "border-kids-500" : "border-transparent"}`}>
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">{idx + 1}</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-center text-xs font-semibold text-zinc-400">
        Desliza o usa las flechas para pasar de página.
      </p>
    </div>
  );
}

