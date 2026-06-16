import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { FuelLog, VehicleSpecs } from "@/types/database";
import RendimientoClient from "./RendimientoClient";

async function getDefaults(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  if (!carId) return { octanajeRecomendado: null, capacidadTanque: null, ultimosPrecios: null };

  const [specsRes, fuelRes] = await Promise.all([
    supabase.from("vehicle_specs").select("octanaje_recomendado, capacidad_tanque_galones").eq("vehicle_id", carId).maybeSingle(),
    supabase.from("fuel_logs").select("precio_por_galon, tipo_combustible").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(5),
  ]);

  const specs = specsRes.data as VehicleSpecs | null;
  const fuelLogs = (fuelRes.data as Pick<FuelLog, "precio_por_galon" | "tipo_combustible">[] | null) ?? [];

  // Últimos precios por tipo
  const ultimosPrecios: Record<string, number> = {};
  for (const log of fuelLogs) {
    const tipo = log.tipo_combustible || "regular";
    if (!ultimosPrecios[tipo]) ultimosPrecios[tipo] = log.precio_por_galon;
  }

  return {
    octanajeRecomendado: specs?.octanaje_recomendado ?? null,
    capacidadTanque: specs?.capacidad_tanque_galones ?? null,
    ultimosPrecios: Object.keys(ultimosPrecios).length > 0 ? ultimosPrecios : null,
  };
}

export default async function RendimientoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const defaults = user ? await getDefaults(user.id) : { octanajeRecomendado: null, capacidadTanque: null, ultimosPrecios: null };

  return <RendimientoClient defaults={defaults} />;
}
