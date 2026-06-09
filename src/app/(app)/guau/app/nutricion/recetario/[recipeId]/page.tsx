import { createClient } from "@/lib/supabase/server";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile, RecipeStep, RecipeNutritionFacts } from "@/types/database";
import { RecipeDetailClient } from "./RecipeDetailClient";
import { notFound } from "next/navigation";
import { getCachedWeightLatest } from "@/lib/data-cache";

export default async function RecipeDetailPage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: recipe }, { data: ingredients }, { data: steps }, { data: nutritionFacts }, { data: dog }] = await Promise.all([
    supabase.from("nutrition_recipes").select("*").eq("id", recipeId).single(),
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
    supabase.from("recipe_steps").select("*").eq("recipe_id", recipeId).order("step_number", { ascending: true }),
    supabase.from("recipe_nutrition_facts").select("*").eq("recipe_id", recipeId).maybeSingle(),
    supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single(),
  ]);

  if (!recipe) notFound();

  let metabolicProfile: DogMetabolicProfile | null = null;
  let dogSlots: any[] = [];
  let latestWeightKg: number | undefined;
  if ((dog as Dog | null)?.id) {
    const [{ data: mp }, { data: slots }, weightData] = await Promise.all([
      supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", (dog as Dog).id).maybeSingle(),
      supabase.from("dog_meal_slots").select("*").eq("dog_id", (dog as Dog).id).order("slot_index", { ascending: true }),
      getCachedWeightLatest((dog as Dog).id),
    ]);
    metabolicProfile = mp as DogMetabolicProfile | null;
    dogSlots = slots ?? [];
    latestWeightKg = weightData ?? undefined;
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
