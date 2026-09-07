"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  icon?: ReactNode;
  accent?: string;
  right?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
}

export function ChartCard({ title, icon, accent, right, children, collapsible, open, onToggle }: Props) {
  return (
    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={collapsible ? onToggle : undefined}
          className={`flex items-center gap-2 ${collapsible ? "w-full" : ""}`}
        >
          {icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: accent?.replace(/\)/, ",0.14)") || "rgba(255,255,255,0.06)" }}>
              {accent ? <span style={{ color: accent }}>{icon}</span> : icon}
            </div>
          )}
          <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            {title}
            {collapsible && <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />}
          </h3>
        </button>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {(!collapsible || open) && <div>{children}</div>}
    </div>
  );
}
