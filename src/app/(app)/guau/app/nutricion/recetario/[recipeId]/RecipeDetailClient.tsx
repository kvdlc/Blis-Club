"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile, RecipeStep, RecipeNutritionFacts, DogMealSlot } from "@/types/database";
import { ChefHat, ShoppingCart, ArrowLeft, Check, Heart, Clock, Flame, Star, ChevronDown, ChevronUp, Bone, Beef, Carrot, Pill, CircleHelp, CalendarDays, Plus, Play, X, Circle } from "lucide-react";
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

function formatPieces(grams: number, unitWeight: number, displayUnit: string | null, unitType: string) {
  if (unitType === 'g' || unitType === 'kg') return `${Math.round(grams)}g`;
  if (!unitWeight || unitWeight <= 0) return `${Math.round(grams)}g`;
  const pieces = grams / unitWeight;
  if (pieces < 0.25) return `${Math.round(grams)}g`;
  if (Math.abs(pieces - 0.5) < 0.05) return `½ ${displayUnit || unitType}`;
  if (Math.abs(pieces - 1) < 0.05) return `1 ${displayUnit || unitType}`;
  if (pieces < 1) return `${Math.round(pieces * 2)}/2 ${displayUnit || unitType}`;
  const rounded = Math.round(pieces * 10) / 10;
  return `${rounded} ${displayUnit || unitType}`;
}

export function RecipeDetailClient({ recipe, ingredients, steps, nutritionFacts, dog, metabolicProfile, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cooked, setCooked] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [cookModalOpen, setCookModalOpen] = useState(false);
  const [dogSlots, setDogSlots] = useState<DogMealSlot[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<{ meal_slot_index: number; status: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [savingCook, setSavingCook] = useState(false);

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
  const todayStr = toLocalDateStr();

  useEffect(() => {
    if (!dog || !cookModalOpen) return;
    loadSlots();
    loadTodaySchedule();
  }, [cookModalOpen, dog]);

  const loadSlots = async () => {
    if (!dog) return;
    const { data } = await supabase.from("dog_meal_slots").select("*").eq("dog_id", dog.id).eq("active", true).order("slot_index", { ascending: true });
    setDogSlots((data as DogMealSlot[] | null) ?? []);
  };

  const loadTodaySchedule = async () => {
    if (!dog) return;
    const { data } = await supabase.from("meal_schedule").select("meal_slot_index, status").eq("dog_id", dog.id).eq("fecha", todayStr);
    setTodaySchedule((data as { meal_slot_index: number; status: string }[] | null) ?? []);
  };

  const handleAddToCart = async () => {
    if (!dog) return;
    const items = ingredients.map((ing) => ({
      user_id: userId,
      ingredient_name: ing.ingredient_name,
      quantity_g: ing.quantity_per_serving_g,
      checked: false,
      week_start: todayStr,
    }));
    await supabase.from("shopping_list").insert(items);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const openCookModal = () => {
    if (!dog) return;
    setSelectedSlot(null);
    setCookModalOpen(true);
  };

  const handleCookConfirm = async () => {
    if (!dog || selectedSlot === null) return;
    setSavingCook(true);

    // Save nutrition log
    await supabase.from("nutrition_logs").insert({
      dog_id: dog.id,
      recipe_id: recipe.id,
      gramos_servidos: Math.round(totalGrams),
      fecha: todayStr,
    });

    // Upsert into meal_schedule with status fed
    await supabase.from("meal_schedule").upsert({
      dog_id: dog.id,
      recipe_id: recipe.id,
      fecha: todayStr,
      meal_slot_index: selectedSlot,
      status: "fed",
      gramos: Math.round(totalGrams),
    }, { onConflict: "dog_id,fecha,meal_slot_index" });

    setSavingCook(false);
    setCookModalOpen(false);
    setCooked(true);
    setTimeout(() => setCooked(false), 2000);
  };

  const totalIngGrams = ingredients.reduce((s, i) => s + i.quantity_per_serving_g, 0);

  return (
    <div className="relative -mx-4 pb-8">
      {/* Header with purple background */}
      <div className="relative px-4 pt-4 pb-20 z-0">
        <div className="absolute -top-16 inset-x-0 h-96 bg-gradient-to-br from-primary-500 to-primary-700" />
        <div className="relative z-10 flex justify-between pt-2">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
            <Heart className={`w-5 h-5 text-white ${liked ? "fill-white" : ""}`} />
          </button>
        </div>
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

        {/* Action buttons — MOVED UP */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button onClick={() => setScheduleOpen(true)} className="flex-1 rounded-2xl py-3 font-bold text-sm transition-all bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.97] flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" /> Agendar
            </button>
            <button onClick={openCookModal} className={`flex-1 rounded-2xl py-3 font-bold text-sm transition-all ${cooked ? "bg-secondary-500 text-white" : "bg-secondary-600 hover:bg-secondary-700 text-white"} active:scale-[0.97] flex items-center justify-center gap-2`}>
              {cooked ? <><Check className="w-4 h-4" /> Registrado</> : <><ChefHat className="w-4 h-4" /> Cocinar Hoy</>}
            </button>
          </div>
          <button onClick={handleAddToCart} className={`w-full rounded-2xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${addedToCart ? "bg-primary-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"} active:scale-[0.97]`}>
            {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {addedToCart ? "Añadido" : "Añadir a lista de compras"}
          </button>
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
              <div key={ing.id} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium ${TYPE_COLORS[ing.ingredient_type] ?? TYPE_COLORS.otro}`}>
                {TYPE_ICONS[ing.ingredient_type] ?? TYPE_ICONS.otro}
                <span>{ing.ingredient_name}</span>
                <span className="opacity-60">({ing.quantity_per_serving_g}g)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scale to dog — NOW IN PIECES */}
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
                const scaledGrams = (ing.quantity_per_serving_g / totalIngGrams) * totalGrams;
                const display = formatPieces(scaledGrams, ing.unit_weight_g, ing.display_unit, ing.unit_type);
                return (
                  <div key={ing.id} className="flex justify-between text-xs text-secondary-700 dark:text-secondary-300">
                    <span>{ing.ingredient_name}</span>
                    <span className="font-semibold">{display}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preparation Steps */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Preparación</h3>
            <div className="space-y-3">
              {steps.map((step) => (
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

        {/* Nutrition Facts */}
        {nutritionFacts && (
          <div className="card-soft rounded-[1.5rem] overflow-hidden">
            <button onClick={() => setNutritionOpen(!nutritionOpen)} className="w-full flex items-center justify-between p-5 text-left">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Valor nutricional <span className="text-zinc-400 font-normal">(por 100g)</span></h3>
              {nutritionOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>
            {nutritionOpen && (
              <div className="px-5 pb-5 space-y-4">
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
      </div>

      {/* Schedule Modal */}
      <ScheduleMealModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} recipe={recipe} dog={dog} totalGrams={Math.round(totalGrams)} />

      {/* Cook Today Modal */}
      {cookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setCookModalOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Cocinar Hoy</h3>
              <button onClick={() => setCookModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/30">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-lg">🍽️</span>
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{recipe.title}</p>
                <p className="text-xs text-zinc-500">{Math.round(totalGrams)}g · {Math.round(totalGrams * (recipe.kcal_per_100g ?? 0) / 100)} kcal</p>
              </div>
            </div>

            {dogSlots.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-500 mb-2">No tienes horarios de comida configurados.</p>
                <p className="text-xs text-zinc-400">Configúralos en el perfil de tu perro.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">¿En qué horario cocinaste?</label>
                {dogSlots.map((slot) => {
                  const existing = todaySchedule.find((s) => s.meal_slot_index === slot.slot_index);
                  const isSelected = selectedSlot === slot.slot_index;
                  return (
                    <button
                      key={slot.slot_index}
                      onClick={() => setSelectedSlot(slot.slot_index)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                        isSelected ? "border-primary-400 bg-primary-50 dark:bg-primary-950/30" : existing ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50" : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-primary-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
                        <p className="text-xs text-zinc-400">{slot.time_of_day.slice(0, 5)}</p>
                      </div>
                      {existing && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">{existing.status === 'fed' ? 'Completado' : 'Agendado'}</span>
                      )}
                      {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleCookConfirm}
              disabled={selectedSlot === null || savingCook}
              className={`w-full rounded-2xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedSlot === null ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/20 active:scale-[0.97]"
              }`}
            >
              {savingCook ? "Guardando..." : <><Check className="w-4 h-4" /> Confirmar y Registrar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
