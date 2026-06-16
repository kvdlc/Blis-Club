import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade, VehicleSpecs } from "@/types/database";
import CarfaxPrintClient from "./CarfaxPrintClient";

async function getCarfaxData(userId: string, carId: string | null) {
  const supabase = await createClient();
  if (!carId) {
    const fallback = await supabase
      .from("vehicles").select("id").eq("owner_id", userId).order("created_at").limit(1).single();
    carId = (fallback.data as { id: string } | null)?.id ?? null;
  }
  if (!carId) return null;

  const [vehRes, fuelRes, maintRes, upgRes, specsRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", carId).single(),
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }),
    supabase.from("maintenance_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }),
    supabase.from("vehicle_upgrades").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", carId).maybeSingle(),
  ]);

  return {
    vehicle: vehRes.data as Vehicle | null,
    fuelLogs: (fuelRes.data as FuelLog[] | null) ?? [],
    maintenances: (maintRes.data as MaintenanceLog[] | null) ?? [],
    upgrades: (upgRes.data as VehicleUpgrade[] | null) ?? [],
    specs: specsRes.data as VehicleSpecs | null,
  };
}

export default async function CarfaxPrintPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p className="p-8 text-center text-zinc-500">No autorizado</p>;

  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  const data = await getCarfaxData(user.id, carId);

  if (!data?.vehicle) return <p className="p-8 text-center text-zinc-500">Vehículo no encontrado</p>;

  return <CarfaxPrintClient {...data} vehicle={data.vehicle} />;
}
