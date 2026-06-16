import { createServiceClient } from "@/lib/supabase/service";
import type { Vehicle } from "@/types/database";
import VehiculosClient from "./VehiculosClient";

export default async function VehiculosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = createServiceClient();
  const { q } = await searchParams;

  let query = supabase.from("vehicles").select("*, profiles:owner_id (display_name, email)").order("created_at", { ascending: false }).limit(50);

  if (q) {
    query = query.or(`marca.ilike.*${q}*,modelo.ilike.*${q}*,placa.ilike.*${q}*`);
  }

  const { data } = await query;
  const vehicles = (data ?? []) as unknown as (Vehicle & { profiles?: { display_name?: string; email?: string } | null })[];

  return <VehiculosClient vehicles={vehicles} searchQ={q || ""} />;
}
