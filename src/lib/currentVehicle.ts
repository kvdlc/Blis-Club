import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resuelve el id del vehículo actual del usuario.
 * - Si viene un carId (de cookie) y pertenece al usuario, lo usa.
 * - Si no existe / no es del usuario / viene vacío, hace fallback al primer vehículo del usuario.
 * Evita el bug de "Registra un vehículo primero" cuando la cookie está obsoleta.
 */
export async function resolveCurrentCarId(
  supabase: SupabaseClient,
  userId: string,
  cookieCarId: string | null,
): Promise<string | null> {
  if (cookieCarId) {
    const { data } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", cookieCarId)
      .eq("owner_id", userId)
      .maybeSingle();
    const id = (data as { id: string } | null)?.id;
    if (id) return id;
  }

  const { data } = await supabase
    .from("vehicles")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}
