import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityWorkspace } from "@/components/kids/ActivityWorkspace";
import type { KidsProgress } from "@/lib/kids";

export const dynamic = "force-dynamic";

export default async function KidsActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  return <ActivityWorkspace activity={activity} progress={(progress as KidsProgress) ?? null} />;
}
