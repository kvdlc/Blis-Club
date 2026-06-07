import { createServiceClient } from "@/lib/supabase/service";
import { headers } from "next/headers";
import PublicProfileClient from "./PublicProfileClient";
import { PawPrint } from "lucide-react";
import type { AgilitySession, AgilitySessionObstacle, AgilityObstacle, DogPublicProfile, DogWeightHistory } from "@/types/database";

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
  owner_id: string;
}

async function getPublicDog(dogId: string): Promise<PublicDog | null> {
  const supabase = createServiceClient();
  const { data: dog } = await supabase
    .from("dogs")
    .select("id, nombre, raza, edad_meses, peso_kg, foto_url, breed_image_url, is_lost, lost_since, lost_location, lost_notes, poster_title, poster_photo_url, poster_contact, poster_reward_amount, owner_id")
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

async function getDogPublicProfile(dogId: string): Promise<DogPublicProfile | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("dog_public_profiles")
    .select("*")
    .eq("dog_id", dogId)
    .single();
  return (data as DogPublicProfile | null) ?? null;
}

async function getMetabolicProfile(dogId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("dog_metabolic_profiles")
    .select("activity_level, allergies, medical_conditions, feeding_pct, diet_type")
    .eq("dog_id", dogId)
    .single();
  return data;
}

async function getWeightHistory(dogId: string): Promise<DogWeightHistory[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("dog_weight_history")
    .select("*")
    .eq("dog_id", dogId)
    .order("fecha", { ascending: false })
    .limit(30);
  return (data as DogWeightHistory[] | null) ?? [];
}

async function getVaccines(dogId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("dog_vaccines")
    .select("vaccine_name, dose_number, date_administered, next_due_date")
    .eq("dog_id", dogId)
    .order("date_administered", { ascending: false });
  return (data ?? []) as { vaccine_name: string; dose_number: number; date_administered: string | null; next_due_date: string | null }[];
}

async function getUserBadges(ownerId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("user_badges")
    .select("badge:badge_id(name, icon_url, description, badge_type)")
    .eq("user_id", ownerId);
  return (data ?? []) as unknown as { badge: { name: string; icon_url: string | null; description: string | null; badge_type: string } }[];
}

async function getAgilitySessions(dogId: string): Promise<AgilitySession[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("agility_sessions")
    .select("*")
    .eq("dog_id", dogId)
    .order("fecha", { ascending: false })
    .limit(10);
  return (data as AgilitySession[] | null) ?? [];
}

async function getAgilitySessionObstacles(dogId: string): Promise<Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]>> {
  const supabase = createServiceClient();
  const { data: sessions } = await supabase
    .from("agility_sessions")
    .select("id")
    .eq("dog_id", dogId)
    .limit(10);

  const map: Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]> = {};
  if (!sessions) return map;

  for (const s of sessions) {
    const { data } = await supabase
      .from("agility_session_obstacles")
      .select("*, obstacle:obstacle_id(*)")
      .eq("session_id", s.id);
    if (data) {
      map[s.id] = data as (AgilitySessionObstacle & { obstacle: AgilityObstacle })[];
    }
  }
  return map;
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

  const [publicProfile, metabolicProfile, weightHistory, vaccines, userBadges, agilitySessions, agilityObstacles] = await Promise.all([
    getDogPublicProfile(dogId),
    getMetabolicProfile(dogId),
    getWeightHistory(dogId),
    getVaccines(dogId),
    getUserBadges(dog.owner_id),
    getAgilitySessions(dogId),
    getAgilitySessionObstacles(dogId),
  ]);

  return (
    <PublicProfileClient
      dog={dog}
      shareUrl={shareUrl}
      agilitySessions={agilitySessions}
      agilityObstacles={agilityObstacles}
      publicProfile={publicProfile}
      metabolicProfile={metabolicProfile}
      weightHistory={weightHistory}
      vaccines={vaccines}
      userBadges={userBadges}
    />
  );
}
