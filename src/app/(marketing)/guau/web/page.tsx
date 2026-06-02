import { createClient } from "@/lib/supabase/server";
import { WebLandingClient } from "./WebLandingClient";

export default async function WebPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price_cents", { ascending: true });

  return <WebLandingClient plans={(plans ?? []) as any[]} />;
}
