import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { VehicleSpecs } from "@/types/database";
import ChecklistClient from "./ChecklistClient";

async function getDefaults(userId: string) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  if (!carId) return { presionDelante: null, presionAtras: null, presionRepuesto: null };

  const { data } = await supabase
    .from("vehicle_specs")
    .select("presion_neumaticos_delante, presion_neumaticos_atras, presion_neumaticos_repuesto")
    .eq("vehicle_id", carId)
    .maybeSingle();

  const specs = data as Pick<VehicleSpecs, "presion_neumaticos_delante" | "presion_neumaticos_atras" | "presion_neumaticos_repuesto"> | null;

  return {
    presionDelante: specs?.presion_neumaticos_delante ?? null,
    presionAtras: specs?.presion_neumaticos_atras ?? null,
    presionRepuesto: specs?.presion_neumaticos_repuesto ?? null,
  };
}

export default async function ChecklistPreviajePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const defaults = user ? await getDefaults(user.id) : { presionDelante: null, presionAtras: null, presionRepuesto: null };

  return <ChecklistClient defaults={defaults} />;
}
