import { createClient } from "@/lib/supabase/server";
import { SubscriptionClient } from "./SubscriptionClient";

export default async function SuscripcionPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price_cents", { ascending: true });

  return (
    <SubscriptionClient plans={(plans ?? []) as any[]} />
  );
}
