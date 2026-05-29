import { createClient } from "@/lib/supabase/server";
import { TrackerClient } from "./TrackerClient";
import type { Walk, Dog, AgilitySession } from "@/types/database";

export default async function TrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: dog } = await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();

  let walks: Walk[] = [];
  let agilitySessions: AgilitySession[] = [];
  let streakDays = 0;

  if ((dog as Dog | null)?.id) {
    const dogId = (dog as Dog).id;
    const [{ data: walksData }, { data: agilityData }, { data: streakData }] = await Promise.all([
      supabase.from("walks").select("*").eq("dog_id", dogId).order("start_time", { ascending: false }).limit(60),
      supabase.from("agility_sessions").select("*").eq("dog_id", dogId).order("fecha", { ascending: false }).limit(20),
      supabase.from("user_streaks").select("*").eq("user_id", user.id).eq("streak_type", "walk").maybeSingle(),
    ]);
    walks = (walksData as Walk[] | null) ?? [];
    agilitySessions = (agilityData as AgilitySession[] | null) ?? [];
    streakDays = (streakData as { current_streak: number } | null)?.current_streak ?? 0;
  }

  return (
    <TrackerClient
      walks={walks}
      dog={dog as Dog | null}
      agilitySessions={agilitySessions}
      streakDays={streakDays}
      userId={user.id}
    />
  );
}
