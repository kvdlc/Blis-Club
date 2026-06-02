import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SaludMenuClient } from "./SaludMenuClient";
import type { Dog } from "@/types/database";
import { notFound } from "next/navigation";

export default async function SaludPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { data: dog } = savedDogId
    ? await supabase.from("dogs").select("*").eq("id", savedDogId).eq("owner_id", user.id).single()
    : await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();

  if (!dog) notFound();

  return <SaludMenuClient dogName={(dog as Dog).nombre} />;
}
