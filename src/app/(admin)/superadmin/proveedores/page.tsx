import { createServiceClient } from "@/lib/supabase/service";
import ProveedoresClient from "./ProveedoresClient";

export default async function ProveedoresPage() {
  const supabase = createServiceClient();
  const { data } = await supabase.from("providers").select("*").order("nombre");

  return <ProveedoresClient initial={data ?? []} />;
}
