"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, Calendar } from "lucide-react";

interface DayData {
  date: Date;
  dayName: string;
  dayNum: number;
  sessions: Array<{
    id: string;
    routine_name: string;
    duration_minutes: number;
    body_weight_kg: number | null;
    gym_occupancy: string | null;
    series_data: any;
    started_at: string;
    ended_at: string | null;
  }>;
  totalVolume: number;
  isToday: boolean;
}

interface Props {
  userId: string;
  onSelectDay: (day: DayData) => void;
}

function getWeekDates(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  start.setHours(0, 0, 0, 0);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

export default function WeeklyCalendar({ userId, onSelectDay }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekTotal, setWeekTotal] = useState({ tons: 0, daysWithTraining: 0 });

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const weekLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    return `${first.toLocaleDateString("es-ES", { day: "numeric", month: "short" })} al ${last.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`;
  }, [weekDates]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      const startDate = weekDates[0].toISOString().split("T")[0];
      const endDate = new Date(weekDates[6]);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().split("T")[0];

      const { data: sessions } = await supabase
        .from("spartan_workout_sessions")
        .select("id, started_at, ended_at, duration_minutes, series_data, body_weight_kg, gym_occupancy, routine_id, spartan_workout_routines!inner(name)")
        .eq("user_id", userId)
        .eq("completed", true)
        .gte("started_at", startDate)
        .lt("started_at", endDateStr)
        .order("started_at", { ascending: true });

      const sessionsByDate = new Map<string, DayData["sessions"]>();
      const todayStr = new Date().toDateString();

      for (const d of weekDates) {
        const key = d.toISOString().split("T")[0];
        sessionsByDate.set(key, []);
      }

      for (const s of (sessions as any[]) ?? []) {
        const dateKey = new Date(s.started_at).toISOString().split("T")[0];
        if (!sessionsByDate.has(dateKey)) continue;
        sessionsByDate.get(dateKey)!.push({
          id: s.id,
          routine_name: (s as any).spartan_workout_routines?.name || "",
          duration_minutes: s.duration_minutes || 0,
          body_weight_kg: s.body_weight_kg,
          gym_occupancy: s.gym_occupancy,
          series_data: s.series_data,
          started_at: s.started_at,
          ended_at: s.ended_at,
        });
      }

      let totalTons = 0;
      let totalDays = 0;

      const dayData: DayData[] = weekDates.map((date, i) => {
        const key = date.toISOString().split("T")[0];
        const sessions = sessionsByDate.get(key) || [];
        let volume = 0;
        for (const s of sessions) {
          if (s.series_data) {
            const sd = s.series_data;
            for (const k of Object.keys(sd)) {
              const v = sd[k];
              if (v && Array.isArray(v.series)) {
                for (const entry of v.series) {
                  if (entry.completed && entry.weight) volume += entry.weight * entry.reps;
                }
              }
            }
          }
        }
        totalTons += volume;
        if (sessions.length > 0) totalDays++;

        return {
          date,
          dayName: DAY_NAMES[i],
          dayNum: date.getDate(),
          sessions,
          totalVolume: volume,
          isToday: date.toDateString() === todayStr,
        };
      });

      setDays(dayData);
      setWeekTotal({ tons: totalTons / 1000, daysWithTraining: totalDays });
      setLoading(false);
    };
    load();
  }, [weekOffset, userId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
        <div className="h-20 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-spartan-400" />
          <h2 className="text-sm font-bold text-zinc-200">Calendario</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setWeekOffset(o => o - 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button onClick={() => setWeekOffset(o => o + 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 mb-2">{weekLabel}</p>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          const hasTraining = day.sessions.length > 0;
          const volumeTons = day.totalVolume / 1000;
          const routineNames = [...new Set(day.sessions.map(s => s.routine_name))];

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => hasTraining && onSelectDay(day)}
              className={`rounded-xl p-2 text-center transition-all active:scale-[0.97] border ${
                hasTraining
                  ? `bg-spartan-500/10 border-spartan-500/20 hover:bg-spartan-500/15`
                  : "bg-white/[0.02] border-white/[0.04] opacity-50"
              } ${day.isToday ? "ring-1 ring-spartan-500/50" : ""}`}
            >
              <p className={`text-[9px] font-bold uppercase ${hasTraining ? "text-spartan-400" : "text-zinc-600"}`}>{day.dayName}</p>
              <p className={`text-xs font-extrabold mt-0.5 ${day.isToday ? "text-white" : hasTraining ? "text-zinc-200" : "text-zinc-600"}`}>{day.dayNum}</p>
              {hasTraining && (
                <>
                  <Flame className="w-3 h-3 text-spartan-400 mx-auto mt-0.5" />
                  <p className="text-[7px] font-bold text-zinc-500 mt-0.5 leading-tight line-clamp-1">{routineNames.join(", ")}</p>
                  <p className="text-[8px] font-bold text-zinc-400 mt-0.5">{volumeTons.toFixed(1)}t</p>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs font-bold text-zinc-400">
          {weekTotal.tons.toFixed(1)} toneladas
        </p>
        <p className="text-xs text-zinc-600">
          {weekTotal.daysWithTraining} día{weekTotal.daysWithTraining !== 1 ? "s" : ""} entrenado{weekTotal.daysWithTraining !== 1 ? "s" : ""}
        </p>
      </div>
    </section>
  );
}
