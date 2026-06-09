import { createClient } from "@/lib/supabase/server";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile, RecipeStep, RecipeNutritionFacts } from "@/types/database";
import { RecipeDetailClient } from "./RecipeDetailClient";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCachedDog, getCachedMetabolicProfile, getCachedMealSlots, getCachedWeightLatest } from "@/lib/data-cache";

export default async function RecipeDetailPage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;

  const [{ data: recipe }, { data: ingredients }, { data: steps }, { data: nutritionFacts }] = await Promise.all([
    supabase.from("nutrition_recipes").select("*").eq("id", recipeId).single(),
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipeId).order("step_number", { ascending: true }),
    supabase.from("recipe_nutrition_facts").select("*").eq("recipe_id", recipeId).maybeSingle(),
  ]);

  if (!recipe) notFound();

  let dog: Dog | null = null;
  let metabolicProfile: DogMetabolicProfile | null = null;
  let dogSlots: any[] = [];
  let latestWeightKg: number | undefined;

  const dogId = savedDogId;
  if (dogId) {
    const [dogRes, mpRes, slotsRes, weightData] = await Promise.all([
      getCachedDog(dogId, user.id),
      getCachedMetabolicProfile(dogId),
      getCachedMealSlots(dogId),
      getCachedWeightLatest(dogId),
    ]);
    dog = dogRes as Dog | null;
    metabolicProfile = mpRes as DogMetabolicProfile | null;
    dogSlots = slotsRes as any[];
    latestWeightKg = weightData ?? undefined;
  } else {
    const { data: fallbackDog } = await supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single();
    dog = fallbackDog as Dog | null;
    if (dog?.id) {
      const [mpRes, slotsRes, weightData] = await Promise.all([
        getCachedMetabolicProfile(dog.id),
        getCachedMealSlots(dog.id),
        getCachedWeightLatest(dog.id),
      ]);
      metabolicProfile = mpRes as DogMetabolicProfile | null;
      dogSlots = slotsRes as any[];
      latestWeightKg = weightData ?? undefined;
    }
  }

  return (
    <RecipeDetailClient
      recipe={recipe as NutritionRecipe}
      ingredients={(ingredients as RecipeIngredient[] | null) ?? []}
      steps={(steps as RecipeStep[] | null) ?? []}
      nutritionFacts={(nutritionFacts as RecipeNutritionFacts | null) ?? null}
      dog={dog as Dog | null}
      metabolicProfile={metabolicProfile}
      userId={user.id}
      initialSlots={dogSlots}
      latestWeightKg={latestWeightKg}
    />
  );
}
