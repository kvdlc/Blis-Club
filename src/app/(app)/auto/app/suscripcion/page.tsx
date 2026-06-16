import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SuscripcionClient from "./SuscripcionClient";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Cargar suscripción actual
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Cargar planes disponibles para Auto
  const { data: planes } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

  return <SuscripcionClient subscription={sub ?? null} planes={planes ?? []} />;
}
