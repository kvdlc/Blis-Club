"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, X, Check } from "lucide-react";
import type { AgilityObstacle } from "@/types/database";

interface Props {
  selected: AgilityObstacle[];
  onChange: (obstacles: AgilityObstacle[]) => void;
  onFoulsChange?: (obstacleId: string, fouls: number) => void;
  foulsMap?: Record<string, number>;
  showFouls?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  contacto: "🟦 Contacto",
  salto: "🟩 Salto",
  slalom: "🟨 Slalom",
  tunel: "🟥 Túnel",
  entrenamiento: "🟪 Entrenamiento",
};

export function AgilityObstaclePicker({
  selected,
  onChange,
  onFoulsChange,
  foulsMap = {},
  showFouls = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestName, setSuggestName] = useState("");
  const [suggestCategory, setSuggestCategory] = useState("salto");
  const [suggestIcon, setSuggestIcon] = useState("Zap");
  const [allObstacles, setAllObstacles] = useState<AgilityObstacle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load obstacles immediately on mount
  useEffect(() => {
    fetch("/api/agility/obstacles")
      .then((r) => r.json())
      .then((json) => {
        if (json.obstacles) {
          setAllObstacles(json.obstacles);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allObstacles;
    return allObstacles.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        CATEGORY_LABELS[o.category]?.toLowerCase().includes(q)
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

  const addFoul = (obstacleId: string) => {
    if (!onFoulsChange) return;
    const current = foulsMap[obstacleId] ?? 0;
    onFoulsChange(obstacleId, current + 1);
  };

  const removeFoul = (obstacleId: string) => {
    if (!onFoulsChange) return;
    const current = foulsMap[obstacleId] ?? 0;
    onFoulsChange(obstacleId, Math.max(0, current - 1));
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
              {showFouls && (
                <span className="ml-1 bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 px-1 rounded-full text-[10px]">
                  {foulsMap[obs.id] ?? 0} faltas
                </span>
              )}
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

      {/* Results */}
      {!loading && (
        <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
          {Object.entries(grouped).map(([category, obstacles]) => (
            <div key={category}>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category] || category}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {obstacles.map((obs) => {
                  const isSelected = selected.some((s) => s.id === obs.id);
                  const fouls = foulsMap[obs.id] ?? 0;
                  return (
                    <div
                      key={obs.id}
                      className={`flex flex-col gap-1 p-2.5 rounded-xl border-2 text-xs transition-all ${
                        isSelected
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-950/40"
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      }`}
                    >
                      <button
                        onClick={() => toggleObstacle(obs)}
                        className="flex items-center gap-2 text-left"
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </div>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px] leading-tight">
                          {obs.name}
                        </span>
                      </button>

                      {showFouls && isSelected && (
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                          <span className="text-[10px] text-zinc-500">Faltas</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFoul(obs.id)}
                              className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 flex items-center justify-center text-xs active:scale-95"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{fouls}</span>
                            <button
                              onClick={() => addFoul(obs.id)}
                              className="w-5 h-5 rounded-full bg-warning-100 dark:bg-warning-900 text-warning-700 flex items-center justify-center text-xs active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-3">
              No encontramos "{search}". ¿Quieres sugerirlo?
            </p>
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
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
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
