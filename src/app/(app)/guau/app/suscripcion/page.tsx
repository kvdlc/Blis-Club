import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./SubscriptionClient";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: appData } = await supabase
    .from("applications")
    .select("id")
    .eq("slug", "guau")
    .single();

  const appId = appData?.id ?? null;

  let plansQuery = supabase
    .from("plans")
    .select("*")
    .order("price_cents", { ascending: true });

  // Incluir planes propios de Guau y planes globales (application_id null)
  if (appId) {
    plansQuery = plansQuery.or(`application_id.eq.${appId},application_id.is.null`);
  }

  const { data: plans } = await plansQuery;

  return (
    <SubscriptionClient plans={(plans ?? []) as any[]} />
  );
}
