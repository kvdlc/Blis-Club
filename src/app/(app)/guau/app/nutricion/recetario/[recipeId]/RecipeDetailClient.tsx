"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, RecipeIngredient, Dog, DogMetabolicProfile, RecipeStep, RecipeNutritionFacts, DogMealSlot } from "@/types/database";
import { ChefHat, ShoppingCart, ArrowLeft, Check, Heart, Clock, Flame, Star, ChevronDown, ChevronUp, Bone, Beef, Carrot, Pill, CircleHelp, CalendarDays, Plus, Play, X, Circle, EyeOff } from "lucide-react";
import { ScheduleMealModal } from "./ScheduleMealModal";
import VideoEmbed from "@/components/VideoEmbed";
import { RecipeLightbox } from "@/components/RecipeLightbox";
import { calcularRacionDiaria, calcularRacionMixta, getFeedingDefaults } from "@/lib/feeding-standards";
import type { DietType, ActivityLevel, LifeStage } from "@/lib/feeding-standards";

interface Props {
  recipe: NutritionRecipe;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutritionFacts: RecipeNutritionFacts | null;
  dog: Dog | null;
  metabolicProfile: DogMetabolicProfile | null;
  userId: string;
  initialSlots?: DogMealSlot[];
  latestWeightKg?: number;
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

const TYPE_ROW_COLORS: Record<string, string> = {
  proteina: "border-l-danger-400 dark:border-l-danger-600 bg-danger-50/50 dark:bg-danger-950/20",
  hueso: "border-l-warning-400 dark:border-l-warning-600 bg-warning-50/50 dark:bg-warning-950/20",
  viscera: "border-l-accent-400 dark:border-l-accent-600 bg-accent-50/50 dark:bg-accent-950/20",
  vegetal: "border-l-secondary-400 dark:border-l-secondary-600 bg-secondary-50/50 dark:bg-secondary-950/20",
  suplemento: "border-l-primary-400 dark:border-l-primary-600 bg-primary-50/50 dark:bg-primary-950/20",
  otro: "border-l-zinc-400 dark:border-l-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/20",
};

const TYPE_TEXT: Record<string, string> = {
  proteina: "text-danger-700 dark:text-danger-300",
  hueso: "text-warning-700 dark:text-warning-300",
  viscera: "text-accent-700 dark:text-accent-300",
  vegetal: "text-secondary-700 dark:text-secondary-300",
  suplemento: "text-primary-700 dark:text-primary-300",
  otro: "text-zinc-700 dark:text-zinc-300",
};

const TYPE_ORDER = ["proteina", "hueso", "viscera", "vegetal", "suplemento", "otro"];

const DIFFICULTY_STARS: Record<string, number> = {
  facil: 1, medio: 2, avanzado: 3,
};

const HIDE_REASONS = [
  { emoji: "🐕", label: "Mi perro no le gustó" },
  { emoji: "👨‍🍳", label: "Es muy difícil de preparar" },
  { emoji: "🛒", label: "No consigo los ingredientes" },
  { emoji: "⏱️", label: "Tarda mucho tiempo" },
  { emoji: "🙅", label: "Otro / Prefiero no decir" },
];

function formatPieces(grams: number, unitWeight: number, displayUnit: string | null, unitType: string) {
  const gStr = `${Math.round(grams)}g`;
  if (unitType === 'g' || unitType === 'kg' || !unitWeight || unitWeight <= 0) return gStr;

  const rawLabel = displayUnit || unitType;
  const qtyMatch = rawLabel.match(/^(\d+(?:[.,]\d+)?)\s*/);
  const unitQty = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;
  const cleanLabel = qtyMatch ? rawLabel.slice(qtyMatch[0].length) : rawLabel;

  const pieces = grams / unitWeight;
  const actualCount = pieces * unitQty;

  let pieceStr = "";
  if (actualCount < 0.25) pieceStr = "";
  else if (Math.abs(actualCount - 0.5) < 0.05) pieceStr = `½`;
  else if (Math.abs(actualCount - 1) < 0.05) pieceStr = `1`;
  else if (actualCount < 1) pieceStr = `${Math.round(actualCount * 2)}/2`;
  else pieceStr = `${Math.round(actualCount * 10) / 10}`;

  if (pieceStr) return `${gStr} (≈${pieceStr} ${cleanLabel})`;
  return gStr;
}

export function RecipeDetailClient({ recipe, ingredients, steps, nutritionFacts, dog, metabolicProfile, userId, initialSlots = [], latestWeightKg }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [addedToCart, setAddedToCart] = useState(false);
  const [cooked, setCooked] = useState(false);
  const [nutritionOpen, setNutritionOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [cookModalOpen, setCookModalOpen] = useState(false);
  const [dogSlots, setDogSlots] = useState<DogMealSlot[]>(initialSlots);
  const [todaySchedule, setTodaySchedule] = useState<{ meal_slot_index: number; status: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [savingCook, setSavingCook] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [perMealMode, setPerMealMode] = useState(false);
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [hidingRecipe, setHidingRecipe] = useState(false);
  const [isDefaultKibble, setIsDefaultKibble] = useState(false);
  const [savingKibble, setSavingKibble] = useState(false);

  const feedingPct = metabolicProfile?.feeding_pct ?? 2.5;
  const dietType = (metabolicProfile?.diet_type as DietType) ?? "croquetas";
  const activityLevel = (metabolicProfile?.activity_level as ActivityLevel) ?? "moderado";
  const weight = latestWeightKg ?? (dog?.peso_kg ?? 0);

  const defaults = dog ? getFeedingDefaults({ raza: dog.raza, peso_kg: dog.peso_kg, edad_meses: dog.edad_meses, tamano_guardado: dog.tamano }) : null;
  const lifeStage = (defaults?.life_stage ?? "adulto") as LifeStage;

  // Usar la misma fórmula de ración que el editor y la calculadora
  const ration = dog ? (dietType === "mixta"
    ? calcularRacionMixta({
        peso_kg: weight, life_stage: lifeStage,
        proporcion_barf: 50, activity_level: activityLevel, ajuste_global: feedingPct / 100,
      })
    : calcularRacionDiaria({
        peso_kg: weight, feeding_pct: feedingPct, diet_type: dietType, activity_level: activityLevel,
      })
  ) : { total_grams: 0, total_kcal: 0 };

  // Para mixta: usar solo los gramos naturales (BARF), no sumar croquetas
  const mixtaResult = dietType === "mixta" ? (ration as any) : null;
  const barfOnlyGrams = mixtaResult ? (mixtaResult.barf_grams || 0) : 0;
  const totalGrams = mixtaResult ? barfOnlyGrams : ((ration as any).total_grams || 0);
  const activeSlots = dogSlots.filter(s => s.active);
  const mealCount = Math.max(activeSlots.length, 1);
  const gramsPerMeal = totalGrams / mealCount;
  const displayGrams = perMealMode ? gramsPerMeal : totalGrams;
  const stars = DIFFICULTY_STARS[recipe.difficulty] ?? 1;

  const toLocalDateStr = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const todayStr = toLocalDateStr();

  // Load dog's default kibble
  useEffect(() => {
    if (!dog || recipe.category !== "croquetas") return;
    const loadDefault = async () => {
      const { data } = await supabase.from("dog_metabolic_profiles").select("kibble_recipe_id").eq("dog_id", dog.id).maybeSingle();
      setIsDefaultKibble((data as any)?.kibble_recipe_id === recipe.id);
    };
    loadDefault();
  }, [supabase, dog?.id, recipe.id, recipe.category]);

  const toggleDefaultKibble = async () => {
    if (!dog) return;
    setSavingKibble(true);
    if (isDefaultKibble) {
      await supabase.from("dog_metabolic_profiles").update({ kibble_recipe_id: null }).eq("dog_id", dog.id);
      setIsDefaultKibble(false);
    } else {
      await supabase.from("dog_metabolic_profiles").update({ kibble_recipe_id: recipe.id }).eq("dog_id", dog.id);
      setIsDefaultKibble(true);
    }
    setSavingKibble(false);
  };

  useEffect(() => {
    const loadFav = async () => {
      const { data } = await supabase.from("user_favorite_recipes").select("recipe_id").eq("user_id", userId).eq("recipe_id", recipe.id).maybeSingle();
      setLiked(!!data);
    };
    loadFav();
  }, [supabase, userId, recipe.id]);

  const loadSlots = useCallback(async () => {
    if (!dog) return;
    const { data } = await supabase.from("dog_meal_slots").select("*").eq("dog_id", dog.id).order("slot_index", { ascending: true });
    const slots = (data as DogMealSlot[] | null) ?? [];
    if (slots.length > 0) setDogSlots(slots); // solo actualizar si hay datos
  }, [supabase, dog?.id]);

  const loadTodaySchedule = useCallback(async () => {
    if (!dog) return;
    const { data } = await supabase.from("meal_schedule").select("meal_slot_index, status").eq("dog_id", dog.id).eq("fecha", todayStr);
    setTodaySchedule((data as { meal_slot_index: number; status: string }[] | null) ?? []);
  }, [supabase, dog?.id, todayStr]);

  // Load dog slots on mount for accurate meal count
  useEffect(() => {
    if (!dog) return;
    loadSlots();
    loadTodaySchedule();
  }, [dog, loadSlots, loadTodaySchedule]);

  useEffect(() => {
    if (!dog || !cookModalOpen) return;
    loadSlots();
    loadTodaySchedule();
  }, [cookModalOpen, dog, loadSlots, loadTodaySchedule]);

  const toggleFavorite = async () => {
    if (liked) {
      await supabase.from("user_favorite_recipes").delete().eq("user_id", userId).eq("recipe_id", recipe.id);
      setLiked(false);
    } else {
      await supabase.from("user_favorite_recipes").insert({ user_id: userId, recipe_id: recipe.id });
      setLiked(true);
    }
  };

  const handleHide = async (reason: string) => {
    setHidingRecipe(true);
    await supabase.from("user_hidden_recipes").insert({ user_id: userId, recipe_id: recipe.id, reason });
    setHidingRecipe(false);
    setHideModalOpen(false);
    router.back();
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
    if (!dog) return;
    setSavingCook(true);

    const slotsToRegister = perMealMode
      ? (selectedSlot !== null ? [selectedSlot] : [])
      : activeSlots.map(s => s.slot_index);

    if (slotsToRegister.length === 0) { setSavingCook(false); return; }

    await supabase.from("nutrition_logs").insert({
      dog_id: dog.id,
      recipe_id: recipe.id,
      gramos_servidos: Math.round(perMealMode ? gramsPerMeal : totalGrams),
      fecha: todayStr,
    });

    for (const slotIndex of slotsToRegister) {
      await supabase.from("meal_schedule").upsert({
        dog_id: dog.id,
        recipe_id: recipe.id,
        fecha: todayStr,
        meal_slot_index: slotIndex,
        status: "fed",
        gramos: Math.round(gramsPerMeal),
      }, { onConflict: "dog_id,fecha,meal_slot_index" });
    }

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
          <div className="flex gap-2">
            <button onClick={() => setHideModalOpen(true)} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
              <EyeOff className="w-5 h-5 text-white" />
            </button>
            <button onClick={toggleFavorite} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
              <Heart className={`w-5 h-5 text-white ${liked ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-center pt-6">
          <button
            onClick={() => recipe.image_url && setLightboxOpen(true)}
            className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-xl isolate"
          >
            {recipe.image_url ? (
              <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <ChefHat className="w-12 h-12 text-white/90" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* White card overlapping the header */}
        <div className="relative -mt-10">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg rounded-[2rem] p-6 text-center">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{recipe.title}</h2>
            <div className="flex items-center justify-center gap-5 mt-3">
              {(recipe.prep_time_min ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5 text-secondary-500" />
                  <span>{recipe.prep_time_min} min</span>
                </div>
              )}
              {(recipe.kcal_per_100g ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <Flame className="w-3.5 h-3.5 text-danger-500" />
                  <span>{Math.round(recipe.kcal_per_100g ?? 0)} kcal</span>
                </div>
              )}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? "text-warning-400 fill-warning-400" : "text-zinc-200 dark:text-zinc-700"}`} />
                ))}
              </div>
            </div>
            {recipe.breed_sizes && recipe.breed_sizes.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {recipe.breed_sizes.map(s => (
                  <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">
                    {s === "miniatura" ? "Miniatura" : s === "pequena" ? "Pequeña" : s === "mediana" ? "Mediana" : s === "grande" ? "Grande" : s === "gigante" ? "Gigante" : s}
                  </span>
                ))}
              </div>
            )}
            {recipe.source_book && (
              <p className="text-xs text-zinc-400 mt-2">Fabricante: {recipe.source_book}</p>
            )}

            {/* Croqueta-specific info */}
            {recipe.category === "croquetas" && (
              <div className="mt-4 space-y-3 text-left">
                {recipe.description && (
                  <p className="text-xs text-zinc-500 leading-relaxed">{recipe.description}</p>
                )}
                {recipe.protein_type && (
                  <p className="text-xs text-zinc-500"><span className="font-semibold">Proteína principal:</span> {recipe.protein_type}</p>
                )}
                {recipe.health_tags && recipe.health_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {recipe.health_tags.map(t => (
                      <span key={t} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
                {(recipe as any).storage_instructions && (
                  <p className="text-[10px] text-zinc-400 italic"><span className="font-semibold not-italic">Almacenamiento:</span> {(recipe as any).storage_instructions}</p>
                )}
                {dog && (
                  <button
                    onClick={toggleDefaultKibble}
                    disabled={savingKibble}
                    className={`w-full rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isDefaultKibble
                        ? "bg-secondary-100 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-800"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {savingKibble ? "..." : isDefaultKibble ? <><Check className="w-3.5 h-3.5" /> Mi croqueta</> : "📌 Usar siempre como mi croqueta"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button onClick={() => setScheduleOpen(true)} className="flex-1 rounded-2xl py-3 font-bold text-sm transition-all bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.97] flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" /> Agendar
            </button>
            <button onClick={openCookModal} className={`flex-1 rounded-2xl py-3 font-bold text-sm transition-all ${cooked ? "bg-secondary-500 text-white" : "bg-secondary-600 hover:bg-secondary-700 text-white"} active:scale-[0.97] flex items-center justify-center gap-2`}>
              {cooked ? <><Check className="w-4 h-4" /> Registrado</> : recipe.category === "croquetas" ? <><ChefHat className="w-4 h-4" /> Registrar Comida</> : <><ChefHat className="w-4 h-4" /> Cocinar Hoy</>}
            </button>
          </div>
          {recipe.category !== "croquetas" && (
            <button onClick={handleAddToCart} className={`w-full rounded-2xl py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${addedToCart ? "bg-primary-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"} active:scale-[0.97]`}>
              {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {addedToCart ? "Añadido" : "Añadir a lista de compras"}
            </button>
          )}
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
        {ingredients.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ingredientes</h3>
            {recipe.category === "croquetas" ? (
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map(ing => (
                  <span key={ing.id} className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{ing.ingredient_name}</span>
                ))}
              </div>
            ) : (
              (() => {
                const sorted = [...ingredients].sort((a, b) => {
                  const ai = TYPE_ORDER.indexOf(a.ingredient_type) ?? 99;
                  const bi = TYPE_ORDER.indexOf(b.ingredient_type) ?? 99;
                  return ai - bi;
                });
                if (dog) {
                  return (
                    <div className="space-y-1">
                      {sorted.map((ing) => {
                        const baseGrams = (ing.quantity_per_serving_g / totalIngGrams) * totalGrams;
                        const scaledGrams = perMealMode ? baseGrams / mealCount : baseGrams;
                        const display = formatPieces(scaledGrams, ing.unit_weight_g, ing.display_unit, ing.unit_type);
                        const rowColor = TYPE_ROW_COLORS[ing.ingredient_type] ?? TYPE_ROW_COLORS.otro;
                        const textColor = TYPE_TEXT[ing.ingredient_type] ?? TYPE_TEXT.otro;
                        return (
                          <div key={ing.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-l-3 ${rowColor}`}>
                            <span className={textColor}>{TYPE_ICONS[ing.ingredient_type] ?? TYPE_ICONS.otro}</span>
                            <span className="flex-1 text-xs font-medium text-zinc-800 dark:text-zinc-200">{ing.ingredient_name}</span>
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{display}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <div className="space-y-1">
                    {sorted.map((ing) => {
                      const chipColor = TYPE_COLORS[ing.ingredient_type] ?? TYPE_COLORS.otro;
                      return (
                        <div key={ing.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${chipColor}`}>
                          {TYPE_ICONS[ing.ingredient_type] ?? TYPE_ICONS.otro}
                          <span className="text-xs font-medium flex-1">{ing.ingredient_name}</span>
                          <span className="text-xs opacity-60 font-semibold">{ing.quantity_per_serving_g}g</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Scale to dog with toggle — solo para recetas que NO son croquetas */}
        {dog && recipe.category !== "croquetas" && (
          <div className="bg-secondary-50/80 dark:bg-secondary-950/30 rounded-2xl border border-secondary-200/60 dark:border-secondary-800/40 p-5">
            {dietType === "croquetas" ? (
              <div className="text-center py-2">
                <p className="text-sm text-zinc-500 mb-2">
                  🦴 <strong>{dog.nombre}</strong> consume <strong>croquetas</strong>
                </p>
                <p className="text-xs text-zinc-400">
                  Esta receta es para alimentación natural. Si quieres personalizar porciones, cambia el tipo de alimentación de tu perro a Natural o Mixta en su perfil.
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Porción genérica diaria: <strong>{Math.round(totalGrams)}g</strong>
                </p>
              </div>
            ) : (
              <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                {perMealMode ? `Por comida (${mealCount} al día)` : `Cocinar para ${dog.nombre} (${dog.peso_kg}kg)`}
              </h3>
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full p-0.5 border border-secondary-200 dark:border-secondary-800">
                <button
                  onClick={() => setPerMealMode(false)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${!perMealMode ? "bg-secondary-500 text-white" : "text-zinc-500"}`}
                >
                  Todo el día
                </button>
                <button
                  onClick={() => setPerMealMode(true)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${perMealMode ? "bg-secondary-500 text-white" : "text-zinc-500"}`}
                >
                  1 comida
                </button>
              </div>
            </div>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
              {dietType === "mixta" ? (
                <>🥩 Porción natural {perMealMode ? "por comida" : "diaria"}: <strong>{Math.round(perMealMode ? gramsPerMeal : totalGrams)}g</strong> (croquetas aparte)</>
              ) : (
                <>Porción {perMealMode ? "por comida" : "diaria total"}: <strong>{Math.round(perMealMode ? gramsPerMeal : totalGrams)}g</strong></>
              )}
            </p>
            <div className="space-y-1">
              {[...ingredients].sort((a, b) => {
                const ai = TYPE_ORDER.indexOf(a.ingredient_type) ?? 99;
                const bi = TYPE_ORDER.indexOf(b.ingredient_type) ?? 99;
                return ai - bi;
              }).map((ing) => {
                const baseGrams = (ing.quantity_per_serving_g / totalIngGrams) * totalGrams;
                const scaledGrams = perMealMode ? baseGrams / mealCount : baseGrams;
                const display = formatPieces(scaledGrams, ing.unit_weight_g, ing.display_unit, ing.unit_type);
                const rowColor = TYPE_ROW_COLORS[ing.ingredient_type] ?? TYPE_ROW_COLORS.otro;
                const textColor = TYPE_TEXT[ing.ingredient_type] ?? TYPE_TEXT.otro;
                return (
                  <div key={ing.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-l-3 ${rowColor}`}>
                    <span className={textColor}>{TYPE_ICONS[ing.ingredient_type] ?? TYPE_ICONS.otro}</span>
                    <span className="flex-1 text-xs font-medium text-secondary-800 dark:text-secondary-200">{ing.ingredient_name}</span>
                    <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">{display}</span>
                  </div>
                );
              })}
            </div>
            </>)}
          </div>
        )}

        {/* Preparation Steps (hidden for croquetas) */}
        {recipe.category !== "croquetas" && steps.length > 0 && (
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

        {/* Nutrition description (croquetas) */}
        {recipe.category === "croquetas" && (recipe as any).nutrition_description && (
          <div className="card-soft rounded-[1.5rem] p-5">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Descripción nutricional</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{(recipe as any).nutrition_description}</p>
          </div>
        )}

        {/* Benefits (croquetas) */}
        {recipe.category === "croquetas" && (recipe as any).benefits?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Beneficios</h3>
            <div className="space-y-2">
              {(recipe as any).benefits.map((b: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-accent-500 mt-0.5">✓</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleMealModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} recipe={recipe} dog={dog} totalGrams={Math.round(totalGrams)} gramsPerMeal={Math.round(gramsPerMeal)} perMealMode={perMealMode} />

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
                <p className="text-xs text-zinc-500">{Math.round(displayGrams)}g · {Math.round(displayGrams * (recipe.kcal_per_100g ?? 0) / 100)} kcal</p>
              </div>
            </div>

            {activeSlots.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-zinc-500 mb-2">No tienes horarios de comida activos.</p>
                <p className="text-xs text-zinc-400">Configúralos en el perfil de tu perro.</p>
              </div>
            ) : perMealMode ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">¿En qué horario cocinaste?</label>
                {activeSlots.map((slot) => {
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
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Se registrará en todas las comidas</label>
                {activeSlots.map((slot) => {
                  const existing = todaySchedule.find((s) => s.meal_slot_index === slot.slot_index);
                  return (
                    <div key={slot.slot_index} className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-950/20 text-left">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
                        <p className="text-xs text-zinc-400">{slot.time_of_day.slice(0, 5)} · {Math.round(gramsPerMeal)}g</p>
                      </div>
                      {existing && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700">{existing.status === 'fed' ? 'Completado' : 'Agendado'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleCookConfirm}
              disabled={(perMealMode ? selectedSlot === null : activeSlots.length === 0) || savingCook}
              className={`w-full rounded-2xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                (perMealMode ? selectedSlot === null : activeSlots.length === 0) ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/20 active:scale-[0.97]"
              }`}
            >
              {savingCook ? "Guardando..." : <><Check className="w-4 h-4" /> Confirmar y Registrar</>}
            </button>
          </div>
        </div>
      )}

      {/* Hide Recipe Modal */}
      {hideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setHideModalOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">¿Por qué ocultas esta receta?</h3>
              <button onClick={() => setHideModalOpen(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">Nos ayuda a mostrarte recetas más relevantes.</p>
            <div className="space-y-2">
              {HIDE_REASONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleHide(r.label)}
                  disabled={hidingRecipe}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-primary-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 transition-all text-left"
                >
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{r.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleHide("")}
              disabled={hidingRecipe}
              className="w-full text-xs text-zinc-400 hover:text-zinc-600 py-2"
            >
              Solo ocultar, no dar motivo
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      <RecipeLightbox open={lightboxOpen} imageUrl={recipe.image_url || ""} onClose={() => setLightboxOpen(false)} />
    </div>
  );
}
