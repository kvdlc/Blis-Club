import { createClient } from "@/lib/supabase/server";
import { WebGratisClient } from "./WebGratisClient";

export default async function WebGratisPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("price_cents", { ascending: true });

  return <WebGratisClient plans={(plans ?? []) as any[]} />;
}
