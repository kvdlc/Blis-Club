import { createServiceClient } from "@/lib/supabase/service";
import type { MarketplaceListing, MarketplaceProduct } from "@/types/database";
import MarketplaceAdminClient from "./MarketplaceAdminClient";

export default async function MarketplaceAdminPage() {
  const supabase = createServiceClient();
  const [listingsRes, productsRes] = await Promise.all([
    supabase.from("marketplace_listings")
      .select("*, profiles:user_id (display_name, email, whatsapp)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("marketplace_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const listings = (listingsRes.data ?? []) as unknown as (MarketplaceListing & { profiles?: { display_name?: string; email?: string; whatsapp?: string } | null })[];
  const products = (productsRes.data ?? []) as unknown as MarketplaceProduct[];

  return <MarketplaceAdminClient listings={listings} products={products} />;
}
