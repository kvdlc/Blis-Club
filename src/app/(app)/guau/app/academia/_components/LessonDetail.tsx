"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Lesson, UserProgress, Stage, Module } from "@/types/database";
import { LessonPlayer } from "./LessonPlayer";
import { titleToSlug } from "@/lib/slug";
import {
  ArrowLeft, BookOpen, Zap, Timer, Award, Lock, CheckCircle,
  Play, Star, Clock, BarChart3, GraduationCap, ChevronRight, User, Trophy
} from "lucide-react";

interface Props {
  lesson: Lesson & { modules: { id: string; title: string; order: number; stage_id: string; stages: Stage } };
  stage: Stage;
  module: { id: string; title: string; order: number; stage_id: string };
  allModules: Module[];
  allStageLessons: (Lesson & { module_id: string })[];
  stageProgress: UserProgress[];
  currentProgress: UserProgress | null;
  nextLessonId: string | null;
  userId: string;
  completedLessonIds: string[];
  moduleLessons: { id: string; order: number }[];
  autoStart: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; duration: number }> = {
  theory: { label: "Teoría", icon: BookOpen, duration: 2 },
  minigame_reflejos: { label: "Reflejos", icon: Zap, duration: 3 },
  minigame_diccionario: { label: "Diccionario", icon: BookOpen, duration: 3 },
  practice_timer: { label: "Práctica", icon: Timer, duration: 5 },
};

export function LessonDetail({
  lesson,
  stage,
  module,
  allModules,
  allStageLessons,
  stageProgress,
  currentProgress,
  nextLessonId,
  userId,
  completedLessonIds,
  moduleLessons,
  autoStart,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "progress">("info");

  const typeConfig = TYPE_CONFIG[lesson.type] ?? TYPE_CONFIG.theory;
  const TypeIcon = typeConfig.icon;
  const isCompleted = currentProgress?.completed ?? false;
  const stageSlug = titleToSlug(stage.title);

  // Auto-start only if not completed
  const [playing, setPlaying] = useState(autoStart && !isCompleted);
  const [resetMode, setResetMode] = useState(false);

  const handlePlay = () => {
    if (isCompleted) setResetMode(true);
    setPlaying(true);
  };

  const handlePracticeAgility = () => {
    router.push(`/guau/app/tracker/agilidad?lessonId=${lesson.id}`);
  };

  // Determine button label
  const buttonLabel = isCompleted ? "Repetir lección" : "Comenzar lección";

  // Is this an agility-related lesson?
  const isAgilityLesson = stageSlug === "agilidad" || lesson.type === "practice_timer";

  // Materials from content_json or fallback
  const content = lesson.content_json as Record<string, unknown>;
  const materials = (content.materials as Array<{ title: string; description: string; icon?: string }> | undefined) ?? getDefaultMaterials(lesson.type);

  // Progress calculations
  const totalStageLessons = allStageLessons.length;
  const completedCount = stageProgress.filter((p) => p.completed).length;
  const stageProgressPct = Math.round((completedCount / Math.max(totalStageLessons, 1)) * 100);

  // Module progress map
  const moduleProgress = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    allModules.forEach((mod) => {
      const modLessons = allStageLessons.filter((l) => l.module_id === mod.id);
      const done = modLessons.filter((l) =>
        stageProgress.some((p) => p.lesson_id === l.id && p.completed)
      ).length;
      map[mod.id] = { total: modLessons.length, completed: done };
    });
    return map;
  }, [allModules, allStageLessons, stageProgress]);

  // Is module unlocked logic (same as academia page)
  const isModuleUnlocked = (mod: Module, modIdx: number) => {
    if (modIdx === 0) return true;
    const prevMod = allModules[modIdx - 1];
    const prevLessons = allStageLessons.filter((l) => l.module_id === prevMod.id);
    return prevLessons.every((l) =>
      stageProgress.some((p) => p.lesson_id === l.id && p.completed)
    );
  };

  const isLessonUnlocked = (lessonId: string, modId: string, modIdx: number) => {
    if (!isModuleUnlocked(allModules[modIdx], modIdx)) return false;
    const modLessons = allStageLessons.filter((l) => l.module_id === modId).sort((a, b) => a.order - b.order);
    const idx = modLessons.findIndex((l) => l.id === lessonId);
    if (idx === 0) return true;
    return modLessons.slice(0, idx).every((l) =>
      stageProgress.some((p) => p.lesson_id === l.id && p.completed)
    );
  };

  if (playing) {
    return (
      <LessonPlayer
        lesson={lesson}
        initialCompleted={isCompleted && !resetMode}
        lessonId={lesson.id}
        userId={userId}
        nextLessonId={nextLessonId}
        completedLessonIds={completedLessonIds}
        moduleId={module.id}
        moduleLessons={moduleLessons}
        stageSlug={stageSlug}
      />
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/guau/app/academia")}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-600 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900">Detalles</h1>
      </div>

      {/* Hero Card */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${stage.color_hex}, ${adjustColor(stage.color_hex, -30)})` }}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
            <TypeIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{stage.title}</p>
            <h2 className="text-xl font-bold leading-tight mt-0.5">{lesson.title}</h2>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Title + Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900">{lesson.title}</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-zinc-500">
            Módulo {module.order} · Est. {typeConfig.duration} min · {typeConfig.label}
          </p>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 text-secondary-700 px-2.5 py-0.5 text-[10px] font-bold">
              <CheckCircle className="w-3 h-3" />
              Completada
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "progress", label: "Progreso" },
          { key: "info", label: "Información" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${ activeTab === tab.key ? "bg-primary-600 text-white shadow-md shadow-primary-600/20" : "bg-zinc-100 text-zinc-600" }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-5">
          {/* Instructor Card */}
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
              <span className="text-primary-700 font-bold text-lg">B</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-zinc-900">Equipo Blis Club</h3>
              <p className="text-xs text-zinc-500">Instructor certificado</p>
            </div>
            <button className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full transition-colors">
              Ver perfil
            </button>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 px-3 py-1.5 text-[11px] font-bold border border-primary-100">
              <BookOpen className="w-3.5 h-3.5" />
              {typeConfig.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 text-secondary-700 px-3 py-1.5 text-[11px] font-bold border border-secondary-100">
              <BarChart3 className="w-3.5 h-3.5" />
              Dificultad básica
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 px-3 py-1.5 text-[11px] font-bold border border-warning-100">
              <Clock className="w-3.5 h-3.5" />
              ~{typeConfig.duration} min
            </span>
          </div>

          {/* Material Section */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-3">Material</h3>
            <div className="space-y-2.5">
              {materials.map((item, idx) => {
                const MatIcon = getMaterialIcon(item.icon, idx);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-3.5 transition-all active:scale-[0.98]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <MatIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate">{item.title}</h4>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === "progress" && (
        <div className="space-y-5">
          {/* Stage Progress Card */}
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-700">Progreso del stage</span>
              <span className="text-xs font-bold text-primary-600">{stageProgressPct}%</span>
            </div>
            <div className="bg-zinc-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${stageProgressPct}%`, backgroundColor: stage.color_hex }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              {completedCount} de {totalStageLessons} lecciones completadas
            </p>
          </div>

          {/* Modules List */}
          <div className="space-y-6">
            {allModules.map((mod, modIdx) => {
              const unlocked = isModuleUnlocked(mod, modIdx);
              const progress = moduleProgress[mod.id] ?? { total: 0, completed: 0 };
              const modLessons = allStageLessons
                .filter((l) => l.module_id === mod.id)
                .sort((a, b) => a.order - b.order);

              return (
                <div key={mod.id}>
                  {/* Module header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: unlocked ? stage.color_hex : "#a1a1aa" }}
                    >
                      {unlocked ? mod.order : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${unlocked ? "text-zinc-900" : "text-zinc-400"}`}>
                        {mod.title}
                      </h3>
                      {unlocked && (
                        <p className="text-[10px] text-zinc-500">
                          {progress.completed}/{progress.total} completadas
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2 pl-6">
                    {modLessons.map((les) => {
                      const lesUnlocked = isLessonUnlocked(les.id, mod.id, modIdx);
                      const isLesCompleted = stageProgress.some(
                        (p) => p.lesson_id === les.id && p.completed
                      );
                      const isCurrent = les.id === lesson.id;

                      return (
                        <Link
                          key={les.id}
                          href={lesUnlocked ? `/guau/app/academia/${stageSlug}/lesson/${les.id}` : "#"}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-all ${ isCurrent ? "bg-primary-50 border border-primary-200" : lesUnlocked ? "bg-white border border-zinc-100 hover:bg-zinc-50" : "bg-zinc-50 opacity-50 border border-zinc-100" }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ isLesCompleted ? "bg-secondary-100 text-secondary-600" : lesUnlocked ? "bg-primary-100 text-primary-600" : "bg-zinc-100 text-zinc-400" }`}>
                            {isLesCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : lesUnlocked ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold truncate ${isCurrent ? "text-primary-700" : lesUnlocked ? "text-zinc-900" : "text-zinc-400"}`}>
                              {les.title}
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-primary-600 bg-white px-2 py-0.5 rounded-full border border-primary-100">
                              Actual
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-24 left-4 right-4 z-50 md:hidden space-y-2">
        <button
          onClick={handlePlay}
          className={`w-full rounded-[1.25rem] text-white py-4 font-bold text-sm shadow-xl transition-transform active:scale-[0.97] flex items-center justify-center gap-2 ${ isCompleted ? "bg-warning-500 hover:bg-warning-600 shadow-warning-500/30" : "bg-secondary-600 hover:bg-secondary-700 shadow-secondary-600/30" }`}
        >
          <Play className="w-5 h-5 fill-current" />
          {buttonLabel}
        </button>
        {isAgilityLesson && (
          <button
            onClick={handlePracticeAgility}
            className="w-full rounded-[1.25rem] bg-accent-600 hover:bg-accent-700 text-white py-3 font-bold text-sm shadow-xl transition-transform active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Practicar ahora
          </button>
        )}
      </div>

      {/* Desktop button (non-sticky) */}
      <div className="hidden md:block space-y-2">
        <button
          onClick={handlePlay}
          className={`w-full rounded-[1.25rem] text-white py-4 font-bold text-sm shadow-lg transition-transform active:scale-[0.97] flex items-center justify-center gap-2 ${ isCompleted ? "bg-warning-500 hover:bg-warning-600 shadow-warning-500/25" : "bg-secondary-600 hover:bg-secondary-700 shadow-secondary-600/25" }`}
        >
          <Play className="w-5 h-5 fill-current" />
          {buttonLabel}
        </button>
        {isAgilityLesson && (
          <button
            onClick={handlePracticeAgility}
            className="w-full rounded-[1.25rem] bg-accent-600 hover:bg-accent-700 text-white py-3 font-bold text-sm shadow-lg transition-transform active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Practicar ahora
          </button>
        )}
      </div>
    </div>
  );
}

// Helpers
function getDefaultMaterials(type: string): Array<{ title: string; description: string; icon?: string }> {
  switch (type) {
    case "theory":
      return [
        { title: "Instrucciones de la lección", description: "Repasa los conceptos y la teoría", icon: "book" },
        { title: "Tarea", description: "Aplica lo aprendido con tu perro", icon: "practice" },
        { title: "Resultado del examen", description: "Verifica tu comprensión con preguntas", icon: "quiz" },
      ];
    case "minigame_reflejos":
    case "minigame_diccionario":
      return [
        { title: "Instrucciones de la lección", description: "Cómo funciona el minijuego y cómo puntuar", icon: "book" },
        { title: "Tarea", description: "Practica con tu perro en tiempo real", icon: "game" },
        { title: "Resultado del examen", description: "Revisa tu puntuación y progreso", icon: "chart" },
      ];
    case "practice_timer":
      return [
        { title: "Instrucciones de la lección", description: "Pasos a seguir durante la práctica", icon: "book" },
        { title: "Tarea", description: "Activa el temporizador y entrena a tu perro", icon: "timer" },
        { title: "Resultado del examen", description: "Registra cómo le fue a tu perro", icon: "chart" },
      ];
    default:
      return [
        { title: "Instrucciones de la lección", description: "Contenido principal de la lección", icon: "book" },
      ];
  }
}

function getMaterialIcon(iconName: string | undefined, idx: number): React.ElementType {
  const map: Record<string, React.ElementType> = {
    book: BookOpen,
    practice: Zap,
    quiz: Award,
    game: Zap,
    chart: BarChart3,
    timer: Timer,
  };
  return map[iconName ?? ""] ?? [BookOpen, Zap, Award][idx % 3];
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
