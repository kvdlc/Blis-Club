import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { FuelLog, VehicleSpecs } from "@/types/database";
import AutonomiaClient from "./AutonomiaClient";

async function getData(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  if (!carId) return { fuelLogs: [] as FuelLog[], capacidadTanque: null as number | null };

  const [fuelRes, specsRes] = await Promise.all([
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(30),
    supabase.from("vehicle_specs").select("capacidad_tanque_galones").eq("vehicle_id", carId).maybeSingle(),
  ]);

  return {
    fuelLogs: (fuelRes.data as FuelLog[] | null) ?? [],
    capacidadTanque: (specsRes.data as VehicleSpecs | null)?.capacidad_tanque_galones ?? null,
  };
}

export default async function AutonomiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const data = user ? await getData(user.id) : { fuelLogs: [], capacidadTanque: null };

  return <AutonomiaClient defaults={data} />;
}
