"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile, RecipeStep, RecipeNutritionFacts } from "@/types/database";
import { ChefHat, ShoppingCart, ArrowLeft, Check, Heart, Clock, Flame, Star, ChevronDown, ChevronUp, Bone, Beef, Carrot, Pill, CircleHelp, CalendarDays, Plus, Play } from "lucide-react";
import { ScheduleMealModal } from "./ScheduleMealModal";
import VideoEmbed from "@/components/VideoEmbed";

interface Props {
  recipe: NutritionRecipe;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutritionFacts: RecipeNutritionFacts | null;
  dog: Dog | null;
  metabolicProfile: DogMetabolicProfile | null;
  userId: string;
}

const TYPE_LABELS: Record<string, string> = {
  proteina: "Proteína", hueso: "Hueso", viscera: "Víscera", vegetal: "Vegetal", suplemento: "Suplemento", otro: "Otro",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  proteina: <Beef className="w-4 h-4" />,
  hueso: <Bone className="w-4 h-4" />,
  viscera: <Heart className="w-4 h-4" />,
  vegetal: <Carrot className="w-4 h-4" />,
  suplemento: <Pill className="w-4 h-4" />,
  otro: <CircleHelp className="w-4 h-4" />,
};

const TYPE_COLORS: Record<string, string> = {
  proteina: "bg-danger-50 dark:bg-danger-950/30 text-danger-700 dark:text-danger-300 border-danger-200 dark:border-danger-900",
  hueso: "bg-warning-50 dark:bg-warning-950/30 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-900",
  viscera: "bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-300 border-accent-200 dark:border-accent-900",
  vegetal: "bg-secondary-50 dark:bg-secondary-950/30 text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-900",
  suplemento: "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-900",
  otro: "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
};

const DIFFICULTY_STARS: Record<string, number> = {
  facil: 1, medio: 2, avanzado: 3,
};

export function RecipeDetailClient({ recipe, ingredients, steps, nutritionFacts, dog, metabolicProfile, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cooked, setCooked] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [liked, setLiked] = useState(false);

  const feedingPct = metabolicProfile?.feeding_pct ?? 2.5;
  const weight = dog?.peso_kg ?? 0;
  const totalGrams = weight * 1000 * (feedingPct / 100);
  const stars = DIFFICULTY_STARS[recipe.difficulty] ?? 1;

  const toLocalDateStr = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleAddToCart = async () => {
    if (!dog) return;
    const items = ingredients.map((ing) => ({
      user_id: userId,
      ingredient_name: ing.ingredient_name,
      quantity_g: ing.quantity_per_serving_g,
      checked: false,
      week_start: toLocalDateStr(),
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
      fecha: toLocalDateStr(),
    });
    setCooked(true);
    setTimeout(() => setCooked(false), 2000);
  };

  return (
    <div className="relative -mx-4 pb-8">
      {/* Header with purple background */}
      <div className="relative px-4 pt-4 pb-20 z-0">
        {/* Background layer that goes all the way up behind the top bar */}
        <div className="absolute -top-16 inset-x-0 h-96 bg-gradient-to-br from-primary-500 to-primary-700" />

        {/* Content layer */}
        <div className="relative z-10 flex justify-between pt-2">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Heart className={`w-5 h-5 text-white ${liked ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Centered image */}
        <div className="relative z-10 flex flex-col items-center pt-6">
          <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-xl">
            {recipe.image_url ? (
              <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
            ) : (
              <ChefHat className="w-12 h-12 text-white/90" />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* White card overlapping the header */}
        <div className="relative -mt-10">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg rounded-[2rem] p-6 text-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{recipe.title}</h2>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-5 mt-3">
            {recipe.prep_time_min && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5 text-secondary-500" />
                <span>{recipe.prep_time_min} min</span>
              </div>
            )}
            {recipe.kcal_per_100g && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Flame className="w-3.5 h-3.5 text-danger-500" />
                <span>{Math.round(recipe.kcal_per_100g)} kcal</span>
              </div>
            )}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? "text-warning-400 fill-warning-400" : "text-zinc-200 dark:text-zinc-700"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      {recipe.video_url && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Video explicativo</h3>
          </div>
          <VideoEmbed url={recipe.video_url} />
        </div>
      )}

      {/* Ingredients */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ingredientes</h3>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium ${TYPE_COLORS[ing.ingredient_type] ?? TYPE_COLORS.otro}`}
            >
              {TYPE_ICONS[ing.ingredient_type] ?? TYPE_ICONS.otro}
              <span>{ing.ingredient_name}</span>
              <span className="opacity-60">({ing.quantity_per_serving_g}g)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preparation Steps - visible by default */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Preparación</h3>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{step.instruction}</p>
                  {step.duration_min && (
                    <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {step.duration_min} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Facts - collapsible */}
      {nutritionFacts && (
        <div className="card-soft rounded-[1.5rem] overflow-hidden">
          <button
            onClick={() => setNutritionOpen(!nutritionOpen)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Valor nutricional <span className="text-zinc-400 font-normal">(por 100g)</span></h3>
            {nutritionOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>
          {nutritionOpen && (
            <div className="px-5 pb-5 space-y-4">
              {/* Macro bars */}
              <div className="space-y-2">
                {[
                  { label: "Proteína", value: nutritionFacts.protein_g, max: 35, color: "bg-danger-500" },
                  { label: "Grasa", value: nutritionFacts.fat_g, max: 25, color: "bg-warning-500" },
                  { label: "Carbohidratos", value: nutritionFacts.carbs_g, max: 20, color: "bg-secondary-500" },
                ].map((m) => m.value && (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">{m.label}</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.value}g</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Micronutrients grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                {[
                  { label: "Calcio", value: nutritionFacts.calcium_mg, unit: "mg" },
                  { label: "Fósforo", value: nutritionFacts.phosphorus_mg, unit: "mg" },
                  { label: "Hierro", value: nutritionFacts.iron_mg, unit: "mg" },
                  { label: "Zinc", value: nutritionFacts.zinc_mg, unit: "mg" },
                  { label: "Vit A", value: nutritionFacts.vitamin_a_ui, unit: "UI" },
                  { label: "Vit D", value: nutritionFacts.vitamin_d_ui, unit: "UI" },
                  { label: "Vit E", value: nutritionFacts.vitamin_e_mg, unit: "mg" },
                  { label: "Omega-3", value: nutritionFacts.omega3_g, unit: "g" },
                ].map((m) => m.value && (
                  <div key={m.label} className="flex justify-between text-xs py-1.5">
                    <span className="text-zinc-500">{m.label}</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{m.value}{m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scale to dog */}
      {dog && (
        <div className="bg-secondary-50/80 dark:bg-secondary-950/30 rounded-2xl border border-secondary-200/60 dark:border-secondary-800/40 p-5">
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            Cocinar para {dog.nombre} ({dog.peso_kg}kg)
          </h3>
          <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
            Porción diaria total: <strong>{Math.round(totalGrams)}g</strong> (al {feedingPct}%)
          </p>
          <div className="space-y-1.5">
            {ingredients.map((ing) => {
              const totalIng = ingredients.reduce((s, i) => s + i.quantity_per_serving_g, 0);
              const scaled = Math.round((ing.quantity_per_serving_g / totalIng) * totalGrams);
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
      <div className="space-y-3 pt-2">
        <div className="flex gap-4">
          <button
            onClick={() => setScheduleOpen(true)}
            className="flex-1 rounded-2xl py-3.5 font-bold text-sm transition-all bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Agendar Comida
          </button>
          <button
            onClick={handleCook}
            className={`flex-1 rounded-2xl py-3.5 font-bold text-sm transition-all ${
              cooked ? "bg-secondary-500 text-white" : "bg-secondary-600 hover:bg-secondary-700 text-white"
            } active:scale-[0.97]`}
          >
            {cooked ? <><Check className="w-4 h-4 inline mr-1" /> Registrado</> : "Cocinar Hoy"}
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          className={`w-full rounded-2xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            addedToCart ? "bg-primary-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
          } active:scale-[0.97]`}
        >
          {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          {addedToCart ? "Añadido" : "Añadir a lista de compras"}
        </button>
      </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleMealModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        recipe={recipe}
        dog={dog}
        totalGrams={Math.round(totalGrams)}
      />
    </div>
  );
}
