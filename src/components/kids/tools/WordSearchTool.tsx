"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { generateWordSearch, mulberry32, type KidsActivity } from "@/lib/kids";

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function WordSearchTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number; score?: number }) => void;
}) {
  const words: string[] = useMemo(() => {
    const w = activity.data?.words;
    if (Array.isArray(w) && w.length) return w.map((x: unknown) => String(x));
    return ["SOL", "LUNA", "MAR"];
  }, [activity]);
  const size: number = activity.data?.size ?? Math.max(8, Math.min(14, words.reduce((m, w) => Math.max(m, w.length), 0) + 4));

  const seed = useMemo(() => (activity.data?.seed ?? hashSeed(activity.id)), [activity]);
  const puzzle = useMemo(() => generateWordSearch(words, size, seed), [words, size, seed]);

  const [start, setStart] = useState<{ r: number; c: number } | null>(null);
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongLine, setWrongLine] = useState<{ r: number; c: number }[]>([]);

  const selection = useMemo(() => {
    if (!start || !hover) return [] as { r: number; c: number }[];
    const dr = Math.sign(hover.r - start.r);
    const dc = Math.sign(hover.c - start.c);
    const len = Math.max(Math.abs(hover.r - start.r), Math.abs(hover.c - start.c));
    // solo rectas
    if (!(start.r === hover.r || start.c === hover.c || Math.abs(hover.r - start.r) === Math.abs(hover.c - start.c))) {
      return [start];
    }
    const cells: { r: number; c: number }[] = [];
    for (let i = 0; i <= len; i++) cells.push({ r: start.r + dr * i, c: start.c + dc * i });
    return cells;
  }, [start, hover]);

  const selectedKey = (c: { r: number; c: number }) => `${c.r},${c.c}`;
  const selectedSet = new Set(selection.map(selectedKey));

  const foundCells = useMemo(() => {
    const set = new Set<string>();
    for (const p of puzzle.words) if (found.has(p.word)) for (const c of p.cells) set.add(selectedKey(c));
    return set;
  }, [found, puzzle]);

  const evaluate = () => {
    if (selection.length < 2) { setStart(null); setHover(null); return; }
    const word = selection.map((c) => puzzle.grid[c.r][c.c]).join("");
    const rev = [...word].reverse().join("");
    const match = puzzle.allWords.find((w) => (w === word || w === rev) && !found.has(w));
    if (match) {
      const next = new Set(found);
      next.add(match);
      setFound(next);
      if (next.size === puzzle.allWords.length) onComplete({ stars: 3, score: 100 });
    } else {
      setWrongLine(selection);
      setTimeout(() => setWrongLine([]), 500);
    }
    setStart(null);
    setHover(null);
  };

  const allFound = found.size >= puzzle.allWords.length;

  return (
    <div className="space-y-4">
      {allFound && (
        <div className="kids-card flex items-center gap-3 border-2 border-emerald-200 bg-emerald-50 p-4">
          <Trophy className="h-7 w-7 text-emerald-500" />
          <p className="text-sm font-black text-emerald-700">¡Encontraste todas las palabras!</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {puzzle.allWords.map((w) => (
          <span
            key={w}
            className={`rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
              found.has(w) ? "bg-emerald-100 text-emerald-600 line-through" : "bg-white text-zinc-600 shadow-sm"
            }`}
          >
            {w}
          </span>
        ))}
      </div>

      <div className="kids-card mx-auto w-full max-w-[560px] p-3">
        <div className="grid select-none gap-1" style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}>
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const k = `${r},${c}`;
              const isSel = selectedSet.has(k);
              const isFound = foundCells.has(k);
              const isWrong = wrongLine.some((x) => x.r === r && x.c === c);
              return (
                <button
                  key={k}
                  onMouseDown={() => { setStart({ r, c }); setHover({ r, c }); }}
                  onMouseEnter={() => start && setHover({ r, c })}
                  onMouseUp={evaluate}
                  onTouchStart={(e) => { e.preventDefault(); setStart({ r, c }); setHover({ r, c }); }}
                  className={`aspect-square rounded-lg text-sm font-black uppercase transition-colors sm:text-base ${
                    isWrong
                      ? "bg-red-200 text-red-700"
                      : isSel
                        ? "bg-kids-300 text-kids-900"
                        : isFound
                          ? "bg-emerald-200 text-emerald-800"
                          : "bg-zinc-100 text-zinc-700 hover:bg-kids-100"
                  }`}
                >
                  {letter}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => { setFound(new Set()); setStart(null); setHover(null); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
      <p className="text-center text-xs font-semibold text-zinc-400">
        Toca la primera letra y luego la última para marcar una palabra.
      </p>
    </div>
  );
}
