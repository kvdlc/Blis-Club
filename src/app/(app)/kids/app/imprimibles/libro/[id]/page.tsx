import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityWorkspace } from "@/components/kids/ActivityWorkspace";
import { DownloadPdfButton, OpenPdfLink } from "@/components/kids/DownloadPdfButton";
import type { KidsProgress } from "@/lib/kids";

export const dynamic = "force-dynamic";

export default async function LibroImprimiblePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: activity } = await supabase.from("kids_activities").select("*").eq("id", id).maybeSingle();
  if (!activity) notFound();

  const { data: progress } = await supabase
    .from("kids_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("activity_id", id)
    .maybeSingle();

  return (
    <div className="space-y-4">
      <div className="kids-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-500">Imprimible · Vista previa</p>
          <h1 className="truncate text-lg font-black text-magic" style={{ fontFamily: "var(--font-quicksand)" }}>
            {activity.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadPdfButton
            url={`/api/kids/book-pdf/${activity.id}`}
            filename={activity.title}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          />
          <OpenPdfLink url={`/api/kids/book-pdf/${activity.id}`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-md" />
        </div>
      </div>

      <ActivityWorkspace activity={activity} progress={(progress as KidsProgress) ?? null} backHref="/kids/app/imprimibles" />
    </div>
  );
}
