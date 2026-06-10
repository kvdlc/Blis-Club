"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, X, ChefHat, UtensilsCrossed, Activity, GraduationCap, Loader2, Stethoscope, Syringe, Footprints, Zap } from "lucide-react";
import type { NutritionRecipe, Lesson } from "@/types/database";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; desc: string; href: string; icon: any }[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const defaultSuggestions = [
    { label: "Recetario", desc: "Explorar recetas BARF", href: "/guau/app/nutricion", icon: ChefHat },
    { label: "Calculadora BARF", desc: "Calcular porciones diarias", href: "/guau/app/nutricion", icon: UtensilsCrossed },
    { label: "Academia", desc: "Cursos de entrenamiento canino", href: "/guau/app/academia", icon: GraduationCap },
    { label: "Tracker de Paseos", desc: "Registrar paseos y actividad", href: "/guau/app/tracker", icon: Activity },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => document.getElementById("globalSearchInput")?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const { data: recipes } = await supabase.from("nutrition_recipes").select("id, title, category").ilike("title", `%${query}%`).limit(3);
      const { data: lessons } = await supabase.from("lessons").select("id, title, type, module_id").ilike("title", `%${query}%`).limit(3);
      const { data: stages } = await supabase.from("stages").select("id, title").ilike("title", `%${query}%`).limit(3);
      const { data: toxicFoods } = await supabase.from("toxic_foods").select("id, name, is_toxic").ilike("name", `%${query}%`).limit(3);

      const items: { label: string; desc: string; href: string; icon: any }[] = [];

      (recipes as any[] | null)?.forEach((r: any) => {
        items.push({ label: r.title, desc: "Receta · " + r.category, href: `/guau/app/nutricion/recetario/${r.id}`, icon: ChefHat });
      });

      (lessons as any[] | null)?.forEach((l: any) => {
        items.push({ label: l.title, desc: "Lección de Academia", href: `/guau/app/academia`, icon: GraduationCap });
      });

      (stages as any[] | null)?.forEach((s: any) => {
        items.push({ label: s.title, desc: "Etapa de Academia", href: `/guau/app/academia/${s.id}`, icon: GraduationCap });
      });

      (toxicFoods as any[] | null)?.forEach((f: any) => {
        items.push({ label: f.name, desc: f.is_toxic ? "⚠️ Alimento tóxico" : "✅ Alimento seguro", href: `/guau/app/nutricion`, icon: Stethoscope });
      });

      setResults(items);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  };

  const displayItems = query.length >= 3 ? results : defaultSuggestions;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${ open ? "bg-primary-500 text-white shadow-md" : "bg-white/80 backdrop-blur-sm border border-zinc-100 text-zinc-600" }`}
      >
        <Search className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div ref={ref} className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Search className="w-4 h-4 text-primary-600" />
              </div>
              <input
                id="globalSearchInput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar recetas, lecciones..."
                className="flex-1 bg-transparent text-sm focus:outline-none text-zinc-800 placeholder:text-zinc-400"
              />
              {loading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />}
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>

            <div className="py-2 max-h-72 overflow-y-auto">
              {query.length >= 3 && results.length === 0 && !loading && (
                <p className="text-sm text-zinc-400 text-center py-6">Sin resultados para "{query}"</p>
              )}
              {displayItems.map((s, i) => (
                <button key={i} onClick={() => navigate(s.href)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-zinc-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{s.label}</p>
                    <p className="text-xs text-zinc-400">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="px-5 py-2 border-t border-zinc-100 flex items-center gap-3 text-[10px] text-zinc-400">
              <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">Esc</kbd> cerrar</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">⌘K</kbd> atajo</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
