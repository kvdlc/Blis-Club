import { createClient } from "@/lib/supabase/server";
import { EditDogClient } from "./EditDogClient";
import type { Dog, DogMetabolicProfile, DogMealSlot, WeeklyChallenge, UserChallenge } from "@/types/database";
import { notFound } from "next/navigation";
import { VACCINES } from "@/lib/vaccines-wiki";

export default async function EditDogPage({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: dog }, { data: mp }, { data: slots }, { data: challenges }, { data: userChallenges }] = await Promise.all([
    supabase.from("dogs").select("*").eq("id", dogId).eq("owner_id", user.id).single(),
    supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", dogId).maybeSingle(),
    supabase.from("dog_meal_slots").select("*").eq("dog_id", dogId).order("slot_index", { ascending: true }),
    supabase.from("weekly_challenges").select("*").order("fecha_inicio", { ascending: false }).limit(10),
    supabase.from("user_challenges").select("*").eq("user_id", user.id),
  ]);

  if (!dog) notFound();

  return (
    <EditDogClient
      dog={dog as Dog}
      metabolicProfile={mp as DogMetabolicProfile | null}
      mealSlots={(slots as DogMealSlot[] | null) ?? []}
      challenges={(challenges as WeeklyChallenge[] | null) ?? []}
      userChallenges={(userChallenges as UserChallenge[] | null) ?? []}
      userId={user.id}
    />
  );
}
