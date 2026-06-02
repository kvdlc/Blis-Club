"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Stethoscope } from "lucide-react";
import type { TrustedVet } from "@/types/database";

interface Props {
  value: string;
  onChange: (vetId: string) => void;
  trustedVets: TrustedVet[];
  placeholder?: string;
}

export function VetSelect({ value, onChange, trustedVets, placeholder = "Seleccionar veterinario" }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = trustedVets.find((v) => v.id === value);

  const filtered = search.trim()
    ? trustedVets.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.clinic_name?.toLowerCase().includes(search.toLowerCase()))
    : trustedVets;

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
        className="w-full flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      >
        <Stethoscope className="w-4 h-4 text-accent-400 shrink-0" />
        <span className={`flex-1 truncate ${selected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
          {selected ? selected.name + (selected.clinic_name ? ` · ${selected.clinic_name}` : "") : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl max-h-60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar veterinario..."
              className="flex-1 bg-transparent text-xs focus:outline-none text-zinc-700 dark:text-zinc-300"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            <button
              onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${!value ? "bg-primary-50 dark:bg-primary-950/30" : ""}`}
            >
              <span className="flex-1 text-left text-zinc-400">Sin veterinario</span>
              {!value && <Check className="w-3.5 h-3.5 text-primary-500" />}
            </button>
            {filtered.map((v) => (
              <button
                key={v.id}
                onClick={() => { onChange(v.id); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${v.id === value ? "bg-primary-50 dark:bg-primary-950/30" : ""}`}
              >
                <span className="flex-1 text-left text-zinc-700 dark:text-zinc-300">
                  {v.name}
                  {v.clinic_name && <span className="text-[10px] text-zinc-400 ml-1">· {v.clinic_name}</span>}
                </span>
                {v.specialty && <span className="text-[10px] text-accent-500 font-medium">{v.specialty}</span>}
                {v.id === value && <Check className="w-3.5 h-3.5 text-primary-500" />}
              </button>
            ))}
            {filtered.length === 0 && search.trim() && (
              <p className="text-xs text-zinc-400 text-center py-4">No se encontraron veterinarios</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
