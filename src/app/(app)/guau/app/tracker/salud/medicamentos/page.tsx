import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { MedicamentosClient } from "./MedicamentosClient";
import type { Dog, DogMedication } from "@/types/database";
import { notFound } from "next/navigation";

export default async function MedicamentosPage() {
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
  const { data: meds } = await supabase.from("dog_medications").select("*").eq("dog_id", dogId).order("created_at", { ascending: false });

  return (
    <MedicamentosClient
      dog={dog as Dog}
      medications={(meds as DogMedication[] | null) ?? []}
    />
  );
}
