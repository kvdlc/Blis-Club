"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Clock } from "lucide-react";
import { TIMEZONES, type TimezoneOption } from "@/lib/timezones";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function TimezonePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = TIMEZONES.find((t) => t.value === value) || TIMEZONES[0];

  const filtered = search.trim()
    ? TIMEZONES.filter((t) =>
        t.label.toLowerCase().includes(search.toLowerCase())
      )
    : TIMEZONES;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2.5 text-sm text-left hover:bg-zinc-100 transition-colors"
      >
        <span className="text-lg">{selected.flag}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-800 truncate">{selected.city}, {selected.country}</p>
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400 ml-auto">{selected.offset}</span>
        <div className={`w-5 h-5 rounded-lg bg-zinc-200 flex items-center justify-center transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-2xl border border-zinc-200 shadow-2xl max-h-64 overflow-hidden">
          <div className="sticky top-0 bg-white p-2 border-b border-zinc-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ciudad..."
                autoFocus
                className="w-full rounded-lg bg-zinc-50 border border-zinc-200 pl-8 pr-3 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((tz) => (
              <button
                key={tz.value}
                onClick={() => { onChange(tz.value); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors ${ tz.value === value ? "bg-primary-50" : "" }`}
              >
                <span className="text-base shrink-0">{tz.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-800 truncate">{tz.city}</p>
                  <p className="text-[10px] text-zinc-400">{tz.country}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{tz.offset}</span>
                {tz.value === value && <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
