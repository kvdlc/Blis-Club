"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

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

export function DatePicker({ value, onChange, min, max, label, colorTheme = "primary" }: Props) {
  const c = colorTheme === "auto" ? "auto" : "primary";
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return new Date(value + "T00:00:00").getMonth();
    return new Date().getMonth();
  });
  const [viewYear, setViewYear] = useState(() => {
    if (value) return new Date(value + "T00:00:00").getFullYear();
    return new Date().getFullYear();
  });
  const [pickerMode, setPickerMode] = useState<"days" | "years">("days");

  const ref = useRef<HTMLDivElement>(null);
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();

  const formatDisplay = (date: string) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Day grid
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
    if (pickerMode === "days") {
      let m = viewMonth + dir, y = viewYear;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      setViewMonth(m); setViewYear(y);
    } else {
      setViewYear((y) => y + dir * 10);
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

  const goToYearPicker = () => setPickerMode("years");

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
  }, [value]);

  // Year grid (show ~20 years centered on current)
  const years = useMemo(() => {
    const start = Math.floor(viewYear / 10) * 10;
    const arr: number[] = [];
    for (let i = -1; i <= 10; i++) arr.push(start + i);
    return arr;
  }, [viewYear]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setPickerMode("days"); }}
        className="w-full flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm text-left hover:bg-zinc-100 transition-colors"
      >
        <CalendarDays className={`w-4 h-4 shrink-0 ${c === "auto" ? "text-auto-400" : "text-primary-400"}`} />
        <span className={`flex-1 truncate ${value ? "text-zinc-900" : "text-zinc-400"}`}>
          {value ? formatDisplay(value) : (label || "Seleccionar fecha")}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 min-w-[260px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-zinc-200 shadow-2xl p-4 space-y-3 max-h-[85vh] overflow-y-auto">
          {/* Month/Year nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToYearPicker} className={`text-sm font-bold text-zinc-800 transition-colors px-2 ${c === "auto" ? "hover:text-auto-500" : "hover:text-primary-500"}`}>
              {pickerMode === "years" ? `${Math.floor(viewYear / 10) * 10} - ${Math.floor(viewYear / 10) * 10 + 9}` : `${MONTHS[viewMonth]} ${viewYear}`}
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {pickerMode === "days" && (
            <>
              {/* Month picker quick-select */}
              <div className="grid grid-cols-4 gap-1">
                {MONTHS_SHORT.map((m, i) => (
                  <button key={m} onClick={() => selectMonth(i)}
                    className={`text-[10px] font-semibold rounded-lg py-1.5 transition-colors ${i === viewMonth ? (c === "auto" ? "bg-auto-100 text-auto-700" : "bg-primary-100 text-primary-700") : "text-zinc-500 hover:bg-zinc-100"}`}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-zinc-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {grid.map((cell, i) => (
                  <button key={i} type="button" onClick={() => !cell.isDisabled && selectDate(cell.date)} disabled={cell.isDisabled}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${ cell.isDisabled ? "text-zinc-300 cursor-not-allowed" : cell.isSelected ? (c === "auto" ? "bg-auto-500 text-white shadow-md" : "bg-primary-500 text-white shadow-md") : cell.isToday ? "bg-secondary-100 text-secondary-700 ring-1 ring-secondary-300" : cell.isCurrentMonth ? "text-zinc-700 hover:bg-zinc-100" : "text-zinc-300" }`}>
                    {cell.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {pickerMode === "years" && (
            <div className="grid grid-cols-4 gap-2">
              {years.map((y) => (
                <button key={y} onClick={() => selectYear(y)}
                  className={`text-xs font-semibold rounded-xl py-2.5 transition-colors ${y === viewYear ? (c === "auto" ? "bg-auto-500 text-white shadow-md" : "bg-primary-500 text-white shadow-md") : y === today.getFullYear() ? "bg-secondary-100 text-secondary-700" : "text-zinc-600 hover:bg-zinc-100"}`}>
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
