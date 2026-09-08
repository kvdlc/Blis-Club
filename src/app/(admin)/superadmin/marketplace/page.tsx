import { createServiceClient } from "@/lib/supabase/service";
import type { MarketplaceListing, MarketplaceProduct } from "@/types/database";
import MarketplaceAdminClient from "./MarketplaceAdminClient";

export default async function MarketplaceAdminPage() {
  const supabase = createServiceClient();
  const [listingsRes, profilesRes, productsRes] = await Promise.all([
    supabase.from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("id, display_name, email, whatsapp").in("id", []),
    supabase.from("marketplace_products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const listings = (listingsRes.data ?? []) as MarketplaceListing[];
  const products = (productsRes.data ?? []) as MarketplaceProduct[];

  // Perfiles del vendedor por separado (sin FK para join embebido)
  const userIds = [...new Set(listings.map((l) => l.user_id).filter(Boolean))];
  let sellerMap: Record<string, { display_name?: string; email?: string; whatsapp?: string }> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase.from("profiles").select("id, display_name, email, whatsapp").in("id", userIds);
    sellerMap = Object.fromEntries((profiles ?? []).map((pp) => [pp.id, pp]));
  }

  const enriched = listings.map((l) => ({ ...l, profiles: sellerMap[l.user_id] ?? null }));

  return <MarketplaceAdminClient listings={enriched} products={products} />;
}
