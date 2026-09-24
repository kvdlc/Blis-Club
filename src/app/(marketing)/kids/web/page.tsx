import { createClient } from "@/lib/supabase/server";
import { KidsWebLandingClient } from "./KidsWebLandingClient";

export default async function KidsWebPage() {
  const supabase = await createClient();
  const [{ data: plans }, { data: categories }] = await Promise.all([
    supabase
      .from("plans")
      .select("*")
      .eq("landing_visible", true)
      .eq("landing_slug", "kids-web")
      .order("landing_order", { ascending: true })
      .order("price_cents", { ascending: true }),
    supabase.from("kids_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
  ]);

  return (
    <KidsWebLandingClient plans={(plans ?? []) as any[]} categories={(categories ?? []) as any[]} />
  );
}
