import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { MarketplaceListing } from "@/types/database";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { ids } = await searchParams;
  const idList = (ids || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (idList.length < 2) redirect("/auto/app/marketplace#autos");

  const { data } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("activo", true)
    .in("id", idList);

  const autos = (data as MarketplaceListing[] | null) ?? [];
  // Mantener el orden en que se eligieron
  const ordered = idList.map((id) => autos.find((a) => a.id === id)).filter(Boolean) as MarketplaceListing[];

  return <CompareClient autos={ordered} />;
}
