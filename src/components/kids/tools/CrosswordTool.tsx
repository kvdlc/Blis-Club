"use client";

import { useMemo, useState } from "react";
import { Check, Eye, RotateCcw, Trophy } from "lucide-react";
import { generateCrossword, type KidsActivity } from "@/lib/kids";

export function CrosswordTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number; score?: number }) => void;
}) {
  const words = useMemo(() => {
    const w = activity.data?.words;
    if (Array.isArray(w) && w.length) return w as { answer: string; clue: string }[];
    return [{ answer: "SOL", clue: "Estrella que nos ilumina de día" }];
  }, [activity]);

  const puzzle = useMemo(() => generateCrossword(words), [words]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const setCell = (r: number, c: number, v: string) => {
    const letter = v.replace(/[^a-zA-ZÑñ]/g, "").toUpperCase().slice(-1);
    setChecked(false);
    setValues((prev) => ({ ...prev, [`${r},${c}`]: letter }));
  };

  const isCorrect = useMemo(() => {
    for (let r = 0; r < puzzle.rows; r++) {
      for (let c = 0; c < puzzle.cols; c++) {
        const sol = puzzle.grid[r][c];
        if (!sol) continue;
        if ((values[`${r},${c}`] || "") !== sol) return false;
      }
    }
    return true;
  }, [puzzle, values]);

  const check = () => {
    setChecked(true);
    if (isCorrect) onComplete({ stars: 3, score: 100 });
  };

  const reveal = () => {
    const full: Record<string, string> = {};
    for (let r = 0; r < puzzle.rows; r++) for (let c = 0; c < puzzle.cols; c++) if (puzzle.grid[r][c]) full[`${r},${c}`] = puzzle.grid[r][c]!;
    setValues(full);
    setRevealed(true);
  };

  const across = puzzle.words.filter((w) => w.dir === "across");
  const down = puzzle.words.filter((w) => w.dir === "down");

  return (
    <div className="space-y-5">
      {isCorrect && (
        <div className="kids-card flex items-center gap-3 border-2 border-emerald-200 bg-emerald-50 p-4">
          <Trophy className="h-7 w-7 text-emerald-500" />
          <p className="text-sm font-black text-emerald-700">¡Excelente! Completaste el crucigrama.</p>
        </div>
      )}

      <div className="kids-card overflow-x-auto p-4">
        <div
          className="mx-auto grid gap-1"
          style={{ gridTemplateColumns: `repeat(${puzzle.cols}, minmax(2rem, 1fr))`, maxWidth: puzzle.cols * 44 }}
        >
          {Array.from({ length: puzzle.rows }).map((_, r) =>
            Array.from({ length: puzzle.cols }).map((_, c) => {
              const sol = puzzle.grid[r][c];
              if (!sol) return <div key={`${r}-${c}`} className="aspect-square rounded-md bg-transparent" />;
              const num = puzzle.numbers[r][c];
              const val = values[`${r},${c}`] || "";
              const wrong = checked && !revealed && val !== sol;
              return (
                <div key={`${r}-${c}`} className="relative aspect-square">
                  {num && <span className="absolute left-0.5 top-0 z-10 text-[9px] font-black text-zinc-400">{num}</span>}
                  <input
                    value={val}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    maxLength={1}
                    inputMode="text"
                    className={`h-full w-full rounded-md border-2 text-center text-base font-black uppercase outline-none transition-colors ${
                      wrong ? "border-red-400 bg-red-50 text-red-500" : "border-zinc-300 bg-white text-zinc-800 focus:border-kids-400"
                    }`}
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ClueList title="Horizontales" items={across} />
        <ClueList title="Verticales" items={down} />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={check} className="inline-flex items-center gap-2 rounded-2xl bg-kids-500 px-5 py-3 text-sm font-black text-white shadow-kids-glow">
          <Check className="h-4 w-4" /> Comprobar
        </button>
        <button onClick={reveal} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md">
          <Eye className="h-4 w-4" /> Ver respuestas
        </button>
        <button
          onClick={() => { setValues({}); setChecked(false); setRevealed(false); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md"
        >
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
    </div>
  );
}

function ClueList({ title, items }: { title: string; items: { number: number; clue: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="kids-card p-4">
      <h3 className="mb-2 text-sm font-black text-zinc-700">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((w) => (
          <li key={`${w.number}-${w.answer}`} className="text-sm text-zinc-600">
            <span className="font-black text-kids-600">{w.number}.</span> {w.clue}
          </li>
        ))}
      </ul>
    </div>
  );
}
