import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "./ProfileClient";
import type { Dog, UserBadge, Badge, WeeklyChallenge, UserChallenge, DogMetabolicProfile, Subscription, Plan } from "@/types/database";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    { data: profile },
    { data: dogs },
    { data: userBadges },
    { data: challenges },
    { data: userChallengesData },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("dogs").select("*").eq("owner_id", user.id),
    supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id),
    supabase.from("weekly_challenges").select("*").order("fecha_inicio", { ascending: false }).limit(5),
    supabase.from("user_challenges").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*, plans(*)").eq("user_id", user.id).maybeSingle(),
  ]);

  let metabolicProfiles: DogMetabolicProfile[] = [];
  if (dogs) {
    const dogIds = (dogs as Dog[]).map((d) => d.id);
    if (dogIds.length > 0) {
      const { data: mp } = await supabase.from("dog_metabolic_profiles").select("*").in("dog_id", dogIds);
      metabolicProfiles = (mp as DogMetabolicProfile[] | null) ?? [];
    }
  }

  return (
    <ProfileClient
      profile={profile as { id: string; email: string; display_name: string | null; avatar_url: string | null } | null}
      dogs={(dogs as Dog[] | null) ?? []}
      metabolicProfiles={metabolicProfiles}
      userBadges={(userBadges as Array<UserBadge & { badges: Badge }> | null) ?? []}
      challenges={(challenges as WeeklyChallenge[] | null) ?? []}
      userChallenges={(userChallengesData as UserChallenge[] | null) ?? []}
      subscription={subscription as (Subscription & { plans: Plan }) | null}
      userId={user.id}
    />
  );
}
