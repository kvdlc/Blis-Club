import { createClient } from "@/lib/supabase/server";
import { WebLandingClient } from "./WebLandingClient";

export default async function WebPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("landing_visible", true)
    .order("landing_order", { ascending: true })
    .order("price_cents", { ascending: true });

  return <WebLandingClient plans={(plans ?? []) as any[]} />;
}
