import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import { PerdidoClient } from "./PerdidoClient";
import type { Dog } from "@/types/database";

async function getPerdidoData(userId: string, dogId: string | null) {
  const supabase = await createClient();

  if (!dogId) {
    const fallback = await supabase.from("dogs").select("id").eq("owner_id", userId).limit(1).single();
    dogId = (fallback.data as { id: string } | null)?.id ?? null;
  }

  if (!dogId) return { dog: null, latestWeightPhoto: null };

  const [dogRes, weightRes] = await Promise.all([
    supabase.from("dogs").select("*").eq("id", dogId).eq("owner_id", userId).single(),
    supabase.from("dog_weight_history")
      .select("foto_url, fecha")
      .eq("dog_id", dogId)
      .not("foto_url", "is", null)
      .order("fecha", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const dog = dogRes.data as Dog | null;
  const latestWeightPhoto = (weightRes.data as { foto_url: string; fecha: string } | null)?.foto_url ?? null;

  return { dog, latestWeightPhoto };
}

export default async function PerdidoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { dog, latestWeightPhoto } = await getPerdidoData(user.id, savedDogId);

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
        <p className="text-zinc-500">Registra un perro primero para usar esta sección.</p>
      </div>
    );
  }

  return <PerdidoClient dog={dog} latestWeightPhoto={latestWeightPhoto} />;
}
