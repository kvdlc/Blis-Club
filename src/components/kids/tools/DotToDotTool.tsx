"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { dotPoints, type KidsActivity } from "@/lib/kids";

const SIZE = 400;
const PAD = 34;

export function DotToDotTool({
  activity,
  onComplete,
}: {
  activity: KidsActivity;
  onComplete: (opts: { stars: number; score?: number }) => void;
}) {
  const shape = activity.data?.shape ?? "star";
  const count = activity.data?.count ?? 12;
  const pts = useMemo(
    () =>
      dotPoints(shape, count).map(([x, y]) => ({
        x: PAD + x * (SIZE - 2 * PAD),
        y: PAD + y * (SIZE - 2 * PAD),
      })),
    [shape, count],
  );

  const [order, setOrder] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const done = order.length === pts.length;

  const clickDot = (i: number) => {
    if (done) return;
    if (i === order.length) {
      const next = [...order, i];
      setOrder(next);
      if (next.length === pts.length) onComplete({ stars: 3, score: 100 });
    } else if (!order.includes(i)) {
      setShake(i);
      setTimeout(() => setShake(null), 400);
    }
  };

  const polyline = order.map((i) => `${pts[i].x},${pts[i].y}`).join(" ");

  return (
    <div className="space-y-4">
      {done && (
        <div className="kids-card flex items-center gap-3 border-2 border-emerald-200 bg-emerald-50 p-4">
          <Trophy className="h-7 w-7 text-emerald-500" />
          <p className="text-sm font-black text-emerald-700">¡Descubriste la figura!</p>
        </div>
      )}

      <div className="kids-card mx-auto w-full max-w-[520px] p-3">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full rounded-2xl bg-white">
          {done && <polygon points={polyline} fill="#fde68a" opacity={0.6} />}
          {order.length > 1 && (
            <polyline points={polyline} fill="none" stroke="#f97316" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {done && (
            <line x1={pts[order[order.length - 1]].x} y1={pts[order[order.length - 1]].y} x2={pts[order[0]].x} y2={pts[order[0]].y} stroke="#f97316" strokeWidth={4} />
          )}
          {pts.map((p, i) => {
            const reached = order.includes(i);
            return (
              <g
                key={i}
                onClick={() => clickDot(i)}
                className="cursor-pointer"
                style={shake === i ? { transform: "translate(2px,0)" } : undefined}
              >
                <circle cx={p.x} cy={p.y} r={reached ? 9 : 12} fill={reached ? "#f97316" : "#ffffff"} stroke="#1f2937" strokeWidth={2.5} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={reached ? "#ffffff" : "#1f2937"}>
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-center">
        <button onClick={() => setOrder([])} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md">
          <RotateCcw className="h-4 w-4" /> Reiniciar
        </button>
      </div>
      <p className="text-center text-xs font-semibold text-zinc-400">
        Toca los puntos en orden del 1 al {pts.length}.
      </p>
    </div>
  );
}
