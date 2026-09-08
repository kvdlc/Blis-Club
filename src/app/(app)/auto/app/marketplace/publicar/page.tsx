import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle, Profile } from "@/types/database";
import PublishClient from "./PublishClient";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [vehRes, profRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: true }),
    supabase.from("profiles").select("display_name, whatsapp, country").eq("id", user.id).maybeSingle(),
  ]);

  const myVehicles = (vehRes.data as Vehicle[] | null) ?? [];
  const profile = profRes.data as Pick<Profile, "display_name" | "whatsapp" | "country"> | null;

  return <PublishClient userId={user.id} myVehicles={myVehicles} profile={profile} />;
}
