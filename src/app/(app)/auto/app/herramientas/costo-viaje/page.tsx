import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { FuelLog, VehicleSpecs } from "@/types/database";
import CostoViajeClient from "./CostoViajeClient";

async function getDefaults(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;

  if (!carId) return { rendimientoPromedio: null, capacidadTanque: null, ultimoPrecio: null };

  const fallback = await supabase.from("vehicles").select("id").eq("id", carId).maybeSingle();
  if (!fallback.data) return { rendimientoPromedio: null, capacidadTanque: null, ultimoPrecio: null };

  const [fuelRes, specsRes] = await Promise.all([
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(20),
    supabase.from("vehicle_specs").select("capacidad_tanque_galones").eq("vehicle_id", carId).maybeSingle(),
  ]);

  const fuelLogs = (fuelRes.data as FuelLog[] | null) ?? [];
  const specs = specsRes.data as VehicleSpecs | null;

  // Rendimiento promedio
  let rendimientoPromedio: number | null = null;
  if (fuelLogs.length >= 2) {
    const sorted = [...fuelLogs].sort((a, b) => a.odometro - b.odometro);
    let totalKm = 0, totalGal = 0;
    for (let i = 1; i < sorted.length; i++) {
      totalKm += sorted[i].odometro - sorted[i - 1].odometro;
      totalGal += sorted[i].litros / 3.78541;
    }
    if (totalGal > 0) rendimientoPromedio = Math.round(totalKm / totalGal);
  }

  // Último precio por galón
  const ultimoPrecio = fuelLogs.length > 0 ? fuelLogs[0].precio_por_galon : null;

  return {
    rendimientoPromedio,
    capacidadTanque: specs?.capacidad_tanque_galones ?? null,
    ultimoPrecio,
  };
}

export default async function CostoViajePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const defaults = user ? await getDefaults(user.id) : { rendimientoPromedio: null, capacidadTanque: null, ultimoPrecio: null };

  return <CostoViajeClient defaults={defaults} />;
}
