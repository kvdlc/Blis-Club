import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import type { Dog, Walk, DogVaccine, DogMedication, DogMedicationLog } from "@/types/database";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import AppShell from "./AppShell";
import { getCachedDog, getCachedMetabolicProfile, getCachedWalks } from "@/lib/data-cache";

async function getDashboardData(userId: string, dogId: string | null) {
  const supabase = await createClient();
  if (!dogId) {
    const fallback = await supabase.from("dogs").select("id").eq("owner_id", userId).limit(1).single();
    dogId = (fallback.data as { id: string } | null)?.id ?? null;
  }
  if (!dogId) return { dog: null, walks: [], breedImg: null, vaccines: [], metabolicProfile: null, mealSchedule: [], activeMeds: [], medLogs: [] };

  const [dogRes, walksRes, vaccinesRes, profileRes, schedRes] = await Promise.all([
    getCachedDog(dogId, userId),
    getCachedWalks(dogId),
    supabase.from("dog_vaccines").select("*").eq("dog_id", dogId).order("created_at", { ascending: false }),
    getCachedMetabolicProfile(dogId),
    supabase.from("meal_schedule").select("*").eq("dog_id", dogId).order("fecha", { ascending: true }),
  ]);

  const dog = dogRes as Dog | null;
  let breedImg: string | null = null;
  if (dog?.raza) {
    const { data: breed } = await supabase.from("breed_images").select("image_url").eq("breed_name", dog.raza).limit(1).single();
    if (breed) breedImg = (breed as { image_url: string } | null)?.image_url ?? null;
    else {
      const { data: breeds } = await supabase.from("breed_images").select("image_url");
      const allBreeds = (breeds as { breed_name?: string; image_url: string }[] | null) ?? [];
      const match = allBreeds.find((b) => b.breed_name?.toLowerCase().includes(dog.raza.toLowerCase()));
      breedImg = match?.image_url ?? null;
    }
  }

  return {
    dog,
    walks: walksRes as Walk[],
    breedImg,
    vaccines: (vaccinesRes.data as DogVaccine[] | null) ?? [],
    metabolicProfile: profileRes,
    mealSchedule: (schedRes.data ?? []) as any[],
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const cookieStore = await cookies();
  const referralCookie = cookieStore.get("blis_referral_code")?.value;
  if (referralCookie) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/referrals/claim`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch {}
  }

  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;
  const { dog, walks, breedImg, vaccines, metabolicProfile, mealSchedule } = await getDashboardData(user.id, savedDogId);

  const { data: profile } = await supabase.from("profiles").select("has_seen_tutorial").eq("id", user.id).single();

  // Medicamentos para widget
  let activeMeds: DogMedication[] = [];
  let medLogs: DogMedicationLog[] = [];
  if (dog?.id) {
    const [{ data: medsData }, { data: logsData }] = await Promise.all([
      supabase.from("dog_medications").select("*").eq("dog_id", dog.id).eq("status", "active"),
      supabase.from("dog_medication_logs").select("*").in("medication_id", ((await supabase.from("dog_medications").select("id").eq("dog_id", dog.id)).data?.map((m: any) => m.id) ?? ["none"])).order("scheduled_time", { ascending: false }).limit(100),
    ]);
    activeMeds = (medsData as DogMedication[] | null) ?? [];
    medLogs = (logsData as DogMedicationLog[] | null) ?? [];
  }

  const totalWalks = (walks || []).length || 1;
  const greenCount = (walks || []).filter((w: Walk) => w.traffic_light === "green").length;
  const greenPct = Math.round((greenCount / totalWalks) * 100);

  const todayStr = new Date().toISOString().slice(0, 10);
  const gramsEaten = (mealSchedule as any[]).filter((s: any) => typeof s.fecha === "string" && s.fecha.startsWith(todayStr) && s.status === "fed").reduce((sum: number, s: any) => sum + (s.gramos ?? 0), 0);
  const feedingPct = (metabolicProfile as any)?.feeding_pct ?? 2.5;
  const gramsTarget = Math.round((dog?.peso_kg ?? 0) * 1000 * (feedingPct / 100));

  const academyPct = 0, academyCompleted = 0, academyTotal = 1;

  const breedImgRaw = breedImg ? breedImg.replace(/ /g, "%20") : null;
  const initialTab = (["inicio", "nutricion", "academia", "tracker", "perdido", "perfil"].includes(sp.tab || "") ? sp.tab : "inicio") as string;

  const dashboardData = dog ? {
    breedImgRaw,
    academyPct, academyCompleted, academyTotal,
    greenPct,
    yellowPct: 0,
    redPct: 0,
    gramsEaten, gramsTarget,
    vaccines,
    activeMeds, medLogs,
  } : null;

  return (
    <>
      <OnboardingTutorial userId={user.id} hasSeenTutorial={profile?.has_seen_tutorial ?? false} />
      <AppShell
        userId={user.id}
        dog={dog || null}
        initialTab={initialTab as any}
        dashboardData={dashboardData}
      />
    </>
  );
}
