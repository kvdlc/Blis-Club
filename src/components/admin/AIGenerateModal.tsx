"use client";

import { useState } from "react";
import { X, Sparkles, Loader2, Wand2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (result: any) => void;
  mode: "recipe" | "lesson";
  lessonType?: string;
  moduleTitle?: string;
}

export default function AIGenerateModal({ isOpen, onClose, onGenerate, mode, lessonType, moduleTitle }: Props) {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setPreview(null);

    try {
      const endpoint = mode === "recipe" ? "/api/ai/generate-recipe" : "/api/ai/generate-lesson";
      const body: any = { prompt };

      if (mode === "recipe") {
        if (category) body.category = category;
        if (difficulty) body.difficulty = difficulty;
      } else {
        if (lessonType) body.type = lessonType;
        if (moduleTitle) body.moduleTitle = moduleTitle;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al generar");
        return;
      }

      setPreview(mode === "recipe" ? data.recipe : data.content_json);
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!preview) return;
    await onGenerate(preview);
    onClose();
    setPrompt("");
    setPreview(null);
  };

  const handleRegenerate = () => {
    setPreview(null);
    handleGenerate();
  };

  if (!isOpen) return null;

  const isRecipe = mode === "recipe";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-950/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-600" />
            </div>
            <h2 className="font-bold text-zinc-900 dark:text-white text-sm">
              {isRecipe ? "Generar receta con AI" : "Generar lección con AI"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Prompt input */}
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
              Describe lo que quieres generar
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isRecipe
                  ? "Ej: Receta de pollo con zanahoria para perro diabético de 10kg, baja en grasa..."
                  : "Ej: Lección sobre cómo enseñar 'sentado' a un cachorro de 3 meses, con teoría y quiz..."
              }
              rows={4}
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm"
            />
          </div>

          {/* Recipe options */}
          {isRecipe && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Categoría (opcional)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm"
                >
                  <option value="">Auto-detectar</option>
                  <option value="diario">Diario</option>
                  <option value="snack">Snack</option>
                  <option value="helado">Helado</option>
                  <option value="pastel">Pastel</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Dificultad (opcional)</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm"
                >
                  <option value="">Auto-detectar</option>
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-accent-600 hover:bg-accent-700 text-white py-3 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generando con Gemini 2.5 Pro...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generar</>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-950/30 text-danger-700 dark:text-danger-300 text-xs">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vista previa generada</p>

              {isRecipe && (
                <div className="card-soft rounded-xl p-3 space-y-2">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{preview.title}</p>
                  <p className="text-xs text-zinc-500 line-clamp-3">{preview.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{preview.category}</span>
                    <span className="text-[10px] bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">{preview.difficulty}</span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{preview.prep_time_min} min</span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    <strong>{preview.ingredients?.length || 0}</strong> ingredientes · <strong>{preview.steps?.length || 0}</strong> pasos
                  </p>
                </div>
              )}

              {!isRecipe && (
                <div className="card-soft rounded-xl p-3 space-y-2">
                  <p className="text-xs text-zinc-600">
                    Contenido generado para tipo: <strong>{lessonType}</strong>
                  </p>
                  <pre className="text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto">
                    {JSON.stringify(preview, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleUse}
                  className="flex-1 rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white py-2.5 text-sm font-bold transition-colors"
                >
                  Usar esta {isRecipe ? "receta" : "lección"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  Regenerar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
