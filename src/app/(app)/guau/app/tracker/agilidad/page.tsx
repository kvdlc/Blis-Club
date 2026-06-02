import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { AgilidadClient } from "./AgilidadClient";
import type { AgilitySession, Dog } from "@/types/database";
import { notFound } from "next/navigation";

export default async function AgilidadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { data: dog } = savedDogId
    ? await supabase.from("dogs").select("*").eq("id", savedDogId).eq("owner_id", user.id).single()
    : await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();

  let agilitySessions: AgilitySession[] = [];
  if ((dog as Dog | null)?.id) {
    const { data } = await supabase.from("agility_sessions").select("*").eq("dog_id", (dog as Dog).id).order("fecha", { ascending: false }).limit(20);
    agilitySessions = (data as AgilitySession[] | null) ?? [];
  }

  return <AgilidadClient sessions={agilitySessions} />;
}
