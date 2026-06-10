"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Stage, Module, Lesson, UserProgress } from "@/types/database";
import { titleToSlug } from "@/lib/slug";
import {
  ArrowLeft, CheckCircle, Play, BookOpen, Zap, Timer,
  Clock, Award, Target, Shield, Heart, Brain, Star,
} from "lucide-react";

const MOD_TYPE_ICONS: Record<string, React.ElementType> = {
  target: Target, shield: Shield, heart: Heart, brain: Brain,
  zap: Zap, star: Star, theory: BookOpen,
  minigame_reflejos: Zap, minigame_diccionario: BookOpen,
  practice_timer: Timer, default: BookOpen,
};

interface Props {
  stage: Stage;
  modules: Module[];
  allStageLessons: (Lesson & { module_id: string })[];
  stageProgress: UserProgress[];
  stages: Stage[];
}

export default function StageClient({ stage, modules, allStageLessons, stageProgress }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "progress">("progress");

  const completedIds = new Set(stageProgress.filter((p) => p.completed).map((p) => p.lesson_id));
  const totalLessons = allStageLessons.length;
  const completedCount = completedIds.size;
  const stagePct = Math.round((completedCount / Math.max(totalLessons, 1)) * 100);

  const nextLesson = useMemo(() => {
    for (const mod of modules) {
      const modLessons = allStageLessons.filter((l) => l.module_id === mod.id).sort((a, b) => a.order - b.order);
      for (const les of modLessons) {
        if (!completedIds.has(les.id)) return { lessonId: les.id, title: les.title };
      }
    }
    return null;
  }, [modules, allStageLessons, completedIds]);

  const estimatedMin = totalLessons * 3;
  const stageSlug = titleToSlug(stage.title);
  const HeroIcon = getHeroIcon(modules[0]?.icon_name ?? "default");

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/guau/app/academia")}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-600 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900">Detalles de la ruta</h1>
        </div>
      </div>

      {/* Hero Card */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${stage.color_hex}, ${adjustColor(stage.color_hex, -30)})` }}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
            <HeroIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">{stage.title}</h2>
            <p className="text-sm text-white/80 mt-1 max-w-xs">{stage.description}</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">{modules.length} temas</span>
            <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">{totalLessons} lecciones</span>
            <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">~{estimatedMin} min</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Stats & Continue */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-4 text-center">
          <p className="text-[10px] text-zinc-500">Progreso</p>
          <p className="text-2xl font-bold text-zinc-800">{stagePct}%</p>
        </div>
        <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-4 text-center">
          <p className="text-2xl font-bold text-zinc-800">{completedCount}/{totalLessons}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Lecciones</p>
        </div>
        {nextLesson ? (
          <button
            onClick={() => router.push(`/guau/app/academia/${stageSlug}/lesson/${nextLesson.lessonId}?start=1`)}
            className="rounded-[1.25rem] text-white p-4 text-center transition-all active:scale-95 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${stage.color_hex}, ${adjustColor(stage.color_hex, -20)})` }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Play className="w-5 h-5 fill-current" />
              <span className="text-sm font-bold">Continuar</span>
            </div>
            <p className="text-[10px] text-white/80 mt-1 truncate">{nextLesson.title}</p>
          </button>
        ) : completedCount >= totalLessons && totalLessons > 0 ? (
          <div className="bg-secondary-50 rounded-[1.25rem] border border-secondary-200 p-4 text-center">
            <Award className="w-5 h-5 text-secondary-600 mx-auto" />
            <p className="text-[10px] text-secondary-700 mt-1">¡Completado!</p>
          </div>
        ) : (
          <button
            onClick={() => {
              const firstMod = modules[0];
              const firstLes = allStageLessons.find((l) => l.module_id === firstMod?.id);
              if (firstLes) router.push(`/guau/app/academia/${stageSlug}/lesson/${firstLes.id}?start=1`);
            }}
            className="rounded-[1.25rem] text-white p-4 text-center transition-all active:scale-95 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${stage.color_hex}, ${adjustColor(stage.color_hex, -20)})` }}
          >
            <Play className="w-5 h-5 fill-current mx-auto" />
            <p className="text-[10px] text-white/80 mt-1">Empezar</p>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "info", label: "Información" },
          { key: "progress", label: "Progreso" },
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
        <div className="space-y-4">
          <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-5">
            <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              Acerca de esta ruta
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {stage.description ?? "Aprende paso a paso con lecciones prácticas y minijuegos."}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 text-primary-700 px-3 py-1.5 text-[11px] font-bold border border-primary-100">
                <BookOpen className="w-3.5 h-3.5" />{totalLessons} lecciones
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-50 text-secondary-700 px-3 py-1.5 text-[11px] font-bold border border-secondary-100">
                <Clock className="w-3.5 h-3.5" />~{estimatedMin} min total
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 px-3 py-1.5 text-[11px] font-bold border border-warning-100">
                <Award className="w-3.5 h-3.5" />{modules.length} temas
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-5">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-warning-500" />
              Lo que aprenderás
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {modules.map((mod, i) => (
                <div key={mod.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: stage.color_hex }}>
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 line-clamp-2">{mod.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[1.25rem] shadow-sm border border-zinc-100 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
              <span className="text-primary-700 font-bold text-lg">B</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-zinc-900">Equipo Blis Club</h3>
              <p className="text-xs text-zinc-500">Instructor certificado · {modules.length} cursos publicados</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab - Clean structured layout */}
      {activeTab === "progress" && (
        <div className="space-y-5">
          {modules.map((mod, modIdx) => {
            const modLessons = allStageLessons
              .filter((l) => l.module_id === mod.id)
              .sort((a, b) => a.order - b.order);
            const modCompleted = modLessons.filter((l) => completedIds.has(l.id)).length;
            const pct = Math.round((modCompleted / Math.max(modLessons.length, 1)) * 100);
            const allDone = modCompleted === modLessons.length && modLessons.length > 0;
            const IconComp = MOD_TYPE_ICONS[mod.icon_name ?? "default"] ?? MOD_TYPE_ICONS.default;
            const firstLessonId = modLessons[0]?.id;

            return (
              <div key={mod.id} className="bg-white rounded-[1.5rem] shadow-sm border border-zinc-100 overflow-hidden">
                {/* Module header */}
                <Link
                  href={firstLessonId ? `/guau/app/academia/${stageSlug}/lesson/${firstLessonId}?start=1` : "#"}
                  className="block p-4 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                      style={{ backgroundColor: allDone ? "#209f89" : stage.color_hex }}
                    >
                      {allDone ? <CheckCircle className="w-5 h-5" /> : modIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 truncate">
                        Tema {modIdx + 1}: {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{mod.description}</p>
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 bg-zinc-100 rounded-full px-2.5 py-0.5 font-medium">{modLessons.length} lecciones</span>
                    {modCompleted > 0 && (
                      <span className="text-[10px] font-bold rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: allDone ? "#d1fae5" : "#ede9fe", color: allDone ? "#065f46" : stage.color_hex }}
                      >
                        {modCompleted}/{modLessons.length} completadas
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-400 ml-auto">{pct}%</span>
                  </div>
                  <div className="mt-2.5 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${allDone ? "bg-secondary-500" : ""}`}
                      style={{ width: `${pct}%`, backgroundColor: allDone ? undefined : stage.color_hex }}
                    />
                  </div>
                </Link>

                {/* Lessons list */}
                {modLessons.length > 0 && (
                  <div className="border-t border-zinc-100">
                    {modLessons.map((les, lesIdx) => {
                      const isLesCompleted = completedIds.has(les.id);
                      return (
                        <Link
                          key={les.id}
                          href={`/guau/app/academia/${stageSlug}/lesson/${les.id}`}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 ${ lesIdx < modLessons.length - 1 ? "border-b border-zinc-50" : "" }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${ isLesCompleted ? "bg-secondary-100 text-secondary-600" : "bg-primary-50 text-primary-500" }`}>
                            {isLesCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </div>
                          <span className={`text-xs flex-1 line-clamp-1 ${isLesCompleted ? "text-zinc-400 line-through" : "text-zinc-700 font-medium"}`}>
                            {les.title}
                          </span>
                          <span className="text-[9px] text-zinc-300 font-mono">{lesIdx + 1}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getHeroIcon(iconName: string): React.ElementType {
  const map: Record<string, React.ElementType> = {
    target: Target, shield: Shield, heart: Heart, brain: Brain,
    zap: Zap, star: Star, trophy: Award, theory: BookOpen,
    minigame_reflejos: Zap, minigame_diccionario: BookOpen, practice_timer: Timer,
    default: BookOpen,
  };
  return map[iconName ?? "default"] ?? BookOpen;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
