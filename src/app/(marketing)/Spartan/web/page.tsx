import { createClient } from "@/lib/supabase/server";
import { SpartanWebLandingClient } from "./SpartanWebLandingClient";

const LANDING_SLUG = "Spartan-web";

export default async function SpartanWebPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("landing_visible", true)
    .eq("landing_slug", LANDING_SLUG)
    .order("landing_order", { ascending: true })
    .order("price_cents", { ascending: true });

  return <SpartanWebLandingClient plans={(plans ?? []) as any[]} />;
}
