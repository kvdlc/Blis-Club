import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import { NutritionHub } from "./NutritionHub";
import type { NutritionRecipe, ToxicFood, DogMetabolicProfile, Dog, DetoxDay, ShoppingListItem, DogMealSlot, MealSchedule, Walk } from "@/types/database";

export default async function NutricionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const [{ data: recipes }, { data: toxicFoods }, { data: dog }, { data: detoxDays }] = await Promise.all([
    supabase.from("nutrition_recipes").select("*").order("category"),
    supabase.from("toxic_foods").select("*").order("name"),
    savedDogId
      ? supabase.from("dogs").select("*").eq("id", savedDogId).eq("owner_id", user.id).single()
      : supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single(),
    supabase.from("detox_days").select("*").order("day_number"),
  ]);

  let metabolicProfile: DogMetabolicProfile | null = null;
  let detoxProgress: { day_number: number; completed: boolean }[] = [];
  let shoppingList: ShoppingListItem[] = [];
  let mealSlots: DogMealSlot[] = [];
  let mealSchedule: (MealSchedule & { recipe: NutritionRecipe | null })[] = [];
  let walks: Walk[] = [];

  if ((dog as Dog | null)?.id) {
    const dogId = (dog as Dog).id;
    const [mpRes, dpRes, slRes, slotsRes, schedRes, walksRes] = await Promise.all([
      supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", dogId).maybeSingle(),
      supabase.from("detox_progress").select("day_number, completed").eq("dog_id", dogId),
      supabase.from("shopping_list").select("*").eq("user_id", user.id).order("checked"),
      supabase.from("dog_meal_slots").select("*").eq("dog_id", dogId).order("slot_index", { ascending: true }),
      supabase.from("meal_schedule").select("*, recipe:nutrition_recipes(*)").eq("dog_id", dogId).order("fecha", { ascending: true }),
      supabase.from("walks").select("*").eq("dog_id", dogId).order("start_time", { ascending: false }).limit(30),
    ]);
    metabolicProfile = mpRes.data as DogMetabolicProfile | null;
    detoxProgress = (dpRes.data as { day_number: number; completed: boolean }[] | null) ?? [];
    shoppingList = (slRes.data as ShoppingListItem[] | null) ?? [];
    mealSlots = (slotsRes.data as DogMealSlot[] | null) ?? [];
    mealSchedule = (schedRes.data as (MealSchedule & { recipe: NutritionRecipe | null })[] | null) ?? [];
    walks = (walksRes.data as Walk[] | null) ?? [];
  }

  const greenCount = walks.filter((w) => w.traffic_light === "green").length;

  const validTabs = ["recetario", "calculadora", "detox", "escaner", "lista"] as const;
  const initialTab = tab && validTabs.includes(tab as typeof validTabs[number]) ? (tab as typeof validTabs[number]) : undefined;

  return (
    <NutritionHub
      initialRecipes={(recipes as NutritionRecipe[] | null) ?? []}
      toxicFoods={(toxicFoods as ToxicFood[] | null) ?? []}
      dog={dog as Dog | null}
      metabolicProfile={metabolicProfile}
      detoxDays={(detoxDays as DetoxDay[] | null) ?? []}
      detoxProgress={detoxProgress}
      shoppingList={shoppingList}
      userId={user.id}
      mealSlots={mealSlots}
      mealSchedule={mealSchedule}
      walks={walks}
      greenCount={greenCount}
      initialTab={initialTab}
    />
  );
}
