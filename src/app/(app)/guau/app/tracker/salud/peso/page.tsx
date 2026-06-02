import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PesoClient } from "./PesoClient";
import type { Dog, DogWeightHistory } from "@/types/database";
import { notFound } from "next/navigation";

export default async function PesoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { data: dog } = savedDogId
    ? await supabase.from("dogs").select("*").eq("id", savedDogId).eq("owner_id", user.id).single()
    : await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();

  if (!dog) notFound();

  const dogId = (dog as Dog).id;
  const { data: weights } = await supabase.from("dog_weight_history").select("*").eq("dog_id", dogId).order("fecha", { ascending: false }).limit(20);

  return (
    <PesoClient
      dog={dog as Dog}
      weightHistory={(weights as DogWeightHistory[] | null) ?? []}
    />
  );
}
