"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile } from "@/types/database";
import { ChefHat, ShoppingCart, ArrowLeft, Check } from "lucide-react";

interface Props {
  recipe: NutritionRecipe;
  ingredients: RecipeIngredient[];
  dog: Dog | null;
  metabolicProfile: DogMetabolicProfile | null;
  userId: string;
}

const TYPE_LABELS: Record<string, string> = {
  proteina: "Proteína", hueso: "Hueso", viscera: "Víscera", vegetal: "Vegetal", suplemento: "Suplemento", otro: "Otro",
};

const TYPE_COLORS: Record<string, string> = {
  proteina: "border-danger-400", hueso: "border-warning-400", viscera: "border-accent-400", vegetal: "border-secondary-400", suplemento: "border-primary-400", otro: "border-zinc-400",
};

export function RecipeDetailClient({ recipe, ingredients, dog, metabolicProfile, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cooked, setCooked] = useState(false);

  const feedingPct = metabolicProfile?.feeding_pct ?? 2.5;
  const weight = dog?.peso_kg ?? 0;
  const totalGrams = weight * 1000 * (feedingPct / 100);

  const handleAddToCart = async () => {
    if (!dog) return;
    const items = ingredients.map((ing) => ({
      user_id: userId,
      ingredient_name: ing.ingredient_name,
      quantity_g: ing.quantity_per_serving_g,
      checked: false,
      week_start: new Date().toISOString().slice(0, 10),
    }));
    await supabase.from("shopping_list").insert(items);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleCook = async () => {
    if (!dog) return;
    await supabase.from("nutrition_logs").insert({
      dog_id: dog.id,
      recipe_id: recipe.id,
      gramos_servidos: Math.round(totalGrams),
      fecha: new Date().toISOString().slice(0, 10),
    });
    setCooked(true);
    setTimeout(() => setCooked(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Recipe header */}
      <div className={`rounded-3xl p-6 ${recipe.is_therapeutic ? "bg-accent-50 dark:bg-accent-950" : "bg-primary-50 dark:bg-primary-950"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${recipe.is_therapeutic ? "bg-accent-200 dark:bg-accent-800" : "bg-primary-200 dark:bg-primary-800"}`}>
            <ChefHat className={`w-7 h-7 ${recipe.is_therapeutic ? "text-accent-700" : "text-primary-700"}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{recipe.title}</h2>
            {recipe.source_book && <p className="text-xs text-zinc-500">{recipe.source_book}</p>}
          </div>
        </div>
        {recipe.description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{recipe.description}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {recipe.prep_time_min && (
            <span className="text-xs bg-white dark:bg-zinc-900 rounded-full px-2.5 py-1">{recipe.prep_time_min} min</span>
          )}
          {recipe.kcal_per_100g && (
            <span className="text-xs bg-white dark:bg-zinc-900 rounded-full px-2.5 py-1">{recipe.kcal_per_100g} kcal/100g</span>
          )}
          <span className="text-xs bg-white dark:bg-zinc-900 rounded-full px-2.5 py-1 capitalize">{recipe.difficulty}</span>
          {recipe.is_therapeutic && (
            <span className="text-xs bg-accent-200 dark:bg-accent-800 text-accent-700 dark:text-accent-300 rounded-full px-2.5 py-1 font-medium">Terapéutico</span>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Ingredientes</h3>
        <div className="space-y-2">
          {ingredients.map((ing) => (
            <div key={ing.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${TYPE_COLORS[ing.ingredient_type] ?? "border-zinc-400"}`}>
              <span className="flex-1 text-sm">{ing.ingredient_name}</span>
              <span className="text-xs text-zinc-400">{ing.quantity_per_serving_g}g</span>
              <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{TYPE_LABELS[ing.ingredient_type] ?? ing.ingredient_type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cocinar Hoy - scaled to dog */}
      {dog && (
        <div className="bg-secondary-50 dark:bg-secondary-950 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            Cocinar para {dog.nombre} ({dog.peso_kg}kg)
          </h3>
          <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
            Porción diaria total: <strong>{Math.round(totalGrams)}g</strong> (al {feedingPct}%)
          </p>
          <div className="space-y-1.5">
            {ingredients.map((ing) => {
              const scaled = Math.round((ing.quantity_per_serving_g / ingredients.reduce((s, i) => s + i.quantity_per_serving_g, 0)) * totalGrams);
              return (
                <div key={ing.id} className="flex justify-between text-xs text-secondary-700 dark:text-secondary-300">
                  <span>{ing.ingredient_name}</span>
                  <span className="font-semibold">{scaled}g</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCook}
          className={`flex-1 rounded-xl py-3 font-semibold text-sm transition-colors ${
            cooked ? "bg-secondary-500 text-white" : "bg-primary-600 hover:bg-primary-700 text-white"
          }`}
        >
          {cooked ? <><Check className="w-4 h-4 inline mr-1" /> Registrado</> : "Cocinar Hoy"}
        </button>
        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1 rounded-xl py-3 px-4 font-semibold text-sm transition-colors ${
            addedToCart ? "bg-secondary-500 text-white" : "bg-secondary-600 hover:bg-secondary-700 text-white"
          }`}
        >
          {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {addedToCart ? "Añadido" : "Al Carrito"}
        </button>
      </div>
    </div>
  );
}
