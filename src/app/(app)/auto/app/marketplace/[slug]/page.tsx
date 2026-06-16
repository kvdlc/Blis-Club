import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { MarketplaceListing } from "@/types/database";
import ListingDetailClient from "./ListingDetailClient";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("marketplace_listings")
    .select("*, profiles:user_id (display_name, avatar_url, whatsapp)")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!data) notFound();

  const listing = data as unknown as MarketplaceListing & { profiles?: { display_name?: string; avatar_url?: string; whatsapp?: string } | null };

  return <ListingDetailClient listing={listing} />;
}
