import { createClient } from "@/lib/supabase/server";
import { PublicProfileConfigClient } from "./PublicProfileConfigClient";
import type { Dog, DogPublicProfile } from "@/types/database";
import { notFound } from "next/navigation";

export default async function PublicProfileConfigPage({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, nombre, owner_id")
    .eq("id", dogId)
    .eq("owner_id", user.id)
    .single();

  if (!dog) notFound();

  const { data: pp } = await supabase
    .from("dog_public_profiles")
    .select("*")
    .eq("dog_id", dogId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", user.id)
    .single();

  return (
    <PublicProfileConfigClient
      dogId={dogId}
      dogName={dog.nombre}
      userId={user.id}
      initialConfig={(pp as DogPublicProfile | null) ?? null}
      ownerWhatsapp={profile?.whatsapp ?? null}
    />
  );
}
