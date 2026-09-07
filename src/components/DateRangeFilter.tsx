"use client";

import { useState, useEffect } from "react";
import { CalendarRange } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";

export type PresetKey = "semana" | "mes" | "semestre" | "año" | "custom";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  preset: PresetKey;
}

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
  { key: "semestre", label: "Semestre" },
  { key: "año", label: "Año" },
  { key: "custom", label: "Personalizado" },
];

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeFor(preset: PresetKey): { start: string; end: string } {
  const end = new Date();
  let start = new Date();
  if (preset === "semana") start.setDate(end.getDate() - 7);
  else if (preset === "mes") start.setMonth(end.getMonth() - 1);
  else if (preset === "semestre") start.setMonth(end.getMonth() - 6);
  else if (preset === "año") start.setFullYear(end.getFullYear() - 1);
  return { start: iso(start), end: iso(end) };
}

export function useDateRange(defaultPreset: PresetKey = "mes") {
  const [preset, setPreset] = useState<PresetKey>(defaultPreset);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const range: DateRange = (() => {
    if (preset === "custom") {
      const end = customEnd || iso(new Date());
      const start = customStart || end;
      return { start, end, preset };
    }
    const r = rangeFor(preset);
    return { ...r, preset };
  })();

  return { range, preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd };
}

export function DateRangeFilter({ range, preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd }: {
  range: DateRange;
  preset: PresetKey;
  setPreset: (p: PresetKey) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-zinc-500 mr-1 flex items-center gap-1"><CalendarRange className="w-3 h-3" />Rango:</span>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
              preset === p.key
                ? "bg-auto-500 text-white"
                : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <DatePicker value={customStart} onChange={setCustomStart} label="Inicio" colorTheme="auto" />
          </div>
          <span className="text-zinc-500 text-[10px] shrink-0">→</span>
          <div className="flex-1 min-w-0">
            <DatePicker value={customEnd} onChange={setCustomEnd} label="Fin" colorTheme="auto" />
          </div>
        </div>
      )}

      <p className="text-[10px] text-zinc-600">
        {range.start} → {range.end}
      </p>
    </div>
  );
}
