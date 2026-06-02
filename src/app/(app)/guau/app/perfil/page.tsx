import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { ProfileClient } from "./ProfileClient";
import type { Dog, UserBadge, Badge, WeeklyChallenge, UserChallenge, DogMetabolicProfile, Subscription, Plan, DogMealSlot, Profile } from "@/types/database";
import { generateReferralCode } from "@/lib/referrals";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");

  const [
    { data: profile },
    { data: dogs },
    { data: userBadges },
    { data: challenges },
    { data: userChallengesData },
    { data: subscription },
    { data: rewards },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("dogs").select("*").eq("owner_id", user.id),
    supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id),
    supabase.from("weekly_challenges").select("*").order("fecha_inicio", { ascending: false }).limit(5),
    supabase.from("user_challenges").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*, plans(*)").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_rewards").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  let metabolicProfiles: DogMetabolicProfile[] = [];
  let mealSlots: DogMealSlot[] = [];
  if (dogs) {
    const dogIds = (dogs as Dog[]).map((d) => d.id);
    if (dogIds.length > 0) {
      const [{ data: mp }, { data: slots }] = await Promise.all([
        supabase.from("dog_metabolic_profiles").select("*").in("dog_id", dogIds),
        supabase.from("dog_meal_slots").select("*").in("dog_id", dogIds).order("slot_index", { ascending: true }),
      ]);
      metabolicProfiles = (mp as DogMetabolicProfile[] | null) ?? [];
      mealSlots = (slots as DogMealSlot[] | null) ?? [];
    }
  }

  // Días restantes del trial
  const daysLeft = trial.status === "trialing" ? trial.daysLeft : 0;

  // Crear billetera por defecto si no existe
  let userRewards = rewards;
  if (!userRewards) {
    const { data: created } = await supabase
      .from("user_rewards")
      .insert({ user_id: user.id, default_reward_mode: "time" })
      .select()
      .single();
    userRewards = created;
  }

  const referralCode = generateReferralCode(user.id);

  return (
    <ProfileClient
      profile={profile as Profile | null}
      dogs={(dogs as Dog[] | null) ?? []}
      metabolicProfiles={metabolicProfiles}
      userBadges={(userBadges as Array<UserBadge & { badges: Badge }> | null) ?? []}
      challenges={(challenges as WeeklyChallenge[] | null) ?? []}
      userChallenges={(userChallengesData as UserChallenge[] | null) ?? []}
      subscription={subscription as (Subscription & { plans: Plan }) | null}
      userId={user.id}
      daysLeft={daysLeft}
      referralCode={referralCode}
      rewards={userRewards as any}
    />
  );
}
