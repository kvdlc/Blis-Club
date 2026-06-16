import { createClient } from "@/lib/supabase/server";
import type { MarketplaceListing } from "@/types/database";
import MarketplaceClient from "./MarketplaceClient";

async function getListings(categoria?: string, marca?: string) {
  const supabase = await createClient();
  let query = supabase.from("marketplace_listings").select("*").eq("activo", true).order("created_at", { ascending: false }).limit(40);

  if (categoria && categoria !== "todas") query = query.eq("categoria", categoria);
  if (marca) query = query.ilike("marca", `%${marca}%`);

  const { data } = await query;
  return (data as MarketplaceListing[] | null) ?? [];
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; marca?: string }>;
}) {
  const sp = await searchParams;
  const listings = await getListings(sp.cat, sp.marca);

  return <MarketplaceClient listings={listings} activeCat={sp.cat || "todas"} searchMarca={sp.marca || ""} />;
}
