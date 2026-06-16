import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Vehicle, FuelLog, MaintenanceLog, VehicleUpgrade } from "@/types/database";
import BitacoraClient from "./BitacoraClient";

async function getBitacoraData(userId: string, carId: string | null) {
  const supabase = await createClient();
  if (!carId) {
    const fallback = await supabase
      .from("vehicles").select("id").eq("owner_id", userId).order("created_at").limit(1).single();
    carId = (fallback.data as { id: string } | null)?.id ?? null;
  }
  if (!carId) return { vehicle: null, fuelLogs: [], maintenances: [], upgrades: [] };

  const [vehRes, fuelRes, maintRes, upgRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", carId).single(),
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(50),
    supabase.from("maintenance_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(50),
    supabase.from("vehicle_upgrades").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }),
  ]);

  return {
    vehicle: vehRes.data as Vehicle | null,
    fuelLogs: (fuelRes.data as FuelLog[] | null) ?? [],
    maintenances: (maintRes.data as MaintenanceLog[] | null) ?? [],
    upgrades: (upgRes.data as VehicleUpgrade[] | null) ?? [],
  };
}

export default async function BitacoraPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  const data = await getBitacoraData(user.id, carId);

  return <BitacoraClient key={data.vehicle?.id || "no-veh"} userId={user.id} {...data} />;
}
