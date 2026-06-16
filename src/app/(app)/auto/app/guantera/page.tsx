import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Vehicle, VehicleDocument, VehicleContact, VehicleSpecs } from "@/types/database";
import GuanteraClient from "./GuanteraClient";

async function getGuanteraData(userId: string, carId: string | null) {
  const supabase = await createClient();
  if (!carId) {
    const fallback = await supabase
      .from("vehicles")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    carId = (fallback.data as { id: string } | null)?.id ?? null;
  }
  if (!carId) return { vehicle: null, documents: [], contacts: [], specs: null };

  const [vehRes, docsRes, contactsRes, specsRes] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", carId).single(),
    supabase.from("vehicle_documents").select("*").eq("vehicle_id", carId).order("fecha_vencimiento", { ascending: true }),
    supabase.from("vehicle_contacts").select("*").or(`vehicle_id.eq.${carId},vehicle_id.is.null`).order("tipo"),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", carId).maybeSingle(),
  ]);

  return {
    vehicle: vehRes.data as Vehicle | null,
    documents: (docsRes.data as VehicleDocument[] | null) ?? [],
    contacts: (contactsRes.data as VehicleContact[] | null) ?? [],
    specs: specsRes.data as VehicleSpecs | null,
  };
}

export default async function GuanteraPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const cookieStore = await cookies();
  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  const data = await getGuanteraData(user.id, carId);

  return <GuanteraClient key={data.vehicle?.id || "no-veh"} userId={user.id} {...data} />;
}
