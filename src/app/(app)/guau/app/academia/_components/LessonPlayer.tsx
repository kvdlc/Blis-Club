"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Lesson, UserProgress } from "@/types/database";
import { ArrowRight, Check, Trophy, Timer, Zap } from "lucide-react";

interface LessonPlayerProps {
  lesson: Lesson & { content_json: Record<string, unknown> };
  initialCompleted: boolean;
  lessonId: string;
  userId: string;
  nextLessonId: string | null;
  completedLessonIds: string[];
  moduleId: string;
  moduleLessons: { id: string; order: number }[];
  stageSlug: string;
}

type Phase = "theory" | "check" | "complete" | "badge" | "done";

export function LessonPlayer({
  lesson,
  initialCompleted,
  lessonId,
  userId,
  nextLessonId,
  completedLessonIds,
  moduleId,
  moduleLessons,
  stageSlug,
}: LessonPlayerProps) {
  const router = useRouter();
  const supabase = createClient();
  const content = lesson.content_json as Record<string, unknown>;

  const [phase, setPhase] = useState<Phase>(initialCompleted ? "done" : "theory");
  const [cardIdx, setCardIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Mini-game states
  const [reflexStarted, setReflexStarted] = useState(false);
  const [reflexShowed, setReflexShowed] = useState(false);
  const [reflexScore, setReflexScore] = useState<number | null>(null);
  const reflexTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dictionary game states
  const [dictRound, setDictRound] = useState(0);
  const [dictScore, setDictScore] = useState(0);
  const [dictSelected, setDictSelected] = useState<string | null>(null);

  // Practice timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  const [practiceRating, setPracticeRating] = useState<string | null>(null);

  const cards = (content.cards as Array<{ type: string; content: string }>) ?? [];
  const check = content.check as { question?: string; options?: string[]; correct?: number } | undefined;
  const minigameConfig = content as Record<string, unknown>;
  const celebration = (content.celebration as { message?: string }) ?? {};

  const handleComplete = useCallback(async () => {
    setSaving(true);
    const score = reflexScore ?? (dictRound > 0 ? dictScore : null);

    await supabase.from("user_progress").upsert(
      { user_id: userId, lesson_id: lessonId, completed: true, score, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );

    // Check if all lessons in module are completed
    const allComplete = moduleLessons.every(
      (l) => l.id === lessonId || completedLessonIds.includes(l.id)
    );

    if (allComplete && moduleLessons.every(l => l.id === lessonId || completedLessonIds.includes(l.id))) {
      setShowBadge(true);
    } else {
      setPhase(nextLessonId ? "complete" : "done");
    }
    setSaving(false);
  }, [supabase, userId, lessonId, reflexScore, dictRound, dictScore, moduleLessons, completedLessonIds, nextLessonId]);

  // Practice timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSec((s) => {
          const next = s + 1;
          const maxSec = (Number(minigameConfig.duration_minutes) || 3) * 60;
          if (next >= maxSec) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerRunning(false);
            setTimerDone(true);
            return maxSec;
          }
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, minigameConfig.duration_minutes]);

  // Render theory phase (swipe cards)
  if (phase === "theory" && lesson.type === "theory") {
    return (
      <div className="flex flex-col min-h-[70vh]">
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-sm" onClick={() => cardIdx < cards.length - 1 ? setCardIdx(cardIdx + 1) : setPhase("check")}>
            <div className="bg-primary-50 dark:bg-primary-950 rounded-3xl p-8 min-h-[280px] flex flex-col items-center justify-center">
              <p className="text-lg text-primary-900 dark:text-primary-100 leading-relaxed">
                {cards[cardIdx]?.content ?? ""}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-6">
            {cards.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= cardIdx ? "bg-primary-600" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-4">
            Toca para avanzar · {cardIdx + 1}/{cards.length}
          </p>
        </div>
      </div>
    );
  }

  // Comprehension check
  if (phase === "check" && check) {
    return (
      <div className="flex flex-col min-h-[70vh]">
        <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
          <h3 className="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100">
            {check.question ?? "¿Qué aprendiste?"}
          </h3>
          <div className="w-full max-w-sm space-y-3">
            {(check.options ?? []).map((opt: string, i: number) => {
              let classes = "w-full rounded-xl border px-4 py-3 text-sm text-left font-medium transition-colors ";
              if (selectedAnswer === null) {
                classes += "border-zinc-200 dark:border-zinc-700 hover:border-primary-400 dark:hover:border-primary-600";
              } else if (i === check.correct) {
                classes += "border-secondary-500 bg-secondary-50 dark:bg-secondary-950 text-secondary-700 dark:text-secondary-300";
              } else if (i === selectedAnswer) {
                classes += "border-danger-500 bg-danger-50 dark:bg-danger-950 text-danger-700 dark:text-danger-300";
              } else {
                classes += "border-zinc-200 dark:border-zinc-700 opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (selectedAnswer !== null) return;
                    setSelectedAnswer(i);
                    setIsCorrect(i === check.correct);
                  }}
                  className={classes}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {isCorrect !== null && (
            <div className={`rounded-2xl p-4 text-center ${isCorrect ? "bg-secondary-50 dark:bg-secondary-950 text-secondary-700" : "bg-danger-50 dark:bg-danger-950 text-danger-700"}`}>
              <p className="font-semibold">{isCorrect ? "¡Correcto!" : "¡Sigue intentando!"}</p>
              {!isCorrect && <p className="text-sm mt-1">Revisa la teoría e inténtalo de nuevo.</p>}
            </div>
          )}
          {isCorrect && (
            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full max-w-sm rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Completar y Guardar"}
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Reflex mini-game
  if (lesson.type === "minigame_reflejos") {
    if (phase === "complete" || phase === "done") {
      return <CompletionScreen nextLessonId={nextLessonId} router={router} celebration={celebration} stageSlug={stageSlug} />;
    }

    const handleReflexStart = () => {
      setReflexStarted(true);
      reflexTimeout.current = setTimeout(() => {
        setReflexShowed(true);
      }, Math.random() * 3000 + 1000);
    };

    const handleReflexTap = () => {
      if (reflexShowed) {
        const time = performance.now();
        setReflexScore(Math.round(time % 1000));
        setReflexShowed(false);
        if (reflexTimeout.current) clearTimeout(reflexTimeout.current);
      }
    };

    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center">
        {!reflexStarted ? (
          <button
            onClick={handleReflexStart}
            className="w-40 h-40 rounded-full bg-primary-600 text-white text-lg font-bold flex items-center justify-center shadow-xl shadow-primary-600/30 active:scale-95 transition-transform"
          >
            <Zap className="w-10 h-10" />
          </button>
        ) : reflexShowed ? (
          <button
            onClick={handleReflexTap}
            className="w-40 h-40 rounded-full bg-secondary-500 text-white text-lg font-bold flex items-center justify-center animate-pulse"
          >
            ¡TOCA!
          </button>
        ) : reflexScore !== null ? (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-secondary-600">¡{reflexScore}ms!</p>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold transition-colors"
            >
              Completar y Guardar
            </button>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Espera la señal...</p>
        )}
      </div>
    );
  }

  // Dictionary mini-game
  if (lesson.type === "minigame_diccionario") {
    const prompts = (content.prompts as Array<{ situation: string; correct_word: string }>) ?? [];
    const totalRounds = Math.min(Number(content.rounds) || 5, prompts.length);

    if (dictRound >= totalRounds) {
      return (
        <div className="flex flex-col min-h-[70vh] items-center justify-center text-center space-y-4">
          <p className="text-lg font-semibold text-secondary-600">¡Puntaje: {dictScore}/{totalRounds}!</p>
          <button
            onClick={handleComplete}
            disabled={saving}
            className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold transition-colors"
          >
            Completar y Guardar
          </button>
        </div>
      );
    }

    const currentPrompt = prompts[dictRound];
    const words = (content.words as string[]) ?? [];

    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center px-4 space-y-6">
        <p className="text-lg font-semibold text-center text-zinc-900 dark:text-zinc-100">
          {currentPrompt?.situation ?? "Elige el comando correcto"}
        </p>
        <div className="w-full max-w-sm space-y-2">
          {words.map((word: string) => (
            <button
              key={word}
              onClick={() => {
                if (dictSelected) return;
                setDictSelected(word);
                if (word === currentPrompt?.correct_word) {
                  setDictScore((s) => s + 1);
                }
                setTimeout(() => {
                  setDictRound((r) => r + 1);
                  setDictSelected(null);
                }, 800);
              }}
              className={`w-full rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors ${
                dictSelected === null
                  ? "border-zinc-200 dark:border-zinc-700 hover:border-primary-400"
                  : dictSelected === word
                    ? word === currentPrompt?.correct_word
                      ? "border-secondary-500 bg-secondary-50"
                      : "border-danger-500 bg-danger-50"
                    : "border-zinc-200 opacity-50"
              }`}
            >
              {word}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-400">
          Ronda {dictRound + 1} de {totalRounds}
        </p>
      </div>
    );
  }

  // Practice timer
  if (lesson.type === "practice_timer") {
    const maxSec = (Number(minigameConfig.duration_minutes) || 3) * 60;
    const minutes = Math.floor(timerSec / 60);
    const seconds = timerSec % 60;

    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center space-y-6">
        {!timerRunning && !timerDone ? (
          <>
            <Timer className="w-16 h-16 text-primary-600 dark:text-primary-400" />
            <p className="text-lg font-semibold text-center">
              {minigameConfig.exercise_name as string ?? "Práctica"}
            </p>
            <p className="text-sm text-zinc-500 text-center max-w-xs">
              {minigameConfig.instructions as string ?? "Practica el movimiento frente a tu perro."}
            </p>
            <button
              onClick={() => setTimerRunning(true)}
              className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold"
            >
              Iniciar ({minigameConfig.duration_minutes as number ?? 3} min)
            </button>
          </>
        ) : timerDone ? (
          <div className="text-center space-y-6">
            <h3 className="text-lg font-semibold">¿Cómo le fue a tu perro?</h3>
            <div className="flex gap-3 justify-center">
              {[
                { color: "bg-secondary-500", label: "Verde", value: "green" },
                { color: "bg-warning-500", label: "Amarillo", value: "yellow" },
                { color: "bg-danger-500", label: "Rojo", value: "red" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPracticeRating(opt.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    practiceRating === opt.value
                      ? "border-primary-500 scale-105"
                      : "border-transparent"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${opt.color}`} />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            {practiceRating && (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold"
              >
                Completar y Guardar
              </button>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="text-sm text-zinc-500">Practicando: {minigameConfig.exercise_name as string}</p>
          </div>
        )}
      </div>
    );
  }

  // Completion screen
  if (phase === "complete") {
    return <CompletionScreen nextLessonId={nextLessonId} router={router} celebration={celebration} stageSlug={stageSlug} />;
  }

  // Already done
  if (phase === "done") {
    return (
      <div className="flex flex-col min-h-[70vh] items-center justify-center text-center space-y-4">
        <Check className="w-16 h-16 text-secondary-500" />
        <p className="text-lg font-semibold text-secondary-600">¡Lección completada!</p>
        {nextLessonId && (
          <button
            onClick={() => router.push(`/guau/app/academia/${stageSlug}/lesson/${nextLessonId}`)}
            className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-semibold"
          >
            Siguiente lección
          </button>
        )}
      </div>
    );
  }

  return null;
}

function CompletionScreen({
  nextLessonId,
  router,
  celebration,
  stageSlug,
}: {
  nextLessonId: string | null;
  router: ReturnType<typeof useRouter>;
  celebration: { message?: string };
  stageSlug: string;
}) {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center text-center space-y-4 px-4">
      <Trophy className="w-16 h-16 text-accent-500" />
      <h3 className="text-xl font-bold text-accent-700 dark:text-accent-400">
        {celebration.message ?? "¡Completado!"}
      </h3>
      <p className="text-zinc-500">
        {nextLessonId ? "La siguiente lección está lista." : "¡Módulo completado!"}
      </p>
      <div className="flex gap-3">
        {nextLessonId && (
          <button
            onClick={() => router.push(`/guau/app/academia/${stageSlug}/lesson/${nextLessonId}`)}
            className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 font-semibold"
          >
            Siguiente <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        )}
        <button
          onClick={() => router.push(`/guau/app/academia/${stageSlug}`)}
          className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 font-semibold"
        >
          Volver al mapa
        </button>
      </div>
    </div>
  );
}
