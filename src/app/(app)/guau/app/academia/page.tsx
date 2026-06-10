import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import AcademiaClient from "./AcademiaClient";
import type { Stage, Module, Lesson, UserProgress } from "@/types/database";

async function getAcademiaData(userId: string) {
  const supabase = await createClient();

  const [stagesRes, modulesRes, lessonsRes, progressRes, streakRes] = await Promise.all([
    supabase.from("stages").select("*").order("order"),
    supabase.from("modules").select("*").order("order"),
    supabase.from("lessons").select("*").order("order"),
    supabase.from("user_progress").select("*").eq("user_id", userId),
    supabase.from("user_streaks").select("*").eq("user_id", userId).eq("streak_type", "academy").maybeSingle(),
  ]);

  return {
    stages: (stagesRes.data as Stage[] | null) ?? [],
    modules: (modulesRes.data as Module[] | null) ?? [],
    lessons: (lessonsRes.data as Lesson[] | null) ?? [],
    progress: (progressRes.data as UserProgress[] | null) ?? [],
    streak: ((streakRes.data as { current_streak: number } | null)?.current_streak) ?? 0,
  };
}

export default async function AcademiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const { stages, modules, lessons, progress, streak } = await getAcademiaData(user.id);

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22V14" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-700">Academia</h2>
        <p className="text-zinc-500">El contenido educativo estará disponible pronto.</p>
      </div>
    );
  }

  return (
    <AcademiaClient
      stages={stages}
      modules={modules}
      lessons={lessons}
      progress={progress}
      streak={streak}
    />
  );
}
