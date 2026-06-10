"use client";

import { useState, useEffect } from "react";
import { X, Plus, GripVertical, Trash2, Clock, BookOpen, Dices, Timer, BrainCircuit, FileJson } from "lucide-react";

interface Props {
  type: string;
  value: any;
  onChange: (value: any) => void;
  videoUrl?: string | null;
  onVideoUrlChange?: (url: string) => void;
}

/* ─── Theory Editor ─── */
function TheoryEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const cards = value?.cards || [{ title: "", body: "", image: "" }];
  const check = value?.check || { question: "", options: ["", "", "", ""], correct: 0 };

  const updateCard = (index: number, field: string, val: string) => {
    const next = [...cards];
    next[index] = { ...next[index], [field]: val };
    onChange({ ...value, cards: next });
  };

  const addCard = () => {
    onChange({ ...value, cards: [...cards, { title: "", body: "", image: "" }] });
  };

  const removeCard = (index: number) => {
    const next = cards.filter((_: any, i: number) => i !== index);
    onChange({ ...value, cards: next });
  };

  const moveCard = (index: number, direction: number) => {
    const next = [...cards];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= next.length) return;
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange({ ...value, cards: next });
  };

  const updateCheck = (field: string, val: any) => {
    onChange({ ...value, check: { ...check, [field]: val } });
  };

  const updateOption = (index: number, val: string) => {
    const next = [...check.options];
    next[index] = val;
    onChange({ ...value, check: { ...check, options: next } });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cards de teoría</p>
      {cards.map((card: any, i: number) => (
        <div key={i} className="card-soft rounded-xl p-3 space-y-2 border border-zinc-200">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-500">Card {i + 1}</span>
            <div className="flex-1" />
            <button onClick={() => moveCard(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"><Plus className="w-3 h-3 rotate-90" /></button>
            <button onClick={() => moveCard(i, 1)} disabled={i === cards.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30"><Plus className="w-3 h-3 -rotate-90" /></button>
            <button onClick={() => removeCard(i)} className="text-danger-400 hover:text-danger-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <input
            type="text"
            placeholder="Título de la card"
            value={card.title || ""}
            onChange={(e) => updateCard(i, "title", e.target.value)}
            className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Contenido de la card..."
            value={card.body || ""}
            onChange={(e) => updateCard(i, "body", e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            value={card.image || ""}
            onChange={(e) => updateCard(i, "image", e.target.value)}
            className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button onClick={addCard} className="w-full py-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 text-sm font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Agregar card
      </button>

      {/* Comprehension check */}
      <div className="pt-4 border-t border-zinc-200">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Verificación de comprensión</p>
        <input
          type="text"
          placeholder="Pregunta de comprensión"
          value={check.question || ""}
          onChange={(e) => updateCheck("question", e.target.value)}
          className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm mb-2"
        />
        <div className="grid grid-cols-2 gap-2">
          {check.options.map((opt: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-answer"
                checked={check.correct === i}
                onChange={() => updateCheck("correct", i)}
                className="accent-primary-600"
              />
              <input
                type="text"
                placeholder={`Opción ${i + 1}`}
                value={opt || ""}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Quiz Editor ─── */
function QuizEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const questions = value?.questions || [{ question: "", options: ["", "", "", ""], correct_index: 0 }];

  const updateQuestion = (index: number, field: string, val: any) => {
    const next = [...questions];
    next[index] = { ...next[index], [field]: val };
    onChange({ ...value, questions: next });
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const next = [...questions];
    const opts = [...next[qIdx].options];
    opts[oIdx] = val;
    next[qIdx] = { ...next[qIdx], options: opts };
    onChange({ ...value, questions: next });
  };

  const addQuestion = () => {
    onChange({ ...value, questions: [...questions, { question: "", options: ["", "", "", ""], correct_index: 0 }] });
  };

  const removeQuestion = (index: number) => {
    const next = questions.filter((_: any, i: number) => i !== index);
    onChange({ ...value, questions: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Preguntas</p>
      {questions.map((q: any, i: number) => (
        <div key={i} className="card-soft rounded-xl p-3 space-y-2 border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500">Pregunta {i + 1}</span>
            <button onClick={() => removeQuestion(i)} className="text-danger-400 hover:text-danger-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <input
            type="text"
            placeholder="Escribe la pregunta..."
            value={q.question || ""}
            onChange={(e) => updateQuestion(i, "question", e.target.value)}
            className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt: string, oi: number) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`q-${i}-correct`}
                  checked={q.correct_index === oi}
                  onChange={() => updateQuestion(i, "correct_index", oi)}
                  className="accent-primary-600"
                />
                <input
                  type="text"
                  placeholder={`Opción ${oi + 1}`}
                  value={opt || ""}
                  onChange={(e) => updateOption(i, oi, e.target.value)}
                  className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addQuestion} className="w-full py-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 text-sm font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Agregar pregunta
      </button>
    </div>
  );
}

/* ─── Practice Timer Editor ─── */
function PracticeTimerEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Duración (segundos)</label>
        <input
          type="number"
          min={10}
          max={600}
          value={value?.duration_seconds || 60}
          onChange={(e) => onChange({ ...value, duration_seconds: parseInt(e.target.value) || 60 })}
          className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Nombre del ejercicio</label>
        <input
          type="text"
          placeholder="Ej: Sentado con temporizador"
          value={value?.exercise_name || ""}
          onChange={(e) => onChange({ ...value, exercise_name: e.target.value })}
          className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Instrucciones</label>
        <textarea
          placeholder="Instrucciones paso a paso..."
          value={value?.instructions || ""}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
          rows={4}
          className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}

/* ─── Reflex Game Editor ─── */
function ReflexGameEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const timings = value?.timings || [{ label: "Rápido", seconds: 10 }];

  const updateTiming = (index: number, field: string, val: any) => {
    const next = [...timings];
    next[index] = { ...next[index], [field]: field === "seconds" ? parseInt(val) || 0 : val };
    onChange({ ...value, timings: next });
  };

  const addTiming = () => {
    onChange({ ...value, timings: [...timings, { label: "Nivel", seconds: 15 }] });
  };

  const removeTiming = (index: number) => {
    const next = timings.filter((_: any, i: number) => i !== index);
    onChange({ ...value, timings: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Niveles de tiempo</p>
      {timings.map((t: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del nivel"
            value={t.label || ""}
            onChange={(e) => updateTiming(i, "label", e.target.value)}
            className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            placeholder="Segundos"
            value={t.seconds || ""}
            onChange={(e) => updateTiming(i, "seconds", e.target.value)}
            className="w-24 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <button onClick={() => removeTiming(i)} className="text-danger-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={addTiming} className="w-full py-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 text-sm font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Agregar nivel
      </button>
    </div>
  );
}

/* ─── Dictionary Game Editor ─── */
function DictionaryGameEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const pairs = value?.pairs || [{ word: "", definition: "" }];

  const updatePair = (index: number, field: string, val: string) => {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: val };
    onChange({ ...value, pairs: next });
  };

  const addPair = () => {
    onChange({ ...value, pairs: [...pairs, { word: "", definition: "" }] });
  };

  const removePair = (index: number) => {
    const next = pairs.filter((_: any, i: number) => i !== index);
    onChange({ ...value, pairs: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pares palabra-definición</p>
      {pairs.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Palabra / Término"
            value={p.word || ""}
            onChange={(e) => updatePair(i, "word", e.target.value)}
            className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Definición"
            value={p.definition || ""}
            onChange={(e) => updatePair(i, "definition", e.target.value)}
            className="flex-1 rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <button onClick={() => removePair(i)} className="text-danger-400 hover:text-danger-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={addPair} className="w-full py-2 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-500 text-sm font-bold hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Agregar par
      </button>
    </div>
  );
}

/* ─── Raw JSON Editor (fallback / power user) ─── */
function RawJsonEditor({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      setError("");
      onChange(parsed);
    } catch (e) {
      setError("JSON inválido: " + (e as Error).message);
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        rows={12}
        className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs font-mono"
      />
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </div>
  );
}

/* ─── Main LessonContentEditor ─── */
export default function LessonContentEditor({ type, value, onChange, videoUrl, onVideoUrlChange }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  // Ensure we always have a valid object
  const safeValue = value || {};

  const typeLabel: Record<string, { icon: any; label: string; color: string }> = {
    theory: { icon: BookOpen, label: "Teoría", color: "text-primary-600" },
    quiz: { icon: BrainCircuit, label: "Quiz", color: "text-accent-600" },
    practice_timer: { icon: Timer, label: "Práctica con temporizador", color: "text-secondary-600" },
    minigame_reflejos: { icon: Dices, label: "Minijuego de reflejos", color: "text-warning-600" },
    minigame_diccionario: { icon: BookOpen, label: "Diccionario", color: "text-info-600" },
  };

  const meta = typeLabel[type] || typeLabel.theory;
  const Icon = meta.icon;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${meta.color}`} />
          <span className="text-sm font-bold text-zinc-800">{meta.label}</span>
        </div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 flex items-center gap-1"
        >
          <FileJson className="w-3.5 h-3.5" />
          {showRaw ? "Editor visual" : "JSON avanzado"}
        </button>
      </div>

      {/* Video URL */}
      {onVideoUrlChange && (
        <div>
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">Video explicativo (URL)</label>
          <input
            type="text"
            placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            value={videoUrl || ""}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            className="w-full rounded-lg bg-zinc-50 border border-zinc-200 px-3 py-2 text-sm"
          />
          <p className="text-[10px] text-zinc-400 mt-1">Soporta YouTube, Vimeo, y archivos MP4 directos.</p>
        </div>
      )}

      {/* Content editor */}
      {showRaw ? (
        <RawJsonEditor value={safeValue} onChange={onChange} />
      ) : (
        <div className="animate-fade-in">
          {type === "theory" && <TheoryEditor value={safeValue} onChange={onChange} />}
          {type === "quiz" && <QuizEditor value={safeValue} onChange={onChange} />}
          {type === "practice_timer" && <PracticeTimerEditor value={safeValue} onChange={onChange} />}
          {type === "minigame_reflejos" && <ReflexGameEditor value={safeValue} onChange={onChange} />}
          {type === "minigame_diccionario" && <DictionaryGameEditor value={safeValue} onChange={onChange} />}
          {!typeLabel[type] && <RawJsonEditor value={safeValue} onChange={onChange} />}
        </div>
      )}
    </div>
  );
}
