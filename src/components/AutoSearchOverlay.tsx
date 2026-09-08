"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, X, ShoppingBag, Car, Wrench, Loader2, TrendingUp } from "lucide-react";

interface ResultItem { label: string; desc: string; href: string; icon: any; thumb?: string | null; }

export function AutoSearchOverlay({ variant = "light" }: { variant?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const defaultSuggestions: ResultItem[] = [
    { label: "Autos en venta", desc: "Ver el marketplace de autos", href: "/auto/app/marketplace#autos", icon: Car },
    { label: "Accesorios y repuestos", desc: "Explorar productos", href: "/auto/app/marketplace#productos", icon: Wrench },
    { label: "Tendencias", desc: "Lo más popular ahora", href: "/auto/app/marketplace", icon: TrendingUp },
    { label: "Publicar mi auto", desc: "Vender un vehículo", href: "/auto/app/marketplace/publicar", icon: Car },
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
    if (open) setTimeout(() => document.getElementById("autoSearchInput")?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (query.length < 3) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const q = `%${query}%`;
        const [{ data: products }, { data: autos }] = await Promise.all([
          supabase.from("marketplace_products").select("id, titulo, categoria, imagen_url, precio").eq("activo", true).ilike("titulo", q).limit(5),
          supabase.from("marketplace_listings").select("id, slug, titulo, marca, modelo, precio, fotos").eq("activo", true).eq("categoria", "autos_usados").ilike("titulo", q).limit(5),
        ]);

        const items: ResultItem[] = [];
        (products as any[] | null)?.forEach((p: any) => {
          items.push({ label: p.titulo, desc: `${p.categoria || "Producto"} · $${p.precio ?? "—"}`, href: `/auto/app/marketplace/producto/${p.id}`, icon: ShoppingBag, thumb: p.imagen_url });
        });
        (autos as any[] | null)?.forEach((a: any) => {
          items.push({ label: a.titulo, desc: `Auto usado · ${a.marca || ""} ${a.modelo || ""} · $${a.precio}`, href: `/auto/app/marketplace/${a.slug}`, icon: Car, thumb: a.fotos?.[0] });
        });
        setResults(items.slice(0, 8));
      } catch { setResults([]); }
      setLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const navigate = (href: string) => { setOpen(false); setQuery(""); setResults([]); router.push(href); };

  const isDark = variant === "dark";
  const displayItems = query.length >= 3 ? results : defaultSuggestions;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Buscar"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${open ? "bg-auto-500 text-white shadow-md" : isDark ? "bg-white/5 border border-white/10 text-zinc-400" : "bg-white/80 backdrop-blur-sm border border-zinc-100 text-zinc-600"}`}
      >
        <Search className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div ref={ref} className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden ${isDark ? "glass-card border border-white/10" : "bg-white border border-zinc-200"}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? "border-white/10" : "border-zinc-100"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-auto-600/15" : "bg-auto-100"}`}>
                <Search className={`w-4 h-4 ${isDark ? "text-auto-400" : "text-auto-600"}`} />
              </div>
              <input
                id="autoSearchInput"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar autos, accesorios, repuestos..."
                className={`flex-1 bg-transparent text-sm focus:outline-none ${isDark ? "text-zinc-100 placeholder:text-zinc-500" : "text-zinc-800 placeholder:text-zinc-400"}`}
              />
              {loading && <Loader2 className="w-4 h-4 text-auto-500 animate-spin" />}
              <button onClick={() => setOpen(false)} className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-zinc-100"}`}>
                <X className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-zinc-400"}`} />
              </button>
            </div>

            <div className="py-2 max-h-72 overflow-y-auto">
              {query.length >= 3 && results.length === 0 && !loading && (
                <p className={`text-sm text-center py-6 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Sin resultados para "{query}"</p>
              )}
              {displayItems.map((s, i) => (
                <button key={i} onClick={() => navigate(s.href)} className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${isDark ? "hover:bg-white/[0.06]" : "hover:bg-zinc-50"}`}>
                  {s.thumb ? (
                    <img src={s.thumb} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 glass-input" />
                  ) : (
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                      <s.icon className={`w-4 h-4 ${isDark ? "text-auto-400" : "text-zinc-500"}`} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>{s.label}</p>
                    <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className={`px-5 py-2 border-t flex items-center gap-3 text-[10px] ${isDark ? "border-white/10 text-zinc-500" : "border-zinc-100 text-zinc-400"}`}>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">Esc</kbd> cerrar</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">⌘K</kbd> atajo</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
