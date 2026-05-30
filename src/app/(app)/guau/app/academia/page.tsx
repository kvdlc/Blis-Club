import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Stage, Module, Lesson, UserProgress } from "@/types/database";
import { Lock, CheckCircle, Play } from "lucide-react";

async function getAcademiaData(userId: string) {
  const supabase = await createClient();

  const [stagesRes, modulesRes, lessonsRes, progressRes] = await Promise.all([
    supabase.from("stages").select("*").order("order"),
    supabase.from("modules").select("*").order("order"),
    supabase.from("lessons").select("*").order("order"),
    supabase.from("user_progress").select("*").eq("user_id", userId),
  ]);

  return {
    stages: (stagesRes.data as Stage[] | null) ?? [],
    modules: (modulesRes.data as Module[] | null) ?? [],
    lessons: (lessonsRes.data as Lesson[] | null) ?? [],
    progress: (progressRes.data as UserProgress[] | null) ?? [],
  };
}

export default async function AcademiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { stages, modules, lessons, progress } = await getAcademiaData(user.id);

  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );

  const stage1 = stages.find((s) => s.order === 1);
  const stage1Modules = modules.filter((m) => m.stage_id === stage1?.id);
  const allModulesForStage = stage1Modules;

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <GraduationCapFallback />
        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300">Academia</h2>
        <p className="text-zinc-500">El contenido educativo estará disponible pronto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      {stage1 && (
        <div className="bg-primary-50 dark:bg-primary-950 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-primary-700 dark:text-primary-300">{stage1.title}</h2>
          <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">{stage1.description}</p>
          <div className="bg-white dark:bg-zinc-900 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600 rounded-full transition-all"
              style={{
                width: `${Math.round((completedLessonIds.size / Math.max(lessons.filter(l => allModulesForStage.some(m => m.id === l.module_id)).length, 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1.5 font-medium">
            {completedLessonIds.size} de {lessons.filter(l => allModulesForStage.some(m => m.id === l.module_id)).length} lecciones completadas
          </p>
        </div>
      )}

      {/* Vertical Roadmap */}
      <div className="relative">
        {stages.map((stage, stageIdx) => {
          const stageModules = modules.filter((m) => m.stage_id === stage.id);
          const isUnlocked = stageIdx === 0;
          const allStageLessons = lessons.filter((l) =>
            stageModules.some((m) => m.id === l.module_id)
          );
          const completedInStage = allStageLessons.filter((l) =>
            completedLessonIds.has(l.id)
          ).length;

          return (
            <div key={stage.id} className="mb-8">
              {/* Stage header */}
              <div
                className="flex items-center gap-3 mb-4"
                style={{ borderLeftColor: isUnlocked ? stage.color_hex : "#9ca3af", borderLeftWidth: 3, paddingLeft: 12 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: isUnlocked ? stage.color_hex : "#9ca3af" }}
                >
                  {isUnlocked ? stage.order : <Lock className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isUnlocked ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
                    {stage.title}
                  </h3>
                  <p className="text-xs text-zinc-500">{stage.description}</p>
                </div>
                {isUnlocked && allStageLessons.length > 0 && (
                  <span className="ml-auto text-xs text-secondary-600 dark:text-secondary-400 font-medium">
                    {completedInStage}/{allStageLessons.length}
                  </span>
                )}
              </div>

              {/* Modules */}
              <div className="space-y-2 pl-6">
                {stageModules.map((mod, modIdx) => {
                  const modLessons = lessons.filter((l) => l.module_id === mod.id);
                  const firstLesson = modLessons[0];
                  const isModUnlocked = isUnlocked && (modIdx === 0 || (modIdx > 0 && stageModules[modIdx - 1] && lessons.filter(l => l.module_id === stageModules[modIdx - 1].id).every(l => completedLessonIds.has(l.id))));
                  const completedCount = modLessons.filter((l) => completedLessonIds.has(l.id)).length;

                  const href = isModUnlocked && firstLesson ? `/guau/app/academia/${firstLesson.id}` : null;
                  const cls = `block rounded-xl border p-4 transition-all ${
                    isModUnlocked
                      ? "border-primary-200 dark:border-primary-800 bg-white dark:bg-zinc-900 hover:shadow-md active:scale-[0.98]"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60"
                  }`;
                  const inner = (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isModUnlocked ? "bg-primary-100 dark:bg-primary-950 text-primary-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      }`}>
                        {isModUnlocked ? (
                          completedCount === modLessons.length ? (
                            <CheckCircle className="w-5 h-5 text-secondary-500" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${isModUnlocked ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}>
                          Módulo {stage.order}.{mod.order}: {mod.title}
                        </h4>
                        {mod.description && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{mod.description}</p>
                        )}
                      </div>
                      {isModUnlocked && completedCount > 0 && (
                        <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                          {completedCount}/{modLessons.length}
                        </span>
                      )}
                    </div>
                  );
                  return href ? (
                    <Link key={mod.id} href={href} className={cls}>{inner}</Link>
                  ) : (
                    <div key={mod.id} className={cls}>{inner}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraduationCapFallback() {
  return (
    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
      <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22V14" />
      </svg>
    </div>
  );
}
