import { createClient } from "@/lib/supabase/server";
import { KidsSubscriptionClient } from "./KidsSubscriptionClient";

export const dynamic = "force-dynamic";

export default async function KidsSuscripcionPage() {
  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("slug", "kids")
    .single();

  let query = supabase.from("plans").select("*").order("price_cents", { ascending: true });
  if (app?.id) {
    query = query.or(`application_id.eq.${app.id},application_id.is.null`);
  }
  const { data: plans } = await query;

  return <KidsSubscriptionClient plans={(plans ?? []) as any[]} />;
}
