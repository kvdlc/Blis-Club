import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { NutritionHub } from "./NutritionHub";
import type { NutritionRecipe, ToxicFood, DogMetabolicProfile, Dog, DetoxDay, DogMealSlot, MealSchedule, Walk } from "@/types/database";
import {
  getCachedDog, getCachedMetabolicProfile, getCachedMealSlots,
  getCachedRecipes, getCachedWalks, getCachedWeightLatest, getCachedMealSchedule,
  getCachedToxicFoods,
} from "@/lib/data-cache";

export default async function NutricionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // auth handled by layout

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  // Datos compartidos con el layout (cache deduplicado)
  const [recipes, toxicFoods, detoxDaysRes, favRes, hiddenRes, detoxProgressRes] = await Promise.all([
    getCachedRecipes(),
    getCachedToxicFoods(),
    supabase.from("detox_days").select("*").order("day_number"),
    supabase.from("user_favorite_recipes").select("recipe_id").eq("user_id", user.id),
    supabase.from("user_hidden_recipes").select("recipe_id, reason").eq("user_id", user.id),
    savedDogId
      ? supabase.from("detox_progress").select("day_number, completed").eq("dog_id", savedDogId)
      : Promise.resolve({ data: null }),
  ]);

  let dog: Dog | null = null;
  let metabolicProfile: DogMetabolicProfile | null = null;
  let mealSlots: DogMealSlot[] = [];
  let mealSchedule: (MealSchedule & { recipe: NutritionRecipe | null })[] = [];
  let walks: Walk[] = [];
  let latestWeightKg: number | undefined;

  if (savedDogId) {
    const [dogRes, mpRes, slotsRes, schedRes, walksRes, weightKg] = await Promise.all([
      getCachedDog(savedDogId, user.id),
      getCachedMetabolicProfile(savedDogId),
      getCachedMealSlots(savedDogId),
      getCachedMealSchedule(savedDogId),
      getCachedWalks(savedDogId),
      getCachedWeightLatest(savedDogId),
    ]);
    dog = dogRes as Dog | null;
    metabolicProfile = mpRes as DogMetabolicProfile | null;
    mealSlots = slotsRes as DogMealSlot[];
    mealSchedule = schedRes as (MealSchedule & { recipe: NutritionRecipe | null })[];
    walks = walksRes as Walk[];
    latestWeightKg = weightKg ?? undefined;
  } else {
    // Fallback: buscar el primer perro
    const [{ data: fallbackDog }] = await Promise.all([
      supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single(),
    ]);
    if (fallbackDog) {
      const d = fallbackDog as Dog;
      dog = d;
      const [mpRes2, slotsRes2, schedRes2, walksRes2] = await Promise.all([
        getCachedMetabolicProfile(d.id),
        getCachedMealSlots(d.id),
        getCachedMealSchedule(d.id),
        getCachedWalks(d.id),
      ]);
      metabolicProfile = mpRes2 as DogMetabolicProfile | null;
      mealSlots = slotsRes2 as DogMealSlot[];
      mealSchedule = schedRes2 as (MealSchedule & { recipe: NutritionRecipe | null })[];
      walks = walksRes2 as Walk[];
      latestWeightKg = (await getCachedWeightLatest(d.id)) ?? undefined;
    }
  }

  const greenCount = walks.filter((w: Walk) => w.traffic_light === "green").length;
  const detoxDays = (detoxDaysRes.data as DetoxDay[] | null) ?? [];
  const detoxProgress = (detoxProgressRes.data as { day_number: number; completed: boolean }[] | null) ?? [];
  const favoriteIds = new Set((favRes.data ?? []).map((f: any) => f.recipe_id));
  const hiddenMap = new Map((hiddenRes.data ?? []).map((h: any) => [h.recipe_id, h.reason]));
  const validTabs = ["recetario", "plan", "calculadora", "detox", "escaner", "lista"] as const;
  const initialTab = tab && validTabs.includes(tab as typeof validTabs[number]) ? (tab as typeof validTabs[number]) : undefined;

  return (
    <NutritionHub
      initialRecipes={recipes as NutritionRecipe[]}
      toxicFoods={toxicFoods}
      dog={dog}
      metabolicProfile={metabolicProfile}
      detoxDays={detoxDays}
      detoxProgress={detoxProgress}
      userId={user.id}
      mealSlots={mealSlots}
      mealSchedule={mealSchedule}
      walks={walks}
      greenCount={greenCount}
      initialTab={initialTab}
      favoriteRecipeIds={favoriteIds}
      hiddenRecipeIds={hiddenMap}
      latestWeightKg={latestWeightKg}
    />
  );
}
