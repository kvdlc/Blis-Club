import { createClient } from "@/lib/supabase/server";
import { NutritionHub } from "./NutritionHub";
import type { NutritionRecipe, ToxicFood, DogMetabolicProfile, Dog, DetoxDay, ShoppingListItem } from "@/types/database";

export default async function NutricionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: recipes }, { data: toxicFoods }, { data: dog }, { data: detoxDays }] = await Promise.all([
    supabase.from("nutrition_recipes").select("*").order("category"),
    supabase.from("toxic_foods").select("*").order("name"),
    supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single(),
    supabase.from("detox_days").select("*").order("day_number"),
  ]);

  let metabolicProfile: DogMetabolicProfile | null = null;
  let detoxProgress: { day_number: number; completed: boolean }[] = [];
  let shoppingList: ShoppingListItem[] = [];

  if ((dog as Dog | null)?.id) {
    const dogId = (dog as Dog).id;
    const [mpRes, dpRes, slRes] = await Promise.all([
      supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", dogId).maybeSingle(),
      supabase.from("detox_progress").select("day_number, completed").eq("dog_id", dogId),
      supabase.from("shopping_list").select("*").eq("user_id", user.id).order("checked"),
    ]);
    metabolicProfile = mpRes.data as DogMetabolicProfile | null;
    detoxProgress = (dpRes.data as { day_number: number; completed: boolean }[] | null) ?? [];
    shoppingList = (slRes.data as ShoppingListItem[] | null) ?? [];
  }

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
    />
  );
}
