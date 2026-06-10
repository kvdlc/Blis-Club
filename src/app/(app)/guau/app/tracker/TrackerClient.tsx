"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { Walk, Dog, DogVaccine } from "@/types/database";
import { getTodayLocal, toLocalDateStr } from "@/lib/dates";
import { Pause, Flame, ChevronLeft, ChevronRight, Clock, Droplets, BadgeCheck, Footprints, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { WalkSession } from "./WalkSession";

interface Props {
  walks: Walk[];
  dog: Dog | null;
  allDogs: Dog[];
  agilitySessions: { id: string; activity_type: string; duration_min: number; circuit_time_seconds: number | null; fecha: string }[];
  streakDays: number;
  userId: string;
  vaccines: DogVaccine[];
}

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function TrackerClient({ walks, dog, allDogs, agilitySessions, streakDays, vaccines, userId }: Props) {
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(getTodayLocal());
  const [showWalk, setShowWalk] = useState(() => {
    if (typeof window !== "undefined") {
      try { return !!localStorage.getItem("blis_active_walk"); } catch { return false; }
    }
    return false;
  });

  const walkByDate = useMemo(() => {
    const map: Record<string, Walk[]> = {};
    walks.forEach((w) => {
      const key = toLocalDateStr(new Date(w.start_time));
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [walks]);

  const dayAvgMap = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(walkByDate).forEach(([key, val]) => {
      map[key] = val.map((w) => w.traffic_light === "green" ? 1 : w.traffic_light === "yellow" ? 2 : 3).reduce((a, b) => a + b, 0) / val.length;
    });
    return map;
  }, [walkByDate]);

  const calendarGrid = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();
    const mondayStart = startDow === 0 ? 6 : startDow - 1;
    const cells: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; avg: number | null; count: number }[] = [];

    for (let i = mondayStart - 1; i >= 0; i--) {
      const d = new Date(calYear, calMonth, -i);
      const dateStr = toLocalDateStr(d);
      cells.push({ date: dateStr, day: d.getDate(), isCurrentMonth: false, isToday: false, avg: dayAvgMap[dateStr] ?? null, count: walkByDate[dateStr]?.length ?? 0 });
    }

    const todayDate = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(calYear, calMonth, i);
      const dateStr = toLocalDateStr(d);
      cells.push({ date: dateStr, day: i, isCurrentMonth: true, isToday: toLocalDateStr(d) === toLocalDateStr(todayDate), avg: dayAvgMap[dateStr] ?? null, count: walkByDate[dateStr]?.length ?? 0 });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(calYear, calMonth + 1, i);
        const dateStr = toLocalDateStr(d);
        cells.push({ date: dateStr, day: d.getDate(), isCurrentMonth: false, isToday: false, avg: dayAvgMap[dateStr] ?? null, count: walkByDate[dateStr]?.length ?? 0 });
      }
    }
    return cells;
  }, [calMonth, calYear, dayAvgMap, walkByDate]);

  const navigateMonth = (dir: number) => {
    let m = calMonth + dir, y = calYear;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    setCalMonth(m); setCalYear(y);
  };

  const getBg = (avg: number | null, isCurrent: boolean) => {
    if (!isCurrent || avg === null) return "bg-zinc-50";
    if (avg <= 1.3) return "bg-secondary-100";
    if (avg <= 2.3) return "bg-warning-100";
    return "bg-danger-100";
  };
  const getText = (avg: number | null, isCurrent: boolean) => {
    if (!isCurrent) return "text-zinc-300";
    if (avg === null) return "text-zinc-400";
    if (avg <= 1.3) return "text-secondary-700";
    if (avg <= 2.3) return "text-warning-700";
    return "text-danger-700";
  };
  const getDot = (avg: number | null) => {
    if (avg === null) return "";
    if (avg <= 1.3) return "bg-secondary-500";
    if (avg <= 2.3) return "bg-warning-500";
    return "bg-danger-500";
  };

  const selectedWalks = walkByDate[selectedDate] ?? [];
  const todayStr = getTodayLocal();
  const todayWalks = walkByDate[todayStr] ?? [];
  const todayStats = useMemo(() => {
    if (todayWalks.length === 0) return null;
    let p = 0, o = 0, m = 0;
    const c: number[] = [];
    todayWalks.forEach((w) => { p += w.pipi_count; o += w.popo_count; m += (w.duration_sec ?? 0) / 60; c.push(w.traffic_light === "green" ? 1 : w.traffic_light === "yellow" ? 2 : 3); });
    return { pipis: p, popos: o, mins: Math.round(m), count: todayWalks.length, avg: c.reduce((a, b) => a + b, 0) / c.length };
  }, [todayWalks]);

  const reactivityData = useMemo(() => {
    const weeks: Record<string, { week: string; Verde: number; Amarillo: number; Rojo: number }> = {};
    walks.forEach((w) => {
      const d = new Date(w.start_time); d.setDate(d.getDate() - d.getDay());
      const key = d.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { week: key, Verde: 0, Amarillo: 0, Rojo: 0 };
      if (w.traffic_light === "red") weeks[key].Rojo++; else if (w.traffic_light === "yellow") weeks[key].Amarillo++; else weeks[key].Verde++;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-8).map((w) => ({ name: new Date(w.week).toLocaleDateString("es", { day: "numeric", month: "short" }), ...w }));
  }, [walks]);

  const greenCount = walks.filter((w) => w.traffic_light === "green").length;
  const yellowCount = walks.filter((w) => w.traffic_light === "yellow").length;
  const redCount = walks.filter((w) => w.traffic_light === "red").length;
  const totalWalks = walks.length || 1;
  const greenPct = Math.round((greenCount / totalWalks) * 100);
  const yellowPct = Math.round((yellowCount / totalWalks) * 100);
  const redPct = Math.round((redCount / totalWalks) * 100);

  return (
    <div className="space-y-6 pt-3">
      {/* ═══ Walk Session (inline) ═══ */}
      {showWalk ? (
        <WalkSession
          allDogs={allDogs}
          userId={userId}
          onDone={() => setShowWalk(false)}
          onClose={() => setShowWalk(false)}
        />
      ) : (
        <button
          onClick={() => setShowWalk(true)}
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-[1.5rem] py-5 font-bold text-lg shadow-lg shadow-primary-600/25 transition-all active:scale-[0.98]"
        >
          <Pause className="w-6 h-6" /> INICIAR PASEO
        </button>
      )}

      {!dog ? (
        <p className="text-center text-zinc-500 py-8">Registra un perro para empezar a trackear paseos.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TrafficGauge greenPct={greenPct} yellowPct={yellowPct} redPct={redPct} />
            <StreakWidget streakDays={streakDays} />
          </div>

          {/* Today Summary — moved above Agilidad/Salud */}
          <div className="card-soft rounded-[1.5rem] p-5 space-y-3">
            <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary-500" /><h3 className="text-sm font-bold text-zinc-800">Hoy</h3></div>
            {todayStats ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-50 rounded-xl p-3"><p className="text-lg font-bold text-primary-600">{todayStats.count}</p><p className="text-[10px] text-zinc-500">Paseos</p></div>
                  <div className="bg-zinc-50 rounded-xl p-3"><p className="text-lg font-bold text-zinc-700">{todayStats.mins}m</p><p className="text-[10px] text-zinc-500">Minutos</p></div>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-warning-500" />{todayStats.pipis}</span>
                  <span className="flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-secondary-500" />{todayStats.popos}</span>
                  <span className={`font-semibold ${todayStats.avg <= 1.3 ? "text-secondary-600" : todayStats.avg <= 2.3 ? "text-warning-600" : "text-danger-600"}`}>{todayStats.avg <= 1.3 ? "Calma" : todayStats.avg <= 2.3 ? "Tensión" : "Estrés"}</span>
                </div>
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-zinc-400">Sin paseos registrados hoy</p>
                {!showWalk && (
                  <button onClick={() => setShowWalk(true)} className="inline-block mt-2 rounded-xl bg-primary-600 text-white px-4 py-2 text-xs font-bold active:scale-[0.98] transition-all">
                    Iniciar Paseo
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/guau/app/tracker/agilidad"
              className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] border-2 border-zinc-100 card-soft transition-all active:scale-[0.97] hover:border-accent-400 hover:bg-accent-50">
              <img src="/icons/atleta bc.png" alt="Agilidad" className="w-20 h-20 object-contain drop-shadow-md" />
              <span className="text-sm font-bold text-zinc-700">Agilidad</span>
              <span className="text-[10px] text-zinc-400">{agilitySessions.length} sesiones</span>
            </Link>
            <Link href="/guau/app/tracker/salud"
              className="flex flex-col items-center gap-2 p-5 rounded-[1.5rem] border-2 border-zinc-100 card-soft transition-all active:scale-[0.97] hover:border-accent-400 hover:bg-accent-50">
              <img src="/icons/doctor bc.png" alt="Salud" className="w-20 h-20 object-contain drop-shadow-md" />
              <span className="text-sm font-bold text-zinc-700">Salud</span>
              <span className="text-[10px] text-zinc-400">{vaccines.length} vacunas</span>
            </Link>
          </div>

          {/* Calendar */}
          <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-800">{MONTHS[calMonth]} {calYear}</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => navigateMonth(-1)} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => navigateMonth(1)} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">{WEEKDAYS.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-zinc-400 py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {calendarGrid.map((cell, i) => (
                <button key={i} onClick={() => setSelectedDate(cell.date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${getBg(cell.avg, cell.isCurrentMonth)} ${cell.isToday ? "ring-2 ring-primary-400 ring-offset-1" : ""} ${cell.date === selectedDate ? "ring-2 ring-primary-600" : ""}`}>
                  <span className={`text-xs font-semibold ${getText(cell.avg, cell.isCurrentMonth)}`}>{cell.day}</span>
                  {cell.isCurrentMonth && cell.count > 0 && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${getDot(cell.avg)}`} />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 justify-center pt-2">
              {[{ dot: "bg-secondary-500", label: "Calma" }, { dot: "bg-warning-500", label: "Tensión" }, { dot: "bg-danger-500", label: "Estrés" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1 text-[10px] text-zinc-400"><span className={`w-2.5 h-2.5 rounded-full ${l.dot}`} /> {l.label}</div>
              ))}
            </div>
          </div>

          {/* Walk Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-bold text-zinc-800 truncate">
                Paseos del {new Date(selectedDate + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })}
              </h3>
              {selectedWalks.length > 0 && <span className="text-xs text-zinc-400">({selectedWalks.length})</span>}
            </div>
            {selectedWalks.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">No hay paseos registrados este día</p>
            ) : (
              <div className="space-y-2">
                {selectedWalks.map((w) => {
                  const durMin = w.duration_sec ? Math.round(w.duration_sec / 60) : 0;
                  const dot = w.traffic_light === "green" ? "bg-secondary-500" : w.traffic_light === "yellow" ? "bg-warning-500" : "bg-danger-500";
                  const label = w.traffic_light === "green" ? "Calma" : w.traffic_light === "yellow" ? "Tensión" : "Estrés";
                  return (
                    <div key={w.id} className="card-soft rounded-[1.25rem] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full ${dot}`} />
                          <span className="text-sm font-semibold text-zinc-700">{new Date(w.start_time).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span className="text-sm text-zinc-600">{durMin} min</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${w.traffic_light === "green" ? "bg-secondary-100 text-secondary-700" : w.traffic_light === "yellow" ? "bg-warning-100 text-warning-700" : "bg-danger-100 text-danger-700"}`}>{label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-700">
                        {w.pipi_count > 0 && <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-warning-500" />{w.pipi_count} pipí</span>}
                        {w.popo_count > 0 && <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-secondary-500" />{w.popo_count} popó</span>}
                        {w.stool_rating && <span className="flex items-center gap-1">💩 Heces: {w.stool_rating}/5</span>}
                      </div>
                      {w.trigger_tags && w.trigger_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {w.trigger_tags.map((t, i) => (<span key={i} className="text-[10px] font-medium bg-zinc-100 rounded-full px-2 py-0.5 text-zinc-600">{t}</span>))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reactivity chart */}
          {reactivityData.length > 1 && (
            <div className="card-soft rounded-[1.5rem] p-5">
              <h3 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wide">Evolución Semanal</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={reactivityData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip />
                  <Bar dataKey="Verde" stackId="a" fill="#16a34a" radius={[4,4,0,0]} />
                  <Bar dataKey="Amarillo" stackId="a" fill="#ea580c" radius={[4,4,0,0]} />
                  <Bar dataKey="Rojo" stackId="a" fill="#dc2626" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ================================================================ */
/*  TRAFFIC GAUGE — half-circle with 3 segments                     */
/* ================================================================ */
function TrafficGauge({ greenPct, yellowPct, redPct }: { greenPct: number; yellowPct: number; redPct: number }) {
  const [selected, setSelected] = useState<"green" | "yellow" | "red">(() => {
    if (greenPct >= yellowPct && greenPct >= redPct) return "green";
    if (yellowPct >= greenPct && yellowPct >= redPct) return "yellow";
    return "red";
  });

  const total = greenPct + yellowPct + redPct || 1;
  const cx = 100, cy = 94, r = 76;
  const totalAngle = Math.PI;

  const greenAngle = (greenPct / total) * totalAngle;
  const yellowAngle = (yellowPct / total) * totalAngle;

  const startAngle = Math.PI;
  const greenEnd = startAngle + greenAngle;
  const yellowEnd = greenEnd + yellowAngle;

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  });

  const greenStart = toXY(startAngle);
  const greenStop = toXY(greenEnd);
  const yellowStop = toXY(yellowEnd);
  const redStop = toXY(startAngle + totalAngle);

  const fmt = (n: number) => n.toFixed(1);
  const arcPath = (sx: number, sy: number, ex: number, ey: number) =>
    `M ${fmt(sx)} ${fmt(sy)} A ${r} ${r} 0 0 1 ${fmt(ex)} ${fmt(ey)}`;

  const segments = [
    { key: "green" as const, pct: greenPct, color: "#2ec4a8", label: "Calma" },
    { key: "yellow" as const, pct: yellowPct, color: "#fb923c", label: "Tensión" },
    { key: "red" as const, pct: redPct, color: "#f87171", label: "Estrés" },
  ];

  const sel = segments.find((s) => s.key === selected)!;

  return (
    <div className="card-soft rounded-[1.5rem] p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-zinc-50/60 pointer-events-none" />

      <div className="relative w-full max-w-[180px] mx-auto">
        <svg viewBox="0 0 200 108" className="w-full">
          {/* Background track */}
          <path
            d="M 24 94 A 76 76 0 0 1 176 94"
            fill="none" stroke="currentColor" strokeWidth="14"
            className="text-zinc-100" strokeLinecap="round"
          />

          {/* Colored segments */}
          {segments.filter((s) => s.pct > 0).map((seg) => {
            let d = "";
            if (seg.key === "green") d = arcPath(greenStart.x, greenStart.y, greenStop.x, greenStop.y);
            else if (seg.key === "yellow") d = arcPath(greenStop.x, greenStop.y, yellowStop.x, yellowStop.y);
            else d = arcPath(yellowStop.x, yellowStop.y, redStop.x, redStop.y);

            const isActive = selected === seg.key;

            return (
              <g key={seg.key}>
                {/* Invisible hit area */}
                <path d={d} fill="none" stroke="transparent" strokeWidth="32"
                  className="cursor-pointer" onClick={() => setSelected(seg.key)} />
                {/* Visible arc */}
                <path d={d} fill="none" stroke={seg.color} strokeWidth="14"
                  strokeLinecap="round"
                  className={`cursor-pointer transition-all duration-300 ${isActive ? "opacity-100" : "opacity-100"}`}
                  onClick={() => setSelected(seg.key)} />
              </g>
            );
          })}

          {/* Center dot */}
          <circle
            cx={cx + r * Math.cos(selected === "green" ? (startAngle + greenAngle / 2) : selected === "yellow" ? (greenEnd + yellowAngle / 2) : (yellowEnd + (startAngle + totalAngle - yellowEnd) / 2))}
            cy={cy + r * Math.sin(selected === "green" ? (startAngle + greenAngle / 2) : selected === "yellow" ? (greenEnd + yellowAngle / 2) : (yellowEnd + (startAngle + totalAngle - yellowEnd) / 2))}
            r="7" fill="white" stroke={sel.color} strokeWidth="3" className="drop-shadow-sm"
          />
        </svg>

        {/* Label overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-9 pointer-events-none">
          <span className={`text-2xl font-extrabold tabular-nums tracking-tight ${ sel.key === "green" ? "text-secondary-600" : sel.key === "yellow" ? "text-warning-600" : "text-danger-600" }`}>
            {sel.pct}%
          </span>
          <span className={`text-[11px] font-bold mt-0.5 ${ sel.key === "green" ? "text-secondary-500" : sel.key === "yellow" ? "text-warning-500" : "text-danger-500" }`}>
            {sel.label}
          </span>
        </div>
      </div>

      {/* Bottom color dots for context */}
      <div className="flex items-center gap-2 mt-2 relative z-10">
        {segments.map((seg) => (
          <button
            key={seg.key}
            onClick={() => setSelected(seg.key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${ selected === seg.key ? "bg-zinc-100 shadow-sm scale-105" : "hover:bg-zinc-50" }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  STREAK WIDGET — motivational racha display                       */
/* ================================================================ */
function StreakWidget({ streakDays }: { streakDays: number }) {
  const bgGradient = streakDays === 0
    ? "from-zinc-50 to-zinc-100"
    : streakDays < 7
    ? "from-warning-50/80 to-amber-50/70"
    : streakDays < 14
    ? "from-warning-100/80 to-orange-100/70"
    : "from-orange-100/80 to-amber-200/70";

  return (
    <div className={`card-soft rounded-[1.5rem] p-4 flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-br ${bgGradient}`}>
      {/* Decorative rings */}
      {streakDays >= 7 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-warning-200/40" />
          <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full border border-warning-300/30" />
        </div>
      )}

      {/* Flame icon with number inside */}
      <div className="relative mt-1">
        <Flame strokeWidth={1.25} className={`w-[5.5rem] h-[5.5rem] drop-shadow-lg ${streakDays >= 3 ? "animate-pulse" : ""} ${ streakDays === 0 ? "text-zinc-300" : streakDays < 7 ? "text-warning-400" : "text-warning-500" }`} style={{ animationDuration: streakDays >= 14 ? "1.5s" : "2.5s" }} />
        <span className={`absolute inset-x-0 top-[52%] flex justify-center text-xl font-extrabold tabular-nums ${ streakDays === 0 ? "text-zinc-300" : streakDays < 7 ? "text-warning-400" : "text-warning-500" }`}>
          {streakDays}
        </span>
      </div>

      {/* Bottom area */}
      <div className="flex flex-col items-center">
        {/* Label */}
        <span className="text-[11px] font-bold text-warning-600/80 mb-1">
          Días de racha
        </span>

        {/* Mini streak dots */}
        {streakDays > 0 && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(streakDays, 12) }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${ i < 3 ? "bg-warning-300" : i < 7 ? "bg-warning-400" : i < 10 ? "bg-orange-400" : "bg-orange-500" }`}
                style={{ opacity: 0.35 + (i / Math.min(streakDays, 12)) * 0.65 }}
              />
            ))}
            {streakDays > 12 && (
              <span className="text-[8px] text-warning-500 font-bold ml-0.5">+{streakDays - 12}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
