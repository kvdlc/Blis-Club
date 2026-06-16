import { createServiceClient } from "@/lib/supabase/service";
import type { MarketplaceListing } from "@/types/database";
import MarketplaceAdminClient from "./MarketplaceAdminClient";

export default async function MarketplaceAdminPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("marketplace_listings")
    .select("*, profiles:user_id (display_name, email, whatsapp)")
    .order("created_at", { ascending: false })
    .limit(50);

  const listings = (data ?? []) as unknown as (MarketplaceListing & { profiles?: { display_name?: string; email?: string; whatsapp?: string } | null })[];

  return <MarketplaceAdminClient listings={listings} />;
}
