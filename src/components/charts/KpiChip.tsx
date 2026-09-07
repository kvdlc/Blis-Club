"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;          // hex accent
  soft: string;           // rgba bg
  href?: string;
  spark?: number[];       // mini sparkline
}

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const w = 48, h = 16;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

export function KpiChip({ icon, label, value, color, soft, href, spark }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => href && router.push(href)}
      disabled={!href}
      className={`flex flex-col items-start gap-1.5 rounded-2xl p-3 text-left border border-white/10 transition-colors ${
        href ? "hover:bg-white/[0.08] cursor-pointer" : "cursor-default"
      }`}
      style={{ background: soft }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ color }} className="shrink-0">{icon}</span>
        <span className="text-[10px] text-zinc-400">{label}</span>
      </div>
      <span className="text-lg font-black text-zinc-100 tabular-nums">{value}</span>
      {spark && <MiniSpark data={spark} color={color} />}
    </button>
  );
}
