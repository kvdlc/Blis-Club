import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewVehicleClient from "./NewVehicleClient";

export default async function NewVehiclePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return <NewVehicleClient userId={user.id} />;
}
