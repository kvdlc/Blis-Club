"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { useCountries } from "@/lib/countries";

interface Props {
  value: string;
  onChange: (fullNumber: string) => void;
  defaultCountryCode?: string;
}

export function PhoneInput({ value, onChange, defaultCountryCode }: Props) {
  const { countries } = useCountries();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Parse current value: "+51 999888777" -> code="+51", number="999888777"
  const parseValue = (val: string) => {
    const match = val.match(/^(\+?\d+)\s*(.*)$/);
    return {
      code: match?.[1] || defaultCountryCode || "+51",
      number: match?.[2] || val,
    };
  };

  const { code, number } = parseValue(value);
  const selectedCountry = countries.find((c) => c.callingCode === code);
  const defaultCountry = countries.find((c) => c.cca2 === defaultCountryCode);

  const displayCountry = selectedCountry || defaultCountry || { cca2: "PE", flag: "🇵🇪", name: "Perú", callingCode: "+51" };

  const filtered = search.trim()
    ? countries.filter((c) => c.callingCode.includes(search) || c.name.toLowerCase().includes(search.toLowerCase()))
    : countries;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCodeSelect = (callingCode: string) => {
    const newVal = `${callingCode} ${number}`;
    onChange(newVal);
    setOpen(false);
    setSearch("");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, "");
    onChange(`${code} ${newNumber}`);
  };

  return (
    <div className="flex gap-2">
      <div ref={ref} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 transition-colors"
        >
          <img src={displayCountry.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
          <span className="text-xs font-medium">{code}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-56 bg-white rounded-xl border border-zinc-200 shadow-xl max-h-60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-100">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar código..."
                className="flex-1 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filtered.map((c) => (
                <button
                  key={c.cca2}
                  onClick={() => handleCodeSelect(c.callingCode)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 transition-colors ${ c.callingCode === code ? "bg-primary-50" : "" }`}
                >
                  <img src={c.flag} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                  <span className="flex-1 text-left text-xs">{c.name}</span>
                  <span className="text-xs font-mono text-zinc-400">{c.callingCode}</span>
                  {c.callingCode === code && <Check className="w-3.5 h-3.5 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <input
        type="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder="999888777"
        className="flex-1 rounded-xl bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  );
}
