import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import { TrackerClient } from "./TrackerClient";
import type { Walk, Dog, AgilitySession, DogVaccine } from "@/types/database";

export default async function TrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { data: dog } = savedDogId
    ? await supabase.from("dogs").select("*").eq("id", savedDogId).eq("owner_id", user.id).single()
    : await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();

  const { data: allDogsData } = await supabase.from("dogs").select("*").eq("owner_id", user.id).order("created_at", { ascending: true });
  const allDogs: Dog[] = (allDogsData as Dog[] | null) ?? [];

  let walks: Walk[] = [];
  let agilitySessions: AgilitySession[] = [];
  let streakDays = 0;
  let vaccines: DogVaccine[] = [];

  if ((dog as Dog | null)?.id) {
    const dogId = (dog as Dog).id;
    const [{ data: walksData }, { data: agilityData }, { data: streakData }, { data: vacs }] = await Promise.all([
      supabase.from("walks").select("*").eq("dog_id", dogId).order("start_time", { ascending: false }).limit(60),
      supabase.from("agility_sessions").select("*").eq("dog_id", dogId).order("fecha", { ascending: false }).limit(20),
      supabase.from("user_streaks").select("*").eq("user_id", user.id).eq("streak_type", "walk").maybeSingle(),
      supabase.from("dog_vaccines").select("*").eq("dog_id", dogId).order("created_at", { ascending: false }),
    ]);
    walks = (walksData as Walk[] | null) ?? [];
    agilitySessions = (agilityData as AgilitySession[] | null) ?? [];
    streakDays = (streakData as { current_streak: number } | null)?.current_streak ?? 0;
    vaccines = (vacs as DogVaccine[] | null) ?? [];
  }

  return (
    <TrackerClient
      walks={walks}
      dog={dog as Dog | null}
      allDogs={allDogs}
      agilitySessions={agilitySessions}
      streakDays={streakDays}
      userId={user.id}
      vaccines={vaccines}
    />
  );
}
