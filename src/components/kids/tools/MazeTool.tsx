"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Trophy, Rabbit, Carrot } from "lucide-react";
import { generateMaze, type KidsActivity } from "@/lib/kids";

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function MazeTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number; score?: number }) => void;
}) {
  const cols = Math.min(16, Math.max(6, activity.data?.cols ?? 10));
  const rows = Math.min(16, Math.max(6, activity.data?.rows ?? 10));
  const seed = activity.data?.seed ?? hashSeed(activity.id);
  const maze = useMemo(() => generateMaze(cols, rows, seed), [cols, rows, seed]);

  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState(0);
  const won = pos[0] === rows - 1 && pos[1] === cols - 1;

  const move = useCallback(
    (dr: number, dc: number) => {
      setPos(([r, c]) => {
        const cell = maze.cells[r][c];
        if (dr === -1 && cell.n) return [r, c];
        if (dr === 1 && cell.s) return [r, c];
        if (dc === -1 && cell.w) return [r, c];
        if (dc === 1 && cell.e) return [r, c];
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) return [r, c];
        setMoves((m) => m + 1);
        return [nr, nc];
      });
    },
    [maze, rows, cols],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") { e.preventDefault(); move(-1, 0); }
      else if (e.key === "ArrowDown") { e.preventDefault(); move(1, 0); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); move(0, -1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); move(0, 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    if (won) onComplete({ stars: moves < cols + rows ? 3 : 2, score: Math.max(0, 100 - moves) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const grass = useMemo(
    () => Array.from({ length: rows * cols }, (_, i) => (i % 7 === 0 ? "bg-orange-50" : "")),
    [rows, cols],
  );

  return (
    <div className="space-y-4">
      {won && (
        <div className="kids-card flex items-center gap-3 border-2 border-emerald-200 bg-emerald-50 p-4">
          <Trophy className="h-7 w-7 text-emerald-500" />
          <p className="text-sm font-black text-emerald-700">¡El conejo llegó a las zanahorias!</p>
        </div>
      )}

      <div className="kids-card mx-auto w-full max-w-[560px] p-3">
        <div
          className="grid overflow-hidden rounded-xl"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {maze.cells.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = pos[0] === r && pos[1] === c;
              const isGoal = r === rows - 1 && c === cols - 1;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex aspect-square items-center justify-center ${!isPlayer && !isGoal ? grass[r * cols + c] : ""}`}
                  style={{
                    borderTop: cell.n ? "2px solid #334155" : "none",
                    borderBottom: cell.s ? "2px solid #334155" : "none",
                    borderLeft: cell.w ? "2px solid #334155" : "none",
                    borderRight: cell.e ? "2px solid #334155" : "none",
                  }}
                >
                  {isGoal && <Carrot className="h-4 w-4 text-orange-500" />}
                  {isPlayer && <Rabbit className="h-4 w-4 animate-pop text-zinc-700" />}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* D-pad */}
      <div className="mx-auto grid w-40 grid-cols-3 gap-2">
        <div />
        <PadBtn onClick={() => move(-1, 0)}><ArrowUp className="h-5 w-5" /></PadBtn>
        <div />
        <PadBtn onClick={() => move(0, -1)}><ArrowLeft className="h-5 w-5" /></PadBtn>
        <div />
        <PadBtn onClick={() => move(0, 1)}><ArrowRight className="h-5 w-5" /></PadBtn>
        <div />
        <PadBtn onClick={() => move(1, 0)}><ArrowDown className="h-5 w-5" /></PadBtn>
        <div />
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-zinc-400">Movimientos: {moves}</span>
        <button onClick={() => { setPos([0, 0]); setMoves(0); }} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md">
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
      <p className="text-center text-xs font-semibold text-zinc-400">Usa las flechas o el teclado para guiar al conejo.</p>
    </div>
  );
}

function PadBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex aspect-square items-center justify-center rounded-2xl bg-white text-kids-600 shadow-md transition-transform active:scale-90"
    >
      {children}
    </button>
  );
}
