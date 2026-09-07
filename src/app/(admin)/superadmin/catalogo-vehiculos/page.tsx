import { createServiceClient } from "@/lib/supabase/service";
import CatalogoVehiculosClient from "./CatalogoVehiculosClient";

export default async function CatalogoVehiculosPage() {
  const supabase = createServiceClient();

  const { data: makes } = await supabase
    .from("vehicle_catalog_makes")
    .select("*, models:vehicle_catalog_models(id, nombre, slug, tipo_vehiculo)")
    .order("nombre");

  const { data: specs } = await supabase
    .from("vehicle_catalog_specs")
    .select("*, model:vehicle_catalog_models(nombre, slug, make_id)")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: corrections } = await supabase
    .from("spec_corrections")
    .select("*, model:vehicle_catalog_specs(model:vehicle_catalog_models(nombre))")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  return <CatalogoVehiculosClient makes={makes ?? []} specs={specs ?? []} corrections={corrections ?? []} />;
}
