import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { rendimientoPromedio } from "@/lib/insights";
import type { FuelLog, Vehicle, VehicleSpecs } from "@/types/database";

export const GAL = 3.78541;

export interface ToolVehicleData {
  vehicle: Vehicle | null;
  specs: VehicleSpecs | null;
  fuelLogs: FuelLog[];
  capacidadTanque: number | null;
  rendimientoPromedio: number | null;
  ultimoPrecio: number | null;
  ultimoPrecioPorTipo: Record<string, number>;
  precioVehiculo: number | null;
  anios: number | null;
  kmAnuales: number | null;
  octanajeRecomendado: string | null;
  presionDelante: number | null;
  presionAtras: number | null;
  presionRepuesto: number | null;
  llantaAncho: number | null;
  llantaPerfil: number | null;
  llantaRin: number | null;
  capacidadAceiteLitros: number | null;
}

/** Lee el vehículo activo (cookie blis_current_car) y su specs + fuel_logs para precargar herramientas. */
export async function getActiveVehicleToolData(): Promise<ToolVehicleData> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;

  const empty: ToolVehicleData = {
    vehicle: null, specs: null, fuelLogs: [], capacidadTanque: null,
    rendimientoPromedio: null, ultimoPrecio: null, ultimoPrecioPorTipo: {},
    precioVehiculo: null, anios: null, kmAnuales: null, octanajeRecomendado: null,
    presionDelante: null, presionAtras: null, presionRepuesto: null,
    llantaAncho: null, llantaPerfil: null, llantaRin: null, capacidadAceiteLitros: null,
  };
  if (!carId) return empty;

  const [veh, spec, fuel] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", carId).single(),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", carId).maybeSingle(),
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(60),
  ]);

  const vehicle = (veh.data as Vehicle | null) ?? null;
  const specs = (spec.data as VehicleSpecs | null) ?? null;
  const fuelLogs = (fuel.data as FuelLog[] | null) ?? [];

  // Último precio por tipo de combustible (de la carga más reciente de cada tipo)
  const ultimoPrecioPorTipo: Record<string, number> = {};
  for (const f of [...fuelLogs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())) {
    const tipo = f.tipo_combustible || "regular";
    if (ultimoPrecioPorTipo[tipo] == null) ultimoPrecioPorTipo[tipo] = f.precio_por_galon;
  }

  const anios = vehicle?.año ? Math.max(1, new Date().getFullYear() - vehicle.año) : null;

  return {
    vehicle,
    specs,
    fuelLogs,
    capacidadTanque: specs?.capacidad_tanque_galones ?? null,
    rendimientoPromedio: rendimientoPromedio(fuelLogs),
    ultimoPrecio: ultimoPrecioPorTipo["regular"] ?? ultimoPrecioPorTipo[Object.keys(ultimoPrecioPorTipo)[0]] ?? null,
    ultimoPrecioPorTipo,
    precioVehiculo: vehicle?.precio != null ? Number(vehicle.precio) : null,
    anios,
    kmAnuales: specs?.km_anuales ?? null,
    octanajeRecomendado: specs?.octanaje_recomendado ?? null,
    presionDelante: specs?.presion_neumaticos_delante ?? null,
    presionAtras: specs?.presion_neumaticos_atras ?? null,
    presionRepuesto: specs?.presion_neumaticos_repuesto ?? null,
    llantaAncho: specs?.llanta_ancho ?? null,
    llantaPerfil: specs?.llanta_perfil ?? null,
    llantaRin: specs?.llanta_rin ?? null,
    capacidadAceiteLitros: specs?.capacidad_aceite_litros ?? null,
  };
}
