import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Vehicle } from "@/types/database";
import ProfileClient from "./ProfileClient";

async function getProfileData(userId: string) {
  const supabase = await createClient();

  const [profRes, vehRes, checkoutsRes, ordersRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("vehicles").select("*").eq("owner_id", userId).order("created_at", { ascending: true }),
    supabase.from("product_checkouts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    supabase.from("product_orders").select("*, product:marketplace_products(*)").eq("user_id", userId).order("created_at", { ascending: false }).limit(40),
  ]);

  return {
    profile: profRes.data as Profile | null,
    vehicles: (vehRes.data as Vehicle[] | null) ?? [],
    checkouts: (checkoutsRes.data as any[] | null) ?? [],
    orders: (ordersRes.data as any[] | null) ?? [],
  };
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { profile, vehicles, checkouts, orders } = await getProfileData(user.id);

  return <ProfileClient userId={user.id} profile={profile} vehicles={vehicles} checkouts={checkouts} orders={orders} />;
}
