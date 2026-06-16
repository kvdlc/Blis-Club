import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { FuelLog, MaintenanceLog, VehicleSpecs } from "@/types/database";
import CostoKmRealClient from "./CostoKmRealClient";

async function getData(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  if (!carId) return { fuelLogs: [], maintenances: [], specs: null, valorCompra: null, anios: null };

  const [fuelRes, maintRes, specsRes, vehRes] = await Promise.all([
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(100),
    supabase.from("maintenance_logs").select("*").eq("vehicle_id", carId),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", carId).maybeSingle(),
    supabase.from("vehicles").select("año, kilometraje").eq("id", carId).single(),
  ]);

  const vehicle = vehRes.data as { año: number; kilometraje: number } | null;
  const anios = vehicle?.año ? new Date().getFullYear() - vehicle.año : null;

  return {
    fuelLogs: (fuelRes.data as FuelLog[] | null) ?? [],
    maintenances: (maintRes.data as MaintenanceLog[] | null) ?? [],
    specs: specsRes.data as VehicleSpecs | null,
    valorCompra: null, // user must input
    anios: anios || 1,
  };
}

export default async function CostoKmRealPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const data = user ? await getData(user.id) : { fuelLogs: [], maintenances: [], specs: null, valorCompra: null, anios: 1 };

  return <CostoKmRealClient defaults={data} />;
}
