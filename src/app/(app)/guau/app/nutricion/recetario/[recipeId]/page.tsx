import { createClient } from "@/lib/supabase/server";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile } from "@/types/database";
import { RecipeDetailClient } from "./RecipeDetailClient";
import { notFound } from "next/navigation";

export default async function RecipeDetailPage({ params }: { params: Promise<{ recipeId: string }> }) {
  const { recipeId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: recipe }, { data: ingredients }, { data: dog }] = await Promise.all([
    supabase.from("nutrition_recipes").select("*").eq("id", recipeId).single(),
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
    supabase.from("dogs").select("*").eq("owner_id", user.id).limit(1).single(),
  ]);

  if (!recipe) notFound();

  let metabolicProfile: DogMetabolicProfile | null = null;
  if ((dog as Dog | null)?.id) {
    const { data: mp } = await supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", (dog as Dog).id).maybeSingle();
    metabolicProfile = mp as DogMetabolicProfile | null;
  }

  return (
    <RecipeDetailClient
      recipe={recipe as NutritionRecipe}
      ingredients={(ingredients as RecipeIngredient[] | null) ?? []}
      dog={dog as Dog | null}
      metabolicProfile={metabolicProfile}
      userId={user.id}
    />
  );
}
