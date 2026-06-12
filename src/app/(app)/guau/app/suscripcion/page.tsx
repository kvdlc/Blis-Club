import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./SubscriptionClient";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: appData } = await supabase
    .from("applications")
    .select("id")
    .eq("slug", "guau")
    .single();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("application_id", appData?.id ?? "")
    .order("price_cents", { ascending: true });

  return (
    <SubscriptionClient plans={(plans ?? []) as any[]} />
  );
}
