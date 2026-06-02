import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Lesson, UserProgress, Stage, Module } from "@/types/database";
import { titleToSlug } from "@/lib/slug";
import { LessonDetail } from "../../../_components/LessonDetail";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { slug, lessonId } = await params;
  const { start } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Get the lesson with module + stage info
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules!inner(id, title, order, stage_id, stages!inner(id, title, color_hex, order, description))")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const typedLesson = lesson as Lesson & {
    modules: {
      id: string;
      title: string;
      order: number;
      stage_id: string;
      stages: Stage;
    };
  };

  // Verify the slug matches the stage title
  const stageSlug = titleToSlug(typedLesson.modules.stages.title);
  if (stageSlug !== slug) {
    // Redirect to correct slug
    notFound();
  }

  const stageId = typedLesson.modules.stage_id;
  const moduleId = typedLesson.modules.id;

  // Fetch all modules in this stage
  const { data: stageModules } = await supabase
    .from("modules")
    .select("*")
    .eq("stage_id", stageId)
    .order("order");

  // Fetch all lessons for all modules in this stage
  const moduleIds = (stageModules as Module[] | null)?.map((m) => m.id) ?? [];
  let allStageLessons: (Lesson & { module_id: string })[] = [];
  if (moduleIds.length > 0) {
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, title, type, order, module_id")
      .in("module_id", moduleIds)
      .order("order");
    allStageLessons = (lessonsData as (Lesson & { module_id: string })[] | null) ?? [];
  }

  // Fetch user progress for all lessons in this stage
  const allLessonIds = allStageLessons.map((l) => l.id);
  let stageProgress: UserProgress[] = [];
  if (allLessonIds.length > 0) {
    const { data: progData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("lesson_id", allLessonIds);
    stageProgress = (progData as UserProgress[] | null) ?? [];
  }

  // Current lesson progress
  const { data: currentProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  // Get all lessons in current module to find next lesson
  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, order")
    .eq("module_id", moduleId)
    .order("order");

  const currentIdx = (moduleLessons as { id: string; order: number }[] | null)?.findIndex((l) => l.id === lessonId) ?? 0;
  const nextLessonId = (moduleLessons as { id: string; order: number }[] | null)?.[currentIdx + 1]?.id ?? null;

  // Build completedIds for LessonPlayer
  const completedIds = stageProgress.filter((p) => p.completed).map((p) => p.lesson_id);

  return (
    <LessonDetail
      lesson={typedLesson}
      stage={typedLesson.modules.stages}
      module={typedLesson.modules}
      allModules={(stageModules as Module[] | null) ?? []}
      allStageLessons={allStageLessons}
      stageProgress={stageProgress}
      currentProgress={(currentProgress as UserProgress | null) ?? null}
      nextLessonId={nextLessonId}
      userId={user.id}
      completedLessonIds={completedIds}
      moduleLessons={(moduleLessons as { id: string; order: number }[] | null) ?? []}
      autoStart={start === "1"}
    />
  );
}
