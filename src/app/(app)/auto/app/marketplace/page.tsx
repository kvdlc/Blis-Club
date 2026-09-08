import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceListing, MarketplaceProduct, Vehicle } from "@/types/database";
import MarketplaceClient from "./MarketplaceClient";

async function getMarketplaceData(userId: string) {
  const supabase = await createClient();

  const [listingsRes, productsRes, myVehiclesRes] = await Promise.all([
    supabase
      .from("marketplace_listings")
      .select("*")
      .eq("activo", true)
      .eq("categoria", "autos_usados")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("marketplace_products")
      .select("*")
      .eq("activo", true)
      .order("destacado", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    listings: (listingsRes.data as MarketplaceListing[] | null) ?? [],
    products: (productsRes.data as MarketplaceProduct[] | null) ?? [],
    myVehicles: (myVehiclesRes.data as Vehicle[] | null) ?? [],
  };
}

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const data = await getMarketplaceData(user.id);

  return <MarketplaceClient {...data} userId={user.id} />;
}
