import { createClient } from "@/lib/supabase/server";
import { LessonPlayer } from "./LessonPlayer";
import type { Lesson, UserProgress } from "@/types/database";
import { notFound } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules!inner(stage_id, stages!inner(title, color_hex))")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  // Get all lessons in this module to know if it's the last one
  const { data: moduleLessons } = await supabase
    .from("lessons")
    .select("id, order")
    .eq("module_id", (lesson as Lesson & { module_id: string }).module_id)
    .order("order");

  const { data: allModuleLessons } = await supabase
    .from("user_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id);

  const completedIds = (allModuleLessons as UserProgress[] | null)
    ?.filter((p) => p.completed)
    .map((p) => p.lesson_id) ?? [];

  const currentIdx = (moduleLessons as { id: string }[] | null)?.findIndex((l) => l.id === lessonId) ?? 0;
  const nextLessonId = (moduleLessons as { id: string }[] | null)?.[currentIdx + 1]?.id ?? null;

  return (
    <LessonPlayer
      lesson={lesson as Lesson}
      initialCompleted={(progress as UserProgress | null)?.completed ?? false}
      lessonId={lessonId}
      userId={user.id}
      nextLessonId={nextLessonId}
      completedLessonIds={completedIds}
      moduleId={(lesson as Lesson & { module_id: string }).module_id}
      moduleLessons={moduleLessons as { id: string; order: number }[]}
    />
  );
}
