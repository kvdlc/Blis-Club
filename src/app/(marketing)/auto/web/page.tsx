import { createClient } from "@/lib/supabase/server";
import { AutoWebLandingClient } from "./AutoWebLandingClient";

const LANDING_SLUG = "auto-web";

export default async function AutoWebPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("landing_visible", true)
    .eq("landing_slug", LANDING_SLUG)
    .order("landing_order", { ascending: true })
    .order("price_cents", { ascending: true });

  return <AutoWebLandingClient plans={(plans ?? []) as any[]} />;
}
