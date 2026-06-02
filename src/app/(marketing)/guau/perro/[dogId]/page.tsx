import { createServiceClient } from "@/lib/supabase/service";
import { headers } from "next/headers";
import PublicProfileClient from "./PublicProfileClient";
import { PawPrint } from "lucide-react";

interface PublicDog {
  id: string;
  nombre: string;
  raza: string;
  edad_meses: number;
  peso_kg: number;
  foto_url: string | null;
  breed_image_url: string | null;
  is_lost: boolean;
  lost_since: string | null;
  lost_location: string | null;
  lost_notes: string | null;
  poster_title: string | null;
  poster_photo_url: string | null;
  poster_contact: string | null;
  poster_reward_amount: string | null;
}

async function getPublicDog(dogId: string): Promise<PublicDog | null> {
  const supabase = createServiceClient();
  const { data: dog } = await supabase
    .from("dogs")
    .select("id, nombre, raza, edad_meses, peso_kg, foto_url, breed_image_url, is_lost, lost_since, lost_location, lost_notes, poster_title, poster_photo_url, poster_contact, poster_reward_amount")
    .eq("id", dogId)
    .single();
  if (!dog) return null;

  const { data: breedImg } = await supabase
    .from("breed_images")
    .select("image_url")
    .eq("breed_name", (dog as PublicDog).raza)
    .limit(1)
    .single();

  return {
    ...(dog as PublicDog),
    breed_image_url: (breedImg as { image_url: string } | null)?.image_url ?? null,
  };
}

export default async function PublicDogProfile({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;
  const dog = await getPublicDog(dogId);

  if (!dog) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-primary-50 dark:bg-primary-950 flex items-center justify-center mx-auto shadow-lg">
            <PawPrint className="w-12 h-12 text-primary-300 dark:text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-600 dark:text-zinc-300">Perro no encontrado</h1>
          <p className="text-zinc-400 text-sm">El perfil que buscas no existe o fue eliminado.</p>
        </div>
      </div>
    );
  }

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const forwardedProto = h.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0] : "http";
  const shareUrl = `${protocol}://${host}/guau/perro/${dog.id}`;

  return <PublicProfileClient dog={dog} shareUrl={shareUrl} />;
}
