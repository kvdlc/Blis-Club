import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/database";
import EditVehicleClient from "./EditVehicleClient";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", carId)
    .eq("owner_id", user.id)
    .single();

  if (!vehicle) redirect("/auto/app/perfil");

  return <EditVehicleClient userId={user.id} vehicle={vehicle as Vehicle} />;
}
