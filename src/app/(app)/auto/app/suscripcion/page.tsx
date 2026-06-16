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

  // Cargar app "auto" y sus planes
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("slug", "auto")
    .single();

  const { data: planes } = await supabase
    .from("plans")
    .select("*")
    .eq("application_id", app?.id)
    .eq("is_active", true)
    .order("price_cents", { ascending: true });

  return <SuscripcionClient subscription={sub ?? null} planes={planes ?? []} />;
}
