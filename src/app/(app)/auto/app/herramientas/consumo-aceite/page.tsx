import { getActiveVehicleToolData } from "@/lib/auto-tool-data";
import { createClient } from "@/lib/supabase/server";
import ConsumoAceiteClient from "./ConsumoAceiteClient";

export default async function ConsumoAceitePage() {
  const d = await getActiveVehicleToolData();
  let kmUltimoCambio: number | null = null;
  if (d.vehicle) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("maintenance_logs")
      .select("odometro")
      .eq("vehicle_id", d.vehicle.id)
      .eq("tipo", "cambio_aceite")
      .order("fecha", { ascending: false })
      .limit(1)
      .single();
    kmUltimoCambio = (data as { odometro: number | null } | null)?.odometro ?? null;
  }

  return (
    <ConsumoAceiteClient
      defaults={{
        kmActual: d.vehicle?.kilometraje ?? null,
        kmUltimoCambio,
        capacidadAceiteLitros: d.capacidadAceiteLitros,
        marca: d.vehicle ? `${d.vehicle.marca} ${d.vehicle.modelo}` : null,
      }}
    />
  );
}
