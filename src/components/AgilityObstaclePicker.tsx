"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, X, Check } from "lucide-react";
import type { AgilityObstacle } from "@/types/database";

interface Props {
  selected: AgilityObstacle[];
  onChange: (obstacles: AgilityObstacle[]) => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; emoji: string; color: string; lightBg: string; border: string }> = {
  contacto: { label: "Contacto", emoji: "🐾", color: "text-blue-600", lightBg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
  salto: { label: "Salto", emoji: "🦘", color: "text-green-600", lightBg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800" },
  slalom: { label: "Slalom", emoji: "〰️", color: "text-yellow-600", lightBg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  tunel: { label: "Túnel", emoji: "🌀", color: "text-purple-600", lightBg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800" },
  entrenamiento: { label: "Entrenamiento", emoji: "🎯", color: "text-orange-600", lightBg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
};

export function AgilityObstaclePicker({
  selected,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestCategory, setSuggestCategory] = useState("salto");
  const [suggestIcon, setSuggestIcon] = useState("Zap");
  const [allObstacles, setAllObstacles] = useState<AgilityObstacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load obstacles immediately on mount
  useEffect(() => {
    fetch("/api/agility/obstacles")
      .then((r) => r.json())
      .then((json) => {
        if (json.obstacles && json.obstacles.length > 0) {
          setAllObstacles(json.obstacles);
          setLoadError(null);
        } else {
          setLoadError("No se encontraron obstáculos. Verifica la conexión o recarga la página.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading obstacles:", err);
        setLoadError("Error cargando obstáculos. Intenta recargar la página.");
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allObstacles;
    return allObstacles.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        CATEGORY_CONFIG[o.category]?.label.toLowerCase().includes(q)
    );
  }, [allObstacles, search]);

  const grouped = useMemo(() => {
    const map: Record<string, AgilityObstacle[]> = {};
    filtered.forEach((o) => {
      if (!map[o.category]) map[o.category] = [];
      map[o.category].push(o);
    });
    return map;
  }, [filtered]);

  const toggleObstacle = (obstacle: AgilityObstacle) => {
    const exists = selected.find((s) => s.id === obstacle.id);
    if (exists) {
      onChange(selected.filter((s) => s.id !== obstacle.id));
    } else {
      onChange([...selected, obstacle]);
    }
  };

  const handleSuggest = async () => {
    if (!suggestName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/agility/obstacles/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestName.trim(),
          category: suggestCategory,
          icon_name: suggestIcon,
        }),
      });
      const json = await res.json();
      if (json.obstacle) {
        setAllObstacles((prev) => [...prev, json.obstacle]);
        toggleObstacle(json.obstacle);
        setSuggesting(false);
        setSuggestName("");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar obstáculo..."
          className="w-full rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((obs) => (
            <div
              key={obs.id}
              className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {obs.name}
              <button
                onClick={() => toggleObstacle(obs)}
                className="ml-1 text-primary-400 hover:text-danger-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {loadError && !loading && (
        <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs text-center">
          {loadError}
        </div>
      )}

      {/* Results */}
      {!loading && !loadError && (
        <div className="max-h-80 overflow-y-auto space-y-5 pr-1">
          {Object.entries(grouped).map(([category, obstacles]) => {
            const config = CATEGORY_CONFIG[category] || { label: category, emoji: "🏁", color: "text-zinc-600", lightBg: "bg-zinc-50", border: "border-zinc-200" };
            return (
              <div key={category}>
                <div className={`flex items-center gap-1.5 mb-2 px-2 py-1 rounded-lg ${config.lightBg} ${config.border} border w-fit`}>
                  <span className="text-sm">{config.emoji}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-[10px] text-zinc-400">({obstacles.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {obstacles.map((obs) => {
                    const isSelected = selected.some((s) => s.id === obs.id);
                    return (
                      <button
                        key={obs.id}
                        onClick={() => toggleObstacle(obs)}
                        className={`relative flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all active:scale-[0.97] ${
                          isSelected
                            ? `${config.lightBg} ${config.border} border-2`
                            : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                            isSelected
                              ? `${config.color} bg-white dark:bg-zinc-800 shadow-sm`
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {isSelected ? "✅" : "➕"}
                        </div>
                        <span className={`font-semibold text-[11px] leading-tight ${isSelected ? config.color : "text-zinc-700 dark:text-zinc-300"}`}>
                          {obs.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && search && (
            <div className="text-center py-6 space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="text-xs text-zinc-400">
                No encontramos "{search}"<br/>¿Quieres sugerirlo?
              </p>
            </div>
          )}
        </div>
      )}

      {/* Suggest */}
      {!suggesting ? (
        <button
          onClick={() => setSuggesting(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Sugerir obstáculo
        </button>
      ) : (
        <div className="space-y-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <input
            type="text"
            value={suggestName}
            onChange={(e) => setSuggestName(e.target.value)}
            placeholder="Nombre del obstáculo"
            className="w-full rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <select
              value={suggestCategory}
              onChange={(e) => setSuggestCategory(e.target.value)}
              className="flex-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.emoji} {config.label}</option>
              ))}
            </select>
            <select
              value={suggestIcon}
              onChange={(e) => setSuggestIcon(e.target.value)}
              className="w-24 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm"
            >
              <option value="Zap">Rayo</option>
              <option value="Triangle">Triángulo</option>
              <option value="Circle">Círculo</option>
              <option value="Square">Cuadrado</option>
              <option value="Star">Estrella</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSuggesting(false)}
              className="flex-1 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSuggest}
              disabled={!suggestName.trim() || saving}
              className="flex-1 py-2 rounded-lg bg-primary-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Sugerir"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
