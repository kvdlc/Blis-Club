"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from "lucide-react";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface Props {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  label?: string;
  colorTheme?: "primary" | "auto";
}

export function DatePicker({ value, onChange, min, max, label, colorTheme = "auto" }: Props) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value + "T00:00:00").getMonth();
    return new Date().getMonth();
  });
  const [viewYear, setViewYear] = useState(() => {
    if (value) return new Date(value + "T00:00:00").getFullYear();
    return new Date().getFullYear();
  });
  const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days");

  const ref = useRef<HTMLDivElement>(null);
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();

  const formatDisplay = (date: string) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  };

  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay();
    const mondayStart = startDow === 0 ? 6 : startDow - 1;

    const cells: { day: number; date: string; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] = [];

    for (let i = mondayStart - 1; i >= 0; i--) {
      const d = new Date(viewYear, viewMonth, -i);
      const dateStr = d.toISOString().slice(0, 10);
      cells.push({ day: d.getDate(), date: dateStr, isCurrentMonth: false, isToday: false, isSelected: dateStr === value, isDisabled: Boolean((min && dateStr < min) || (max && dateStr > max)) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewYear, viewMonth, i);
      const dateStr = d.toISOString().slice(0, 10);
      cells.push({
        day: i, date: dateStr, isCurrentMonth: true,
        isToday: d.toDateString() === today.toDateString(),
        isSelected: dateStr === value,
        isDisabled: Boolean((min && dateStr < min) || (max && dateStr > max)),
      });
    }

    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(viewYear, viewMonth + 1, i);
        const dateStr = d.toISOString().slice(0, 10);
        cells.push({ day: d.getDate(), date: dateStr, isCurrentMonth: false, isToday: false, isSelected: dateStr === value, isDisabled: Boolean((min && dateStr < min) || (max && dateStr > max)) });
      }
    }
    return cells;
  }, [viewMonth, viewYear, value, min, max, today]);

  const navigate = (dir: number) => {
    if (pickerMode === "days" || pickerMode === "months") {
      let m = viewMonth + dir, y = viewYear;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      setViewMonth(m); setViewYear(y);
    } else {
      setViewYear((y) => y + dir * 12);
    }
  };

  const selectDate = (date: string) => {
    onChange(date);
    setOpen(false);
    setPickerMode("days");
  };

  const selectMonth = (month: number) => {
    setViewMonth(month);
    setPickerMode("days");
  };

  const selectYear = (year: number) => {
    setViewYear(year);
    setPickerMode("days");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = useMemo(() => {
    const start = Math.floor(viewYear / 12) * 12;
    const arr: number[] = [];
    for (let i = -1; i <= 12; i++) arr.push(start + i);
    return arr;
  }, [viewYear]);

  const title = pickerMode === "years"
    ? `${Math.floor(viewYear / 12) * 12} — ${Math.floor(viewYear / 12) * 12 + 11}`
    : pickerMode === "months"
      ? `${viewYear}`
      : `${MONTHS[viewMonth]} ${viewYear}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setPickerMode("days"); }}
        className="w-full flex items-center gap-2 rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-sm text-left hover:bg-zinc-700/70 hover:border-auto-500/30 transition-colors"
      >
        <CalendarDays className="w-4 h-4 shrink-0 text-auto-400" />
        <span className={`flex-1 truncate ${value ? "text-zinc-100" : "text-zinc-500"}`}>
          {value ? formatDisplay(value) : (label || "Seleccionar fecha")}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 min-w-[268px] max-w-[calc(100vw-2rem)] bg-zinc-900 rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.55)] p-3 space-y-2.5">
          {/* Month/Year nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-auto-300 hover:border-auto-500/40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPickerMode(pickerMode === "days" ? "months" : pickerMode === "months" ? "years" : "days")}
              className="text-sm font-bold text-zinc-100 transition-colors px-2 hover:text-auto-300">
              {title}
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-auto-300 hover:border-auto-500/40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {pickerMode === "days" && (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-zinc-500 py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {grid.map((cell, i) => {
                  const cls = cell.isDisabled
                    ? "text-zinc-700 cursor-not-allowed"
                    : cell.isSelected
                      ? "bg-auto-500 text-white shadow-[0_0_14px_rgba(16,185,129,0.55)]"
                      : cell.isToday
                        ? "text-auto-300 ring-1 ring-auto-500/40"
                        : cell.isCurrentMonth
                          ? "text-zinc-300 hover:bg-white/[0.06]"
                          : "text-zinc-600";
                  return (
                    <button key={i} type="button" onClick={() => !cell.isDisabled && selectDate(cell.date)} disabled={cell.isDisabled}
                      className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${cls}`}>
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* Quick list of months */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
                {MONTHS_SHORT.map((m, i) => (
                  <button key={m} onClick={() => selectMonth(i)}
                    className={`text-[10px] font-semibold rounded-lg py-1.5 transition-colors ${i === viewMonth ? "bg-auto-500/15 text-auto-300" : "text-zinc-500 hover:bg-white/[0.06]"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </>
          )}

          {pickerMode === "months" && (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, i) => (
                <button key={m} onClick={() => selectMonth(i)}
                  className={`text-[11px] font-semibold rounded-xl py-2.5 transition-colors ${i === viewMonth ? "bg-auto-500 text-white" : "text-zinc-300 hover:bg-white/[0.06]"}`}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {pickerMode === "years" && (
            <div className="grid grid-cols-4 gap-1.5">
              {years.map((y) => (
                <button key={y} onClick={() => selectYear(y)}
                  className={`text-xs font-semibold rounded-xl py-2.5 transition-colors ${y === viewYear ? "bg-auto-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]" : y === today.getFullYear() ? "text-auto-300 ring-1 ring-auto-500/40" : "text-zinc-300 hover:bg-white/[0.06]"}`}>
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
