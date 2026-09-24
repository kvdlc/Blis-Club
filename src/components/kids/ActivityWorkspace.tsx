"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { categoryMeta, DIFFICULTY_LABEL, type KidsActivity, type KidsProgress } from "@/lib/kids";
import { ColoringTool } from "./tools/ColoringTool";
import { CrosswordTool } from "./tools/CrosswordTool";
import { WordSearchTool } from "./tools/WordSearchTool";
import { MazeTool } from "./tools/MazeTool";
import { DotToDotTool } from "./tools/DotToDotTool";
import { StoryReaderTool } from "./tools/StoryReaderTool";
import { BookReader } from "./BookReader";

export function ActivityWorkspace({
  activity,
  progress,
  backHref = "/kids/app/interactivos",
}: {
  activity: KidsActivity;
  progress: KidsProgress | null;
  backHref?: string;
}) {
  const meta = categoryMeta(activity.category_slug);
  const [stars, setStars] = useState(progress?.stars ?? 0);
  const [completed, setCompleted] = useState(progress?.status === "completed");
  const [celebrate, setCelebrate] = useState(false);

  const complete = async ({ stars: s, score }: { stars: number; score?: number }) => {
    setStars(s);
    setCompleted(true);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 1800);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("kids_progress").upsert(
      {
        user_id: user.id,
        activity_id: activity.id,
        status: "completed",
        stars: s,
        score: score ?? 100,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,activity_id" },
    );
  };

  const pageCount = Array.isArray(activity.data?.pages) ? activity.data.pages.length : 0;
  const useBookReader = !!activity.data?.book && pageCount > 1 && activity.category_slug !== "cuento";

  return (
    <div className="space-y-5">
      {celebrate && <Confetti />}

      {/* Encabezado */}
      <div className="kids-card flex items-center gap-3 p-4">
        <Link
          href={backHref}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition-transform active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.emoji} {meta.name}
          </p>
          <h1 className="truncate text-lg font-black text-zinc-800" style={{ fontFamily: "var(--font-quicksand)" }}>
            {activity.title}
          </h1>
          <p className="text-[11px] font-bold text-zinc-400">
            {activity.age_min}–{activity.age_max} años · {DIFFICULTY_LABEL[activity.difficulty]}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star key={i} className={`h-5 w-5 ${i < stars ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
          ))}
        </div>
      </div>

      {activity.description && (
        <p className="px-1 text-sm font-semibold text-zinc-500">{activity.description}</p>
      )}

      {completed && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
          <Sparkles className="h-4 w-4" /> ¡Ya completaste esta actividad! Puedes repetirla cuando quieras.
        </div>
      )}

      {/* Herramienta */}
      {useBookReader ? (
        <BookReader activity={activity} onComplete={complete} />
      ) : (
        <>
          {activity.category_slug === "colorear" && <ColoringTool activity={activity} onComplete={complete} />}
          {activity.category_slug === "crucigrama" && <CrosswordTool activity={activity} onComplete={complete} />}
          {activity.category_slug === "sopa_letras" && <WordSearchTool activity={activity} onComplete={complete} />}
          {activity.category_slug === "laberinto" && <MazeTool activity={activity} onComplete={complete} />}
          {activity.category_slug === "unir_puntos" && <DotToDotTool activity={activity} onComplete={complete} />}
          {activity.category_slug === "cuento" && <StoryReaderTool activity={activity} onComplete={complete} />}
        </>
      )}
    </div>
  );
}

function Confetti() {
  const colors = ["#f97316", "#ec4899", "#8b5cf6", "#22c55e", "#3b82f6", "#facc15"];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece absolute block rounded-sm"
          style={{
            left: `${(i * 2.5) % 100}%`,
            top: `${-10 - (i % 5) * 8}%`,
            width: i % 3 === 0 ? 10 : 7,
            height: i % 3 === 0 ? 14 : 9,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${(i % 10) * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}
