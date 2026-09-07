import { createClient } from "@/lib/supabase/client";
import type { CatalogMake, CatalogModel, CatalogSpec, VehicleSpecs } from "@/types/database";

const LITROS_POR_GALON = 3.78541;

/** Buscar marcas por texto (autocompletado). Query vacío = todas. */
export async function searchMakes(query: string): Promise<CatalogMake[]> {
  const supabase = createClient();
  let q = supabase.from("vehicle_catalog_makes").select("*").order("nombre");
  if (query.trim()) q = q.ilike("nombre", `${query}%`);
  const { data } = await q.limit(query.trim() ? 8 : 100);
  return (data as CatalogMake[] | null) ?? [];
}

/** Buscar modelos de una marca (autocompletado). */
export async function searchModels(makeId: string, query: string): Promise<CatalogModel[]> {
  const supabase = createClient();
  let q = supabase
    .from("vehicle_catalog_models")
    .select("*")
    .eq("make_id", makeId)
    .order("nombre")
    .limit(12);
  if (query.trim()) q = q.ilike("nombre", `%${query}%`);
  const { data } = await q;
  return (data as CatalogModel[] | null) ?? [];
}

/** Obtener versiones (specs) de un modelo. */
export async function getModelSpecs(modelId: string): Promise<CatalogSpec[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicle_catalog_specs")
    .select("*")
    .eq("model_id", modelId)
    .order("año", { ascending: false });
  return (data as CatalogSpec[] | null) ?? [];
}

/** Obtener una spec por id. */
export async function getCatalogSpec(specId: string): Promise<CatalogSpec | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicle_catalog_specs")
    .select("*")
    .eq("id", specId)
    .single();
  return (data as CatalogSpec | null) ?? null;
}

/** Convertir litros de tanque del catálogo a galones (campo actual de vehicle_specs). */
export function litrosAGalones(litros: number | null): number | null {
  if (litros == null) return null;
  return Math.round((litros / LITROS_POR_GALON) * 10) / 10;
}

/** Convertir un CatalogSpec a la forma de vehicle_specs (para auto-llenar). */
export function catalogSpecToVehicleSpecs(spec: CatalogSpec): Partial<VehicleSpecs> {
  return {
    viscosidad_aceite: spec.aceite_viscosidad,
    capacidad_aceite_litros: spec.aceite_capacidad_l,
    tipo_refrigerante: spec.refrigerante_tipo,
    capacidad_refrigerante_litros: spec.refrigerante_capacidad_l,
    tipo_freno: spec.freno_tipo,
    presion_neumaticos_delante: spec.psi_delante,
    presion_neumaticos_atras: spec.psi_atras,
    presion_neumaticos_repuesto: spec.psi_repuesto,
    capacidad_tanque_galones: litrosAGalones(spec.capacidad_tanque_l),
    octanaje_recomendado: spec.octanaje_sugerido,
  };
}

export interface SpecCorrection {
  campo: string;
  valor_catalogo: string | null;
  valor_usuario: string | null;
}

/** Compara las specs del usuario con las del catálogo y devuelve las diferencias. */
export function diffSpecsWithCatalog(userSpecs: Partial<VehicleSpecs>, cat: CatalogSpec): SpecCorrection[] {
  const correcciones: SpecCorrection[] = [];
  const tanqueGal = litrosAGalones(cat.capacidad_tanque_l);

  const pairs: { campo: keyof VehicleSpecs; cat: string | number | null; user: string | number | null | undefined }[] = [
    { campo: "viscosidad_aceite", cat: cat.aceite_viscosidad, user: userSpecs.viscosidad_aceite },
    { campo: "capacidad_aceite_litros", cat: cat.aceite_capacidad_l, user: userSpecs.capacidad_aceite_litros },
    { campo: "tipo_refrigerante", cat: cat.refrigerante_tipo, user: userSpecs.tipo_refrigerante },
    { campo: "capacidad_refrigerante_litros", cat: cat.refrigerante_capacidad_l, user: userSpecs.capacidad_refrigerante_litros },
    { campo: "tipo_freno", cat: cat.freno_tipo, user: userSpecs.tipo_freno },
    { campo: "presion_neumaticos_delante", cat: cat.psi_delante, user: userSpecs.presion_neumaticos_delante },
    { campo: "presion_neumaticos_atras", cat: cat.psi_atras, user: userSpecs.presion_neumaticos_atras },
    { campo: "presion_neumaticos_repuesto", cat: cat.psi_repuesto, user: userSpecs.presion_neumaticos_repuesto },
    { campo: "capacidad_tanque_galones", cat: tanqueGal, user: userSpecs.capacidad_tanque_galones },
    { campo: "octanaje_recomendado", cat: cat.octanaje_sugerido, user: userSpecs.octanaje_recomendado },
  ];

  for (const p of pairs) {
    const userVal = p.user == null || p.user === "" ? null : String(p.user);
    const catVal = p.cat == null || p.cat === "" ? null : String(p.cat);
    // Solo registra si el usuario puso un valor y difiere del catálogo
    if (userVal != null && userVal !== catVal) {
      correcciones.push({ campo: p.campo, valor_catalogo: catVal, valor_usuario: userVal });
    }
  }
  return correcciones;
}

/** Mapea un campo de vehicle_specs a su equivalente en el catálogo. */
export function correctionToCatalogField(campo: string, valor: string | null): { field: string; value: string | number | null } | null {
  switch (campo) {
    case "viscosidad_aceite": return { field: "aceite_viscosidad", value: valor };
    case "capacidad_aceite_litros": return { field: "aceite_capacidad_l", value: valor ? parseFloat(valor) : null };
    case "tipo_refrigerante": return { field: "refrigerante_tipo", value: valor };
    case "capacidad_refrigerante_litros": return { field: "refrigerante_capacidad_l", value: valor ? parseFloat(valor) : null };
    case "tipo_freno": return { field: "freno_tipo", value: valor };
    case "presion_neumaticos_delante": return { field: "psi_delante", value: valor ? parseInt(valor) : null };
    case "presion_neumaticos_atras": return { field: "psi_atras", value: valor ? parseInt(valor) : null };
    case "presion_neumaticos_repuesto": return { field: "psi_repuesto", value: valor ? parseInt(valor) : null };
    case "capacidad_tanque_galones": return { field: "capacidad_tanque_l", value: valor ? Math.round(parseFloat(valor) * LITROS_POR_GALON * 10) / 10 : null };
    case "octanaje_recomendado": return { field: "octanaje_sugerido", value: valor };
    default: return null;
  }
}
