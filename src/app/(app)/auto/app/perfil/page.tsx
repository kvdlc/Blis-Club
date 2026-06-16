import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Vehicle } from "@/types/database";
import ProfileClient from "./ProfileClient";

async function getProfileData(userId: string) {
  const supabase = await createClient();

  const [profRes, vehRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("vehicles").select("*").eq("owner_id", userId).order("created_at", { ascending: true }),
  ]);

  return {
    profile: profRes.data as Profile | null,
    vehicles: (vehRes.data as Vehicle[] | null) ?? [],
  };
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { profile, vehicles } = await getProfileData(user.id);

  return <ProfileClient userId={user.id} profile={profile} vehicles={vehicles} />;
}
