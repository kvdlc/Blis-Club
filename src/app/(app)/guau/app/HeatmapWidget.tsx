"use client";

import { useState, useMemo } from "react";
import type { Walk } from "@/types/database";
import { Footprints, Droplets, BadgeCheck, Clock } from "lucide-react";

interface Props {
  walks: Walk[];
  greenPct: number;
  todayWalks: number;
}

function getTrafficColor(light: string | null) {
  switch (light) {
    case "green": return "bg-secondary-400 shadow-sm";
    case "yellow": return "bg-warning-400 shadow-sm";
    case "red": return "bg-danger-400 shadow-sm";
    default: return "bg-zinc-200 dark:bg-zinc-700";
  }
}

function getTextColor(light: string | null) {
  switch (light) {
    case "green": return "text-secondary-600 dark:text-secondary-400";
    case "yellow": return "text-warning-600 dark:text-warning-400";
    case "red": return "text-danger-600 dark:text-danger-400";
    default: return "text-zinc-500";
  }
}

export function HeatmapWidget({ walks, greenPct, todayWalks }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  const walksByDay = useMemo(() => {
    const map: Record<string, Walk[]> = {};
    walks.forEach((w) => {
      const key = w.start_time.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [walks]);

  const dayAvg = (dateStr: string) => {
    const w = walksByDay[dateStr];
    if (!w || w.length === 0) return null;
    const sum = w.map((x) => x.traffic_light === "green" ? 1 : x.traffic_light === "yellow" ? 2 : 3);
    return sum.reduce((a, b) => a + b, 0) / sum.length;
  };

  const today = new Date();
  const selectedWalks = selectedDate ? (walksByDay[selectedDate] ?? []) : [];
  const selAvg = selectedDate ? dayAvg(selectedDate) : null;

  let selPipis = 0, selPopos = 0, selMins = 0;
  selectedWalks.forEach((w) => {
    selPipis += w.pipi_count;
    selPopos += w.popo_count;
    selMins += (w.duration_sec ?? 0) / 60;
  });

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Últimos paseos</h3>
        <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{greenPct}% en verde · {todayWalks} hoy</span>
      </div>

      <div className="flex gap-1.5">
        {weekDays.map((d) => {
          const dateStr = d.toISOString().slice(0, 10);
          const avg = dayAvg(dateStr);
          const isToday = d.toDateString() === today.toDateString();
          const isSelected = dateStr === selectedDate;
          const hasWalks = avg !== null;
          const color = getTrafficColor(hasWalks ? (avg <= 1.3 ? "green" : avg <= 2.3 ? "yellow" : "red") : null);
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`flex-1 h-12 rounded-xl transition-all ${color} flex flex-col items-center justify-center gap-0.5 ${
                isSelected ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-zinc-900" : ""
              } ${isToday && !isSelected ? "ring-2 ring-white/60" : ""}`}
              title={d.toLocaleDateString("es", { weekday: "short", day: "numeric" })}
            >
              <span className={`text-[10px] font-bold block text-center ${hasWalks ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                {d.toLocaleDateString("es", { weekday: "narrow" })}
              </span>
              {hasWalks && (
                <div className="flex gap-0.5">
                  {walksByDay[dateStr]!.slice(0, 3).map((w, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${
                      w.traffic_light === "green" ? "bg-white/80" : w.traffic_light === "yellow" ? "bg-white/60" : "bg-white/40"
                    }`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && selectedWalks.length > 0 && (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-1.5">
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric" })}
          </p>
          <div className="flex items-center gap-3 text-sm flex-wrap">
            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"><Footprints className="w-3.5 h-3.5" /> {selectedWalks.length} paseo{selectedWalks.length !== 1 ? "s" : ""}</span>
            {selPipis > 0 && <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"><Droplets className="w-3.5 h-3.5 text-warning-500" /> {selPipis}</span>}
            {selPopos > 0 && <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"><BadgeCheck className="w-3.5 h-3.5 text-secondary-500" /> {selPopos}</span>}
            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"><Clock className="w-3.5 h-3.5" /> {Math.round(selMins)}min</span>
            {selAvg && <span className={`font-bold ${getTextColor(selAvg <= 1.3 ? "green" : selAvg <= 2.3 ? "yellow" : "red")}`}>{selAvg <= 1.3 ? "Calma" : selAvg <= 2.3 ? "Tensión" : "Estrés"}</span>}
          </div>
        </div>
      )}

      {selectedDate && selectedWalks.length === 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-2">Sin paseos este día</p>
      )}
    </div>
  );
}
