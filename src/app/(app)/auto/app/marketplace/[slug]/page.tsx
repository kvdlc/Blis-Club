import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { MarketplaceListing, VehicleSpecs } from "@/types/database";
import ListingDetailClient from "./ListingDetailClient";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("marketplace_listings")
    .select("*, profiles:user_id (display_name, avatar_url, whatsapp)")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!data) notFound();

  const listing = data as unknown as MarketplaceListing & { profiles?: { display_name?: string; avatar_url?: string; whatsapp?: string } | null };

  // Similares: otros autos usados activos (excluyendo el actual)
  const { data: similaresRaw } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("activo", true)
    .eq("categoria", "autos_usados")
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(6);
  const similares = (similaresRaw as MarketplaceListing[] | null) ?? [];

  // Specs del vehículo vinculado (para enriquecer la ficha)
  let specs: VehicleSpecs | null = null;
  if (listing.vehicle_id) {
    const { data: s } = await supabase.from("vehicle_specs").select("*").eq("vehicle_id", listing.vehicle_id).maybeSingle();
    specs = s as VehicleSpecs | null;
  } else if (listing.categoria === "autos_usados") {
    // intentar por catálogo si hay catalog_spec_id? No aplica sin vehicle; omitir.
  }

  return (
    <ListingDetailClient
      listing={listing}
      isOwner={!!user && listing.user_id === user.id}
      userId={user?.id ?? null}
      similares={similares}
      specs={specs}
    />
  );
}
