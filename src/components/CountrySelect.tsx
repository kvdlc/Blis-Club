"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useCountries, type Country } from "@/lib/countries";

interface Props {
  value: string;
  onChange: (cca2: string) => void;
  placeholder?: string;
}

export function CountrySelect({ value, onChange, placeholder = "Seleccionar país" }: Props) {
  const { countries, loading } = useCountries();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = countries.find((c) => c.cca2 === value);

  const filtered = search.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : countries;

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
        className="w-full flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm text-left hover:bg-zinc-100 transition-colors"
      >
        {selected ? (
          <>
            <img src={selected.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
            <span className="flex-1 text-zinc-900">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-zinc-400">{loading ? "Cargando..." : placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-zinc-200 shadow-xl max-h-60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar país..."
              className="flex-1 bg-transparent text-xs focus:outline-none text-zinc-700"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((c) => (
              <button
                key={c.cca2}
                onClick={() => { onChange(c.cca2); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors ${ c.cca2 === value ? "bg-primary-50" : "" }`}
              >
                <img src={c.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-[10px] text-zinc-400">{c.callingCode}</span>
                {c.cca2 === value && <Check className="w-3.5 h-3.5 text-primary-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
