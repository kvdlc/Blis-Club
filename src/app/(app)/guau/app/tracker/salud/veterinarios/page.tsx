import { createClient } from "@/lib/supabase/server";
import { VeterinariosClient } from "./VeterinariosClient";
import type { TrustedVet } from "@/types/database";
import { notFound } from "next/navigation";

export default async function VeterinariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: vets } = await supabase.from("trusted_vets").select("*").eq("user_id", user.id).order("name", { ascending: true });

  return (
    <VeterinariosClient
      userId={user.id}
      trustedVets={(vets as TrustedVet[] | null) ?? []}
    />
  );
}
