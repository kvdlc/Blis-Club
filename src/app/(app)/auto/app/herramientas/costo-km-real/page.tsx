import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import { createClient } from "@/lib/supabase/server";
import type { MaintenanceLog } from "@/types/database";
import CostoKmRealClient from "./CostoKmRealClient";

export default async function CostoKmRealPage() {
  const d = await getActiveVehicleToolData();
  let maintenances: MaintenanceLog[] = [];
  if (d.vehicle) {
    const supabase = await createClient();
    const { data } = await supabase.from("maintenance_logs").select("*").eq("vehicle_id", d.vehicle.id);
    maintenances = (data as MaintenanceLog[] | null) ?? [];
  }

  const defaults = {
    fuelLogs: d.fuelLogs,
    maintenances,
    specs: d.specs,
    precioVehiculo: d.precioVehiculo,
    kmAnualesSpec: d.kmAnuales,
    anios: d.anios ?? 1,
  };

  return <CostoKmRealClient defaults={defaults} />;
}
