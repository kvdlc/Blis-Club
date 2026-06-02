import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import type { Dog, Walk, DailyLog, DogMealSlot, MealSchedule, NutritionRecipe, DogMetabolicProfile, Lesson, UserProgress, DogVaccine } from "@/types/database";
import { PawPrint } from "lucide-react";
import { AddDogForm } from "./AddDogForm";
import QuickToolsCarousel from "@/components/QuickToolsCarousel";
import { DashboardWidgets } from "./DashboardWidgets";
import { HeatmapWidget } from "./HeatmapWidget";

async function getDashboardData(userId: string, dogId: string | null) {
  const supabase = await createClient();

  if (!dogId) {
    const fallback = await supabase.from("dogs").select("id").eq("owner_id", userId).limit(1).single();
    dogId = (fallback.data as { id: string } | null)?.id ?? null;
  }

  if (!dogId) {
    return { dog: null, logs: [], walks: [], mealSlots: [], mealSchedule: [], recipes: [], metabolicProfile: null, breedImg: null, lessons: [], progress: [], vaccines: [] };
  }

  const [dogRes, logsRes, walksRes, slotsRes, scheduleRes, recipesRes, profileRes, lessonsRes, progressRes, vaccinesRes] = await Promise.all([
    supabase.from("dogs").select("*").eq("id", dogId).eq("owner_id", userId).single(),
    supabase.from("daily_logs").select("*").order("fecha", { ascending: false }).limit(3),
    supabase.from("walks").select("*").eq("dog_id", dogId).order("start_time", { ascending: false }).limit(30),
    supabase.from("dog_meal_slots").select("*").eq("dog_id", dogId).order("slot_index", { ascending: true }),
    supabase.from("meal_schedule").select("*").eq("dog_id", dogId).order("fecha", { ascending: true }),
    supabase.from("nutrition_recipes").select("*"),
    supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", dogId).single(),
    supabase.from("lessons").select("*").order("order"),
    supabase.from("user_progress").select("*").eq("user_id", userId),
    supabase.from("dog_vaccines").select("*").eq("dog_id", dogId).order("created_at", { ascending: false }),
  ]);

  const dog = dogRes.data as Dog | null;
  let breedImg: string | null = null;
  if (dog?.raza) {
    // Try exact match first, then partial match
    const { data: breed } = await supabase.from("breed_images").select("image_url").eq("breed_name", dog.raza).limit(1).single();
    if (breed) {
      breedImg = (breed as { image_url: string } | null)?.image_url ?? null;
    } else {
      // Fallback: case-insensitive partial match
      const { data: breeds } = await supabase.from("breed_images").select("image_url");
      const allBreeds = (breeds as { breed_name?: string; image_url: string }[] | null) ?? [];
      const match = allBreeds.find((b) => b.breed_name?.toLowerCase().includes(dog.raza.toLowerCase()));
      breedImg = match?.image_url ?? null;
    }
  }

  return {
    dog,
    logs: (logsRes.data as DailyLog[] | null) ?? [],
    walks: (walksRes.data as Walk[] | null) ?? [],
    mealSlots: (slotsRes.data as DogMealSlot[] | null) ?? [],
    mealSchedule: (scheduleRes.data as (MealSchedule & { recipe: NutritionRecipe | null })[] | null) ?? [],
    recipes: (recipesRes.data as NutritionRecipe[] | null) ?? [],
    metabolicProfile: (profileRes.data as DogMetabolicProfile | null) ?? null,
    breedImg,
    lessons: (lessonsRes.data as Lesson[] | null) ?? [],
    progress: (progressRes.data as UserProgress[] | null) ?? [],
    vaccines: (vaccinesRes.data as DogVaccine[] | null) ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Trial check
  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  // Auto-claim referral si hay cookie (discreto, sin mostrar al usuario)
  const cookieStore = await cookies();
  const referralCookie = cookieStore.get("blis_referral_code")?.value;
  if (referralCookie) {
    try {
      // Intentar reclamar el referral silenciosamente
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/referrals/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Silenciar errores
    }
  }

  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const { dog, walks, mealSchedule, metabolicProfile, breedImg, lessons, progress, vaccines } = await getDashboardData(user.id, savedDogId);

  const totalWalks = walks.length || 1;
  const greenCount = walks.filter((w) => w.traffic_light === "green").length;
  const greenPct = Math.round((greenCount / totalWalks) * 100);
  const yellowPct = Math.round((walks.filter((w) => w.traffic_light === "yellow").length / totalWalks) * 100);
  const redPct = Math.round((walks.filter((w) => w.traffic_light === "red").length / totalWalks) * 100);
  const todayWalks = walks.filter((w) => {
    const d = new Date(w.start_time);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  });
  const last7Walks = walks.slice(0, 7).reverse();

  // Academy progress
  const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const academyTotal = lessons.length;
  const academyCompleted = completedLessonIds.size;
  const academyPct = Math.round((academyCompleted / Math.max(academyTotal, 1)) * 100);

  // Grams eaten today
  const todayStr = new Date().toISOString().slice(0, 10);
  const gramsEaten = mealSchedule
    .filter((s) => typeof s.fecha === "string" && s.fecha.startsWith(todayStr) && s.status === "fed")
    .reduce((sum, s) => sum + (s.gramos ?? 0), 0);
  const feedingPct = metabolicProfile?.feeding_pct ?? 2.5;
  const gramsTarget = Math.round((dog?.peso_kg ?? 0) * 1000 * (feedingPct / 100));

  // Vaccine progress handled client-side in DashboardWidgets

  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center">
          <PawPrint className="w-12 h-12 text-primary-400 dark:text-primary-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
            ¡Bienvenido a Blis Club!
          </h2>
          <p className="text-zinc-500 mt-2 max-w-sm text-sm leading-relaxed">
            Registra tu primer perro para empezar a usar la calculadora de nutrición, el tracker de paseos y la academia de entrenamiento.
          </p>
        </div>
        <AddDogForm userId={user.id} />
      </div>
    );
  }

  const breedImgRaw = breedImg ? breedImg.replace(/ /g, "%20") : null;

  return (
    <div className="space-y-4">

      {/* Dog Hero Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white shadow-lg shadow-primary-600/20">
        <div className="relative z-10 flex gap-4">
          <div className="w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border-2 border-white/20 overflow-hidden shrink-0 self-stretch">
            <img src={dog.foto_url || breedImgRaw || "/icons/dog-default.png"} alt={dog.nombre} className="w-full h-full object-cover object-center" />
          </div>
          <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{dog.nombre}</h2>
              {dog.objetivo_principal && (
                <span className="text-[10px] font-semibold bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full shrink-0">
                  {dog.objetivo_principal}
                </span>
              )}
            </div>
            <div className="mt-2.5 space-y-1.5">
              <p className="text-white/85 text-sm flex items-center gap-2">🐾 {dog.raza}</p>
              <p className="text-white/85 text-sm flex items-center gap-2">🎂 {dog.edad_meses} meses</p>
              <p className="text-white/85 text-sm flex items-center gap-2">⚖️ {dog.peso_kg} kg</p>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/8 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/8 rounded-full" />
      </div>

      {/* Quick Tools Carousel */}
      <QuickToolsCarousel isLost={(dog as { is_lost?: boolean }).is_lost === true} />

      {/* Dashboard Widgets */}
      <DashboardWidgets
        academyPct={academyPct}
        academyCompleted={academyCompleted}
        academyTotal={academyTotal}
        greenPct={greenPct}
        yellowPct={yellowPct}
        redPct={redPct}
        gramsEaten={gramsEaten}
        gramsTarget={gramsTarget}
        vaccines={vaccines}
      />

      {/* Mini Heatmap */}
      {last7Walks.length > 0 && (
        <HeatmapWidget walks={walks} greenPct={greenPct} todayWalks={todayWalks.length} />
      )}

    </div>
  );
}
