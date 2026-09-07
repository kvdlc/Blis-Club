"use client";

import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
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

interface Pos { left: number; top: number; width: number; }

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
  const [pos, setPos] = useState<Pos | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRectRef = useRef<DOMRect | null>(null);
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();

  const widthFor = useCallback((vw: number) => Math.max(200, Math.min(288, vw - 16)), []);

  // Calcula la posición óptima (dentro de la pantalla) al abrir o al cambiar de modo
  const updatePos = useCallback(() => {
    const r = triggerRectRef.current;
    if (!r) return;
    const vw = window.innerWidth || 360;
    const vh = window.innerHeight || 600;
    const W = widthFor(vw);

    // Horizontal: prefiere alinear borde derecho con el botón, clampeado en pantalla
    let left = r.right - W;
    if (left < 8) left = 8;
    if (left + W > vw - 8) left = Math.max(8, vw - 8 - W);

    // Vertical: primero hacia abajo; se ajusta con el alto real del panel
    let top = r.bottom + 4;
    setPos({ left, top, width: W });
  }, [widthFor]);

  const openPicker = () => {
    if (triggerRef.current) {
      triggerRectRef.current = triggerRef.current.getBoundingClientRect();
    }
    setPickerMode("days");
    setOpen((o) => {
      if (o) return false;
      updatePos();
      return true;
    });
  };

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
      setViewYear((y) => y + dir * 5);
    }
  };

  const selectDate = (date: string) => {
    onChange(date);
    setOpen(false);
    setPos(null);
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

  // Cerrar al hacer click fuera (botón + panel)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
      setPos(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reposicionar al cambiar de modo / reabrir (usa el alto real del panel)
  useLayoutEffect(() => {
    if (!open || !pos || !panelRef.current) return;
    const panelH = panelRef.current.offsetHeight;
    const r = triggerRectRef.current;
    const vh = window.innerHeight || 600;
    if (r) {
      // Si no cabe hacia abajo, abrir hacia arriba
      if (r.bottom + 4 + panelH > vh - 8 && r.top - panelH - 4 > 8) {
        setPos((p) => (p && p.top === r.bottom + 4 ? { ...p, top: r.top - panelH - 4 } : p));
      }
    }
  }, [open, pickerMode, pos]);

  // Si el usuario hace scroll o resize con el panel abierto, reposicionar
  useEffect(() => {
    if (!open) return;
    const onReposition = () => {
      if (triggerRef.current) {
        triggerRectRef.current = triggerRef.current.getBoundingClientRect();
      }
      updatePos();
    };
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = useMemo(() => {
    // Rango contiguo centrado en viewYear, con mucho margen al futuro
    const from = viewYear - 4;
    const to = viewYear + 15;
    const arr: number[] = [];
    for (let y = from; y <= to; y++) arr.push(y);
    return arr;
  }, [viewYear]);

  const title = pickerMode === "years"
    ? `${years[0]} — ${years[years.length - 1]}`
    : pickerMode === "months"
      ? `${viewYear}`
      : `${MONTHS[viewMonth]} ${viewYear}`;

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="w-full flex items-center gap-2 rounded-xl bg-zinc-800 border border-white/10 px-3 py-2 text-sm text-left hover:bg-zinc-700/70 hover:border-auto-500/30 transition-colors"
      >
        <CalendarDays className="w-4 h-4 shrink-0 text-auto-400" />
        <span className={`flex-1 truncate ${value ? "text-zinc-100" : "text-zinc-500"}`}>
          {value ? formatDisplay(value) : (label || "Seleccionar fecha")}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[100] bg-zinc-900 rounded-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.55)] p-3 space-y-2.5 overflow-y-auto"
          style={pos ? { left: pos.left, top: pos.top, width: pos.width, maxHeight: "calc(100vh - 16px)" } : { visibility: "hidden" }}
        >
          {/* Month/Year nav */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-auto-300 hover:border-auto-500/40 transition-colors shrink-0">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPickerMode(pickerMode === "days" ? "months" : pickerMode === "months" ? "years" : "days")}
              className="text-sm font-bold text-zinc-100 transition-colors px-1 truncate hover:text-auto-300">
              {title}
            </button>
            <button onClick={() => navigate(1)} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-auto-300 hover:border-auto-500/40 transition-colors shrink-0">
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
        </div>,
        document.body
      )}
    </div>
  );
}
