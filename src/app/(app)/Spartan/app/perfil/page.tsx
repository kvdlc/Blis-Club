import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import ProfileClient from "./ProfileClient";

async function getProfileData(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return { profile: data as Profile | null };
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { profile } = await getProfileData(user.id);

  return <ProfileClient userId={user.id} profile={profile} />;
}
