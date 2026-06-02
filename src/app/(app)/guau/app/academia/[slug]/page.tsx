import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Stage, Module, Lesson, UserProgress } from "@/types/database";
import { titleToSlug } from "@/lib/slug";
import StageClient from "./StageClient";

export default async function StagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Find stage by matching slug to title
  const { data: stagesData } = await supabase.from("stages").select("*").order("order");
  const stages = (stagesData as Stage[] | null) ?? [];
  const stage = stages.find((s) => titleToSlug(s.title) === slug);

  if (!stage) notFound();

  // Get modules for this stage
  const { data: modulesData } = await supabase
    .from("modules")
    .select("*")
    .eq("stage_id", stage.id)
    .order("order");
  const modules = (modulesData as Module[] | null) ?? [];

  // Get all lessons for these modules
  const moduleIds = modules.map((m) => m.id);
  let allStageLessons: (Lesson & { module_id: string })[] = [];
  if (moduleIds.length > 0) {
    const { data: lessonsData } = await supabase
      .from("lessons")
      .select("id, title, type, order, module_id")
      .in("module_id", moduleIds)
      .order("order");
    allStageLessons = (lessonsData as (Lesson & { module_id: string })[] | null) ?? [];
  }

  // Get user progress
  const lessonIds = allStageLessons.map((l) => l.id);
  let stageProgress: UserProgress[] = [];
  if (lessonIds.length > 0) {
    const { data: progData } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);
    stageProgress = (progData as UserProgress[] | null) ?? [];
  }

  // Get all other stages for navigation context
  return (
    <StageClient
      stage={stage}
      modules={modules}
      allStageLessons={allStageLessons}
      stageProgress={stageProgress}
      stages={stages}
    />
  );
}
