"use client";

import { CHART } from "@/lib/chart-theme";

interface Props {
  value: number;        // 0-100
  label?: string;
  sublabel?: string;
  size?: number;        // px
  color?: string;
  color2?: string;      // gradiente secundario
  strokeWidth?: number;
}

export function GaugeRing({ value, label, sublabel, size = 120, color = CHART.emerald, color2 = CHART.teal, strokeWidth = 10 }: Props) {
  const r = 45;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  const offset = c * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
          <defs>
            <linearGradient id={`ringGrad-${color}-${color2}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color2} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
          <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#ringGrad-${color}-${color2})`} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-zinc-100 tabular-nums">{Math.round(value)}%</span>
          {label && <span className="text-[10px] text-zinc-400">{label}</span>}
        </div>
      </div>
      {sublabel && <p className="text-[10px] text-zinc-500 mt-1">{sublabel}</p>}
    </div>
  );
}
