import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { VacunasClient } from "./VacunasClient";
import type { Dog, DogVaccine, TrustedVet } from "@/types/database";
import { notFound } from "next/navigation";

export default async function VacunasPage() {
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
  const [{ data: vacs }, { data: vets }] = await Promise.all([
    supabase.from("dog_vaccines").select("*").eq("dog_id", dogId).order("created_at", { ascending: false }),
    supabase.from("trusted_vets").select("*").eq("user_id", user.id).order("name", { ascending: true }),
  ]);

  return (
    <VacunasClient
      dog={dog as Dog}
      vaccines={(vacs as DogVaccine[] | null) ?? []}
      trustedVets={(vets as TrustedVet[] | null) ?? []}
    />
  );
}
