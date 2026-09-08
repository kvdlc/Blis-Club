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
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!data) notFound();

  const listing = data as MarketplaceListing;

  // Perfil del vendedor por separado (la tabla no tiene FK para join embebido)
  let seller: { display_name?: string; avatar_url?: string; whatsapp?: string } | null = null;
  const { data: p } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, whatsapp")
    .eq("id", listing.user_id)
    .maybeSingle();
  seller = p as typeof seller;

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
  }

  return (
    <ListingDetailClient
      listing={{ ...listing, profiles: seller }}
      isOwner={!!user && listing.user_id === user.id}
      userId={user?.id ?? null}
      similares={similares}
      specs={specs}
    />
  );
}
