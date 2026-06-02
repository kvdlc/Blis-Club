"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Stage, Module, Lesson, UserProgress } from "@/types/database";
import { titleToSlug } from "@/lib/slug";
import { Play } from "lucide-react";

interface Props {
  stages: Stage[];
  modules: Module[];
  lessons: Lesson[];
  progress: UserProgress[];
  streak: number;
}

function getOverallProgress(completedCount: number, totalLessons: number) {
  return Math.round((completedCount / Math.max(totalLessons, 1)) * 100);
}

export default function AcademiaClient({ stages, modules, lessons, progress, streak }: Props) {
  const router = useRouter();

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );

  const totalLessons = lessons.length;
  const completedCount = completedLessonIds.size;
  const overallPct = getOverallProgress(completedCount, totalLessons);

  // Featured: first unlocked module not fully completed
  const stage1 = stages.find((s) => s.order === 1);
  const stage1Modules = modules
    .filter((m) => m.stage_id === stage1?.id)
    .sort((a, b) => a.order - b.order);

  const currentModule = stage1Modules.find((mod) => {
    const modLessons = lessons.filter((l) => l.module_id === mod.id);
    const done = modLessons.filter((l) => completedLessonIds.has(l.id)).length;
    return done < modLessons.length;
  }) ?? stage1Modules[0];

  const currentModLessons = currentModule
    ? lessons.filter((l) => l.module_id === currentModule.id)
    : [];

  const handleContinue = () => {
    const nextLesson = currentModLessons.find(
      (l) => !completedLessonIds.has(l.id)
    );
    if (nextLesson && stage1) {
      const slug = titleToSlug(stage1.title);
      router.push(`/guau/app/academia/${slug}/lesson/${nextLesson.id}`);
    }
  };

  const stageModulesMap = new Map<string, Module[]>();
  stages.forEach((s) => {
    stageModulesMap.set(
      s.id,
      modules.filter((m) => m.stage_id === s.id).sort((a, b) => a.order - b.order)
    );
  });

  const isStageUnlocked = (stageIdx: number) => {
    if (stageIdx === 0) return true;
    const prevStage = stages[stageIdx - 1];
    const prevModules = stageModulesMap.get(prevStage.id) ?? [];
    const prevLessons = lessons.filter((l) =>
      prevModules.some((m) => m.id === l.module_id)
    );
    return prevLessons.every((l) => completedLessonIds.has(l.id));
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-[1.25rem] shadow-sm border border-zinc-100 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Progreso general</span>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{overallPct}%</span>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* Featured Coach Card */}
      {currentModule && (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white shadow-lg shadow-primary-600/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[60%]">
              <h2 className="text-base font-bold leading-tight">{currentModule.title}</h2>
              <p className="text-primary-100 text-xs mt-1 line-clamp-2">
                {currentModule.description ?? "Continúa tu entrenamiento canino paso a paso"}
              </p>
              <button
                onClick={handleContinue}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white text-primary-700 px-4 py-2 text-xs font-bold transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Continuar
              </button>
            </div>
            <div className="shrink-0">
              <img src="/icons/badge educativo.png" alt="" className="w-24 h-24 object-contain" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Learning Paths - Fixed 4 Routes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Rutas de aprendizaje</h3>
          <Link href="/guau/app/academia" className="text-xs font-semibold text-primary-600 dark:text-primary-400">Ver todo</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Entrenador", color: "#5956E9", img: "/icons/entrenador bc.png", stageIdx: 0 },
            { title: "Obediencia básica", color: "#2EC4A8", img: "/icons/obediencia bc.png", stageIdx: 1 },
            { title: "Agilidad", color: "#F97316", img: "/icons/agilidad bc.png", stageIdx: 2 },
            { title: "Seguridad", color: "#A855F7", img: "/icons/seguridad-bc.png", stageIdx: 3 },
          ].map((route) => {
            const stage = stages[route.stageIdx];
            const stageMods = stage ? stageModulesMap.get(stage.id) ?? [] : [];
            const stageLessons = stage ? lessons.filter((l) => stageMods.some((m) => m.id === l.module_id)) : [];
            const done = stageLessons.filter((l) => completedLessonIds.has(l.id)).length;
            const total = stageLessons.length;
            return (
              <Link
                key={route.title}
                href={`/guau/app/academia/${titleToSlug(route.title)}`}
                className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] transition-all active:scale-95 bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800"
              >
                <img src={route.img} alt={route.title} className="w-24 h-24 object-contain drop-shadow-md" />
                <span className="text-xs font-bold text-center leading-tight text-zinc-800 dark:text-zinc-200">
                  {route.title}
                </span>
                <div className="w-full">
                  <div className="relative bg-zinc-200 dark:bg-zinc-700 rounded-full h-5 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((done / Math.max(total || 1, 1)) * 100)}%`,
                        background: `linear-gradient(90deg, ${route.color}, ${route.color}dd)`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.6)] tracking-wide">
                      {done}/{total || 0}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

