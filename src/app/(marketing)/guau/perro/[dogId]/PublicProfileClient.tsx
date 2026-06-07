"use client";

import EmergencyProfile from "./EmergencyProfile";
import DogShowcaseProfile from "./DogShowcaseProfile";
import type { AgilitySession, AgilitySessionObstacle, AgilityObstacle, DogPublicProfile as DogPublicProfileType } from "@/types/database";
import type { DogWeightHistory } from "@/types/database";

interface Dog {
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

interface MetabolicProfile {
  activity_level: string;
  allergies: string[];
  medical_conditions: string[];
  feeding_pct: number;
  diet_type?: string | null;
}

interface Props {
  dog: Dog;
  shareUrl: string;
  agilitySessions: AgilitySession[];
  agilityObstacles: Record<string, (AgilitySessionObstacle & { obstacle: AgilityObstacle })[]>;
  publicProfile: DogPublicProfileType | null;
  metabolicProfile: MetabolicProfile | null;
  weightHistory: DogWeightHistory[];
  vaccines: { vaccine_name: string; dose_number: number; date_administered: string | null; next_due_date: string | null }[];
  userBadges: { badge: { name: string; icon_url: string | null; description: string | null; badge_type: string } }[];
}

export default function PublicProfileClient({ dog, shareUrl, agilitySessions, agilityObstacles, publicProfile, metabolicProfile, weightHistory, vaccines, userBadges }: Props) {
  if (dog.is_lost) {
    return <EmergencyProfile dog={dog} shareUrl={shareUrl} />;
  }

  return (
    <DogShowcaseProfile
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
