"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, ToxicFood, Dog, DogMetabolicProfile, DogMealSlot, MealSchedule, Walk } from "@/types/database";
import { MealCalendarWidget } from "@/components/MealCalendarWidget";
import { determinarTamano } from "@/lib/breed-sizes";
import {
  getFeedingDefaults, ACTIVITY_LABELS as FS_ACTIVITY_LABELS, MEAL_FREQUENCY,
  calcularRacionDiaria, calcularRacionMixta,
  BARF_PCT_BY_STAGE, CROQUETAS_PCT_BY_STAGE, MIXTA_AJUSTE_RANGE,
} from "@/lib/feeding-standards";
import type { DietType, ActivityLevel, LifeStage } from "@/lib/feeding-standards";
import { getTodayLocal } from "@/lib/dates";
import {
  Search, Plus, Minus, ChefHat, Lock, Check, ShoppingCart,
  AlertTriangle, ShieldCheck, X, Trash2, Sparkles, Clock,
  Flame, ChevronRight, ScanBarcode, UtensilsCrossed, ArrowRight,
  CalendarDays, Heart, EyeOff, Info
} from "lucide-react";

type Tab = "recetario" | "calculadora" | "detox" | "escaner" | "lista" | "plan";

interface Props {
  initialRecipes: NutritionRecipe[];
  toxicFoods: ToxicFood[];
  dog: Dog | null;
  metabolicProfile: DogMetabolicProfile | null;
  detoxDays: { day_number: number; title: string; instructions: string; warning: string | null }[];
  detoxProgress: { day_number: number; completed: boolean }[];
  userId: string;
  mealSlots: DogMealSlot[];
  mealSchedule: (MealSchedule & { recipe: NutritionRecipe | null })[];
  walks: Walk[];
  greenCount: number;
  initialTab?: Tab;
  favoriteRecipeIds: Set<string>;
  hiddenRecipeIds: Map<string, string | null>;
  latestWeightKg?: number;
}

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "recetario", label: "Recetario", icon: ChefHat },
  { key: "plan", label: "Plan", icon: CalendarDays },
  { key: "calculadora", label: "Calculadora", icon: Plus },
  { key: "detox", label: "Detox", icon: Sparkles },
  { key: "lista", label: "Lista", icon: ShoppingCart },
];

/* ================================================================ */
/*  NUTRITION HUB                                                    */
/* ================================================================ */
export function NutritionHub(props: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(props.initialTab ?? "recetario");

  return (
    <div className="space-y-6">
      {/* Top navigation pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                : "bg-white/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 backdrop-blur-sm"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "recetario" && (
        <RecetarioView
          recipes={props.initialRecipes}
          onOpenScanner={() => { setActiveTab("escaner"); }}
          userId={props.userId}
          favoriteIds={props.favoriteRecipeIds}
          hiddenMap={props.hiddenRecipeIds}
          dog={props.dog}
        />
      )}
      {activeTab === "plan" && (
        <PlanTab
          dog={props.dog}
          mealSlots={props.mealSlots}
          mealSchedule={props.mealSchedule}
          metabolicProfile={props.metabolicProfile}
          recipes={props.initialRecipes}
          walksCount={props.walks.length}
          greenWalksCount={props.greenCount}
          latestWeightKg={props.latestWeightKg}
        />
      )}
      {activeTab === "calculadora" && <CalculadoraTab dog={props.dog} metabolicProfile={props.metabolicProfile} latestWeightKg={props.latestWeightKg} />}
      {activeTab === "detox" && <DetoxTab dog={props.dog} detoxDays={props.detoxDays} detoxProgress={props.detoxProgress} />}
      {activeTab === "escaner" && <EscanerTab toxicFoods={props.toxicFoods} />}
      {activeTab === "lista" && <ListaTab userId={props.userId} />}
    </div>
  );
}

/* ================================================================ */
/*  RECETARIO PREMIUM                                                */
/* ================================================================ */
const CATEGORY_META: Record<string, { label: string; icon: string; bg: string; border: string }> = {
  diario: { label: "Menú Diario", icon: "🍖", bg: "bg-primary-50 dark:bg-primary-900/30", border: "border-primary-200 dark:border-primary-800" },
  snack:  { label: "Snacks",      icon: "🍪", bg: "bg-warning-50 dark:bg-warning-900/30", border: "border-warning-200 dark:border-warning-800" },
  helado: { label: "Helados",     icon: "🍦", bg: "bg-secondary-50 dark:bg-secondary-900/30", border: "border-secondary-200 dark:border-secondary-800" },
  pastel: { label: "Pasteles",    icon: "🎂", bg: "bg-accent-50 dark:bg-accent-900/30", border: "border-accent-200 dark:border-accent-800" },
  croquetas: { label: "Croquetas", icon: "🥘", bg: "bg-zinc-50 dark:bg-zinc-900/30", border: "border-zinc-200 dark:border-zinc-800" },
};

function RecetarioView({
  recipes, onOpenScanner, userId, favoriteIds, hiddenMap, dog
}: {
  recipes: NutritionRecipe[];
  onOpenScanner: () => void;
  userId: string;
  favoriteIds: Set<string>;
  hiddenMap: Map<string, string | null>;
  dog: Dog | null;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | "all" | "hidden">("all");
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [showAllCroquetas, setShowAllCroquetas] = useState(false);

  const dogSize = dog ? determinarTamano(dog.raza, dog.peso_kg, dog.edad_meses, dog.tamano) : null;

  const categories = [...new Set(recipes.map((r) => r.category))];
  const hasHidden = hiddenMap.size > 0;

  // Visible recipes (exclude hidden by default)
  const visibleRecipes = useMemo(() => {
    if (selectedCategory === "hidden") {
      return recipes.filter((r) => hiddenMap.has(r.id));
    }
    return recipes.filter((r) => !hiddenMap.has(r.id));
  }, [recipes, hiddenMap, selectedCategory]);

  const proteinTypes = useMemo(() => {
    const types = [...new Set(visibleRecipes
      .filter(r => r.category === "diario" || selectedCategory !== "diario")
      .map((r) => r.protein_type)
      .filter((pt): pt is string => !!pt)
    )];
    return types.sort();
  }, [visibleRecipes, selectedCategory]);

  const filteredRecipes = useMemo(() => {
    let result = visibleRecipes;
    if (selectedCategory !== "all" && selectedCategory !== "hidden") result = result.filter((r) => r.category === selectedCategory);
    if (selectedProtein) result = result.filter((r) => r.protein_type === selectedProtein);
    // Filter croquetas by breed size if dog has a size and "Ver todas" is off
    if (selectedCategory === "croquetas" && dogSize && !showAllCroquetas) {
      const sizeMap: Record<string, string> = { miniatura: "miniatura", pequena: "pequena", mediana: "mediana", grande: "grande", gigante: "gigante" };
      const lookupSize = sizeMap[dogSize] || dogSize;
      result = result.filter(r => r.breed_sizes?.includes(lookupSize));
    }
    return result;
  }, [visibleRecipes, selectedCategory, selectedProtein, dogSize, showAllCroquetas]);

  const favoriteRecipes = useMemo(() => recipes.filter(r => favoriteIds.has(r.id) && !hiddenMap.has(r.id)), [recipes, favoriteIds, hiddenMap]);
  const hasFavorites = favoriteRecipes.length > 0;

  // Popular (diverse, not detox)
  const popular = useMemo(() => {
    const candidates = visibleRecipes.filter((r) => !r.is_detox);
    const seen = new Set<string>();
    const diverse: NutritionRecipe[] = [];
    for (const r of candidates) {
      const key = r.protein_type || r.category;
      if (!seen.has(key)) {
        seen.add(key);
        diverse.push(r);
        if (diverse.length >= 4) break;
      }
    }
    for (const r of candidates) {
      if (!diverse.includes(r)) {
        diverse.push(r);
        if (diverse.length >= 4) break;
      }
    }
    return diverse;
  }, [visibleRecipes]);

  // By category rows
  const recipesByCategory = useMemo(() => {
    const groups: Record<string, NutritionRecipe[]> = {};
    for (const r of visibleRecipes) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }
    return groups;
  }, [visibleRecipes]);

  // Newest
  const newest = [...visibleRecipes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4);

  // Croquetas recomendadas para el tamaño del perro
  const recommendedCroquetas = useMemo(() => {
    if (!dogSize) return [];
    const sizeMap: Record<string, string> = { miniatura: "miniatura", pequena: "pequena", mediana: "mediana", grande: "grande", gigante: "gigante" };
    const lookupSize = sizeMap[dogSize] || dogSize;
    return visibleRecipes.filter(r =>
      r.category === "croquetas" &&
      r.breed_sizes &&
      r.breed_sizes.includes(lookupSize)
    );
  }, [visibleRecipes, dogSize]);

  return (
    <div className="space-y-6">
      {/* Recomendado para el tamaño del perro */}
      {dogSize && recommendedCroquetas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Recomendado para {dogSize === "miniatura" ? "razas miniatura" : dogSize === "pequena" ? "razas pequeñas" : dogSize === "mediana" ? "razas medianas" : dogSize === "grande" ? "razas grandes" : "razas gigantes"} 🐾
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {recommendedCroquetas.map((r) => (
              <RecipeCard key={r.id} recipe={r} size="large" />
            ))}
          </div>
        </section>
      )}

      {/* Scanner banner */}
      <button
        onClick={onOpenScanner}
        className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 transition-transform active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <ScanBarcode className="w-6 h-6" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">Escáner de Alimentos</p>
          <p className="text-xs text-white/80">Verifica si un alimento es seguro para tu perro</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70" />
      </button>

      {/* Categories scrollable */}
      <div>
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Categorías</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
              selectedCategory === "all"
                ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm"
                : "border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Todos</span>
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  selectedCategory === cat
                    ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm"
                    : "border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border ${meta?.bg ?? "bg-zinc-100 dark:bg-zinc-800"} ${meta?.border ?? "border-zinc-200 dark:border-zinc-700"}`}>
                  {meta?.icon ?? "🍽️"}
                </div>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{meta?.label ?? cat}</span>
              </button>
            );
          })}
          {hasHidden && (
            <button
              onClick={() => setSelectedCategory("hidden")}
              className={`shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                selectedCategory === "hidden"
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-950/50 shadow-sm"
                  : "border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-200 dark:border-zinc-700">
                <EyeOff className="w-5 h-5 text-zinc-400" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">Ocultas</span>
            </button>
          )}
        </div>
      </div>

      {/* Protein filter dropdown */}
      {(selectedCategory === "all" || selectedCategory === "diario") && proteinTypes.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Filtrar por proteína:</label>
          <select value={selectedProtein} onChange={e => setSelectedProtein(e.target.value)} className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="">Todas las proteínas</option>
            {proteinTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
          </select>
          {selectedProtein && (
            <button onClick={() => setSelectedProtein("")} className="text-[10px] text-zinc-400 hover:text-zinc-600 font-semibold px-2 py-1">Limpiar</button>
          )}
        </div>
      )}

      {/* Breed size filter for croquetas */}
      {selectedCategory === "croquetas" && dogSize && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Tamaño:</label>
          <div className="flex gap-1">
            <button onClick={() => setShowAllCroquetas(false)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${!showAllCroquetas ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-200 text-zinc-500"}`}>
              Recomendadas
            </button>
            <button onClick={() => setShowAllCroquetas(true)}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${showAllCroquetas ? "border-primary-400 bg-primary-50 text-primary-700" : "border-zinc-200 text-zinc-500"}`}>
              Ver todas
            </button>
          </div>
        </div>
      )}

      {/* VISTA "TODOS" - Carruseles dinámicos */}
      {selectedCategory === "all" && (
        <>
          {/* Favorites — tarjetas grandes tipo Netflix */}
          {hasFavorites && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tus Favoritos ❤️</h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {favoriteRecipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} size="large" />
                ))}
              </div>
            </section>
          )}

          {/* Populares — grilla de 2 columnas */}
          {popular.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Populares</h3>
                <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{visibleRecipes.length} recetas</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {popular.map((r) => (
                  <RecipeCard key={r.id} recipe={r} size="standard" />
                ))}
              </div>
            </section>
          )}

          {/* Filas por categoría — tarjetas estándar en scroll horizontal */}
          {categories.map((cat) => {
            const catRecipes = recipesByCategory[cat];
            if (!catRecipes || catRecipes.length === 0) return null;
            return (
              <section key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{CATEGORY_META[cat]?.label ?? cat}</h3>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-semibold"
                  >
                    Ver todo →
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {catRecipes.map((r) => (
                    <RecipeCard key={r.id} recipe={r} size="standard" />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Nuevas */}
          {newest.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Nuevas</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {newest.map((r) => (
                  <RecipeCard key={r.id} recipe={r} size="standard" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* VISTA POR CATEGÍA / HIDDEN — grid normal */}
      {selectedCategory !== "all" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {selectedCategory === "hidden" ? "Recetas ocultas" : CATEGORY_META[selectedCategory]?.label ?? selectedCategory}
            </h3>
            <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{filteredRecipes.length} recetas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} size="standard" />
            ))}
          </div>
        </>
      )}

      {/* If no results */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-10 text-zinc-400">
          <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron recetas</p>
          <p className="text-xs mt-1">Prueba con otra búsqueda o categoría</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  RECIPE CARD — 3 tamaños                                          */
/* ================================================================ */
function RecipeCard({ recipe, size = "standard" }: { recipe: NutritionRecipe; size?: "standard" | "large" | "wide" }) {
  const categoryMeta = CATEGORY_META[recipe.category];

  if (size === "large") {
    // Netflix-style tall card
    return (
      <Link
        href={`/guau/app/nutricion/recetario/${recipe.id}`}
        className="shrink-0 w-40 snap-start card-soft rounded-[1.25rem] p-2.5 hover:shadow-lg transition-all active:scale-[0.97] block group"
      >
        <div className="relative w-full aspect-[3/4] rounded-2xl mb-2 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-white to-accent-50 dark:from-primary-900/40 dark:via-zinc-900/40 dark:to-accent-900/40 isolate">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <ChefHat className={`w-10 h-10 transition-transform group-hover:scale-110 ${recipe.is_therapeutic ? "text-accent-400" : "text-primary-400"}`} />
          )}
          {recipe.is_therapeutic && (
            <span className="absolute top-2 right-2 bg-accent-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">Terapéutico</span>
          )}
        </div>
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{recipe.title}</h4>
        <div className="flex items-center gap-2 mt-1">
        {(recipe.prep_time_min ?? 0) > 0 && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{recipe.prep_time_min}m
          </span>
        )}
        {(recipe.kcal_per_100g ?? 0) > 0 && (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />{Math.round(recipe.kcal_per_100g ?? 0)}
                </span>
              )}
              {recipe.is_therapeutic && (
                <span className="text-[9px] font-bold bg-accent-100 text-accent-700 px-1.5 py-0.5 rounded-full">Terapéutico</span>
              )}
            </div>
            {recipe.category === "croquetas" && recipe.breed_sizes.length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-1">
                {recipe.breed_sizes.map(s => (
                  <span key={s} className="text-[8px] bg-primary-50 text-primary-600 px-1 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}
            {recipe.category === "croquetas" && recipe.source_book && (
              <p className="text-[8px] text-zinc-400 mt-0.5 truncate">{recipe.source_book}</p>
            )}
        </Link>
    );
  }

  // Standard square card
  return (
    <Link
      href={`/guau/app/nutricion/recetario/${recipe.id}`}
      className="shrink-0 w-40 snap-start card-soft rounded-[1.25rem] p-3 hover:shadow-lg transition-all active:scale-[0.97] block group"
    >
      <div className="relative w-full aspect-square rounded-2xl mb-2 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-white to-accent-50 dark:from-primary-900/40 dark:via-zinc-900/40 dark:to-accent-900/40 isolate">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <ChefHat className={`w-10 h-10 transition-transform group-hover:scale-110 ${recipe.is_therapeutic ? "text-accent-400" : "text-primary-400"}`} />
        )}
        {recipe.is_therapeutic && (
          <span className="absolute top-2 right-2 bg-accent-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">Terapéutico</span>
        )}
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
        </div>
      </div>
      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{recipe.title}</h4>
      <div className="flex items-center gap-2 mt-1.5">
              {(recipe.prep_time_min ?? 0) > 0 && (
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />{recipe.prep_time_min}m
                </span>
              )}
              {(recipe.kcal_per_100g ?? 0) > 0 && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-orange-400" />{Math.round(recipe.kcal_per_100g ?? 0)}
          </span>
        )}
      </div>
      {recipe.category === "croquetas" && recipe.protein_type && (
        <p className="text-[8px] text-primary-600 mt-0.5 truncate">{recipe.protein_type}</p>
      )}
      {recipe.category === "croquetas" && recipe.source_book && (
        <p className="text-[8px] text-zinc-400 mt-0.5 truncate">{recipe.source_book}</p>
      )}
    </Link>
  );
}

/* ================================================================ */
/*  DETOX                                                            */
/* ================================================================ */
function DetoxTab({ dog, detoxDays, detoxProgress }: { dog: Dog | null; detoxDays: Props["detoxDays"]; detoxProgress: Props["detoxProgress"] }) {
  const supabase = createClient();
  const [progressState, setProgressState] = useState(detoxProgress);
  const completedDays = progressState.filter((p) => p.completed).map((p) => p.day_number);
  const maxUnlocked = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1;

  const markDay = async (day: number) => {
    if (!dog || day > maxUnlocked || completedDays.includes(day)) return;
    const { error } = await supabase.from("detox_progress").upsert(
      { dog_id: dog.id, day_number: day, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "dog_id,day_number" }
    );
    if (!error) {
      setProgressState((prev) => [...prev.filter((p) => p.day_number !== day), { day_number: day, completed: true }]);
    }
  };

  if (!dog) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-3">
      <div className="card-soft rounded-[1.5rem] p-4 bg-warning-50/60 dark:bg-warning-950/20 border-warning-200/50 dark:border-warning-900/30">
        <p className="text-sm text-warning-700 dark:text-warning-300 font-bold">Reto Detox 14 Días</p>
        <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">Transición de croquetas a alimentación natural. Completa un día a la vez.</p>
      </div>
      {detoxDays.map((day) => {
        const isCompleted = completedDays.includes(day.day_number);
        const isUnlocked = day.day_number <= maxUnlocked;
        return (
          <div
            key={day.day_number}
            className={`rounded-[1.25rem] p-3.5 ${
              isCompleted ? "card-soft bg-secondary-50/60 dark:bg-secondary-950/20" : isUnlocked ? "card-soft" : "card-soft opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted ? "bg-secondary-500 text-white" : isUnlocked ? "bg-primary-100 dark:bg-primary-900 text-primary-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : isUnlocked ? day.day_number : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">Día {day.day_number}: {day.title}</h4>
                {isUnlocked && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{day.instructions}</p>}
              </div>
              {isUnlocked && !isCompleted && (
                <button onClick={() => markDay(day.day_number)} className="shrink-0 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 text-xs font-bold transition-colors active:scale-95">
                  Listo
                </button>
              )}
            </div>
            {day.warning && isUnlocked && (
              <p className="text-[10px] text-warning-600 dark:text-warning-400 mt-2 pl-10">{day.warning}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================ */
/*  ESCANER                                                          */
/* ================================================================ */
function EscanerTab({ toxicFoods }: { toxicFoods: ToxicFood[] }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"todos" | "mortal" | "alto" | "bajo" | "seguros">("todos");
  const [recents, setRecents] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("blis_food_recents") || "[]"); } catch { return []; }
  });

  const saveRecent = (q: string) => {
    const updated = [q, ...recents.filter((r) => r !== q)].slice(0, 15);
    setRecents(updated);
    localStorage.setItem("blis_food_recents", JSON.stringify(updated));
  };

  // Búsqueda fuzzy simple (compara normalizando caracteres)
  const fuzzyMatch = (text: string, q: string): number => {
    const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const s = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (t.includes(s)) return 10; // coincidencia exacta
    // Buscar palabras individuales
    const words = s.split(/\s+/).filter((w) => w.length > 1);
    let score = 0;
    for (const w of words) {
      if (t.includes(w)) score += 5;
      // Tolerancia a 1 caracter de diferencia por cada 4 letras
      else if (w.length >= 4) {
        for (let i = 0; i <= t.length - w.length + 1; i++) {
          let matches = 0;
          for (let j = 0; j < w.length; j++) {
            if (t[i + j] === w[j]) matches++;
          }
          if (matches >= w.length - 1) { score += 3; break; }
        }
      }
    }
    return score;
  };

  const doSearch = () => {
    if (!query.trim()) return;
    setSearched(true);
    saveRecent(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") doSearch();
  };

  // Resultados
  const results = searched && query.trim()
    ? toxicFoods
        .map((f) => ({ food: f, score: fuzzyMatch(f.name, query) + fuzzyMatch(f.explanation || "", query) * 0.5 + fuzzyMatch(f.symptoms || "", query) * 0.3 }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.food)
    : [];

  // Filtrar por tipo
  const filtered = results.filter((f) => {
    if (filter === "todos") return true;
    if (filter === "seguros") return !f.is_toxic;
    if (filter === "mortal") return f.severity === "mortal";
    if (filter === "alto") return f.severity === "alto";
    if (filter === "bajo") return f.severity === "bajo" || f.severity === "medio";
    return true;
  });

  // Sugerencias (misma categoría, excluyendo resultados)
  const mainResult = results[0];
  const suggestions = mainResult
    ? toxicFoods
        .filter((f) => f.category === mainResult.category && f.id !== mainResult.id && !results.some((r) => r.id === f.id))
        .slice(0, 3)
    : [];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? `<mark class="bg-warning-200 dark:bg-warning-800 text-warning-900 dark:text-warning-100 rounded px-0.5">${p}</mark>`
        : p
    ).join("");
  };

  const severityBadge = (f: ToxicFood) => {
    if (!f.is_toxic) return { emoji: "✅", label: "Seguro", bg: "bg-secondary-100 dark:bg-secondary-900/30", text: "text-secondary-700 dark:text-secondary-300" };
    if (f.severity === "mortal") return { emoji: "☠️", label: "Mortal", bg: "bg-danger-100 dark:bg-danger-900/30", text: "text-danger-700 dark:text-danger-300" };
    if (f.severity === "alto") return { emoji: "🔴", label: "Alto", bg: "bg-danger-100 dark:bg-danger-900/30", text: "text-danger-700 dark:text-danger-300" };
    if (f.severity === "bajo" || f.severity === "medio") return { emoji: "🟡", label: "Precaución", bg: "bg-warning-100 dark:bg-warning-900/30", text: "text-warning-700 dark:text-warning-300" };
    return { emoji: "ℹ️", label: "", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-500" };
  };

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
          onKeyDown={handleKeyDown}
          placeholder="Ej: chocolate, uvas, cebolla..."
          className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <button onClick={doSearch}
          className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-bold transition-all active:scale-95 flex items-center gap-1.5">
          <Search className="w-4 h-4" /> Buscar
        </button>
      </div>

      {/* Recientes (scroll horizontal) */}
      {recents.length > 0 && !searched && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-zinc-400 pl-1">Recientes</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {recents.map((r, i) => (
              <button key={i} onClick={() => { setQuery(r); setSearched(true); saveRecent(r); }}
                className="shrink-0 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full px-3 py-1.5 text-zinc-600 dark:text-zinc-400 transition-colors whitespace-nowrap">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "todos", label: "🌐 Todos" },
          { key: "mortal", label: "☠️ Mortal" },
          { key: "alto", label: "🔴 Alto" },
          { key: "bajo", label: "🟡 Precaución" },
          { key: "seguros", label: "✅ Seguros" },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
            className={`shrink-0 text-[10px] font-semibold rounded-full px-2.5 py-1.5 transition-all border ${
              filter === f.key
                ? "bg-primary-50 dark:bg-primary-950/30 border-primary-400 text-primary-700 dark:text-primary-300"
                : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {searched && query.trim() && (
        <>
          <p className="text-[10px] text-zinc-400 pl-1">
            {filtered.length > 0 ? `Resultados: ${filtered.length}` : "Sin resultados"}
          </p>

          {filtered.length === 0 && (
            <p className="text-center text-sm text-zinc-400 py-6">
              No se encontraron alimentos. Prueba con otra palabra.
            </p>
          )}

          <div className="space-y-2">
            {filtered.map((f, idx) => {
              const badge = severityBadge(f);
              const isOpen = expanded.has(f.id);
              const isHighlighted = idx === 0 && mainResult?.id === f.id;
              return (
                <div key={f.id}
                  className={`card-soft rounded-xl overflow-hidden transition-all cursor-pointer ${
                    isHighlighted ? "ring-2 ring-warning-400 dark:ring-warning-600 shadow-md" : ""
                  }`}
                  onClick={() => toggleExpand(f.id)}
                >
                  <div className="p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base ${badge.bg}`}>
                      {badge.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate"
                          dangerouslySetInnerHTML={{ __html: highlight(f.name, query) }} />
                        <span className={`text-[9px] font-semibold rounded-full px-1.5 py-0.5 shrink-0 ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>
                      {f.is_toxic && f.explanation && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                          {f.explanation.slice(0, 80)}...
                        </p>
                      )}
                    </div>
                    <span className="text-zinc-400 text-sm shrink-0">{isOpen ? "▲" : "▶"}</span>
                  </div>

                  {/* Expandido */}
                  {isOpen && (
                    <div className="px-3 pb-3 pt-0 space-y-2 border-t border-zinc-100 dark:border-zinc-800">
                      {f.is_toxic && f.explanation && (
                        <div>
                          <p className="text-[10px] font-semibold text-zinc-500 mb-0.5">📋 Explicación</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: highlight(f.explanation, query) }} />
                        </div>
                      )}
                      {f.symptoms && (
                        <div>
                          <p className="text-[10px] font-semibold text-zinc-500 mb-0.5">🩺 Síntomas</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.symptoms}</p>
                        </div>
                      )}
                      {f.category && (
                        <p className="text-[10px] text-zinc-400">
                          📂 {f.category.charAt(0).toUpperCase() + f.category.slice(1)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-zinc-400 pl-1">También te puede interesar</p>
              {suggestions.map((f) => {
                const badge = severityBadge(f);
                const isOpen = expanded.has(f.id);
                return (
                  <div key={f.id}
                    className="card-soft rounded-xl overflow-hidden transition-all cursor-pointer opacity-80 hover:opacity-100"
                    onClick={() => toggleExpand(f.id)}
                  >
                    <div className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm ${badge.bg}`}>
                        {badge.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{f.name}</p>
                          <span className={`text-[8px] font-semibold rounded-full px-1.5 py-0.5 shrink-0 ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Misma categoría: {f.category}</p>
                      </div>
                      <span className="text-zinc-400 text-xs shrink-0">{isOpen ? "▲" : "▶"}</span>
                    </div>
                    {isOpen && f.explanation && (
                      <div className="px-3 pb-3 pt-0 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-zinc-500 mb-0.5">📋 Explicación</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.explanation}</p>
                        {f.symptoms && <p className="text-xs text-zinc-500 mt-1"><b>Síntomas:</b> {f.symptoms}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Estado inicial sin búsqueda */}
      {!searched && (
        <div className="text-center py-8 space-y-2">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Escribe un alimento y toca <b>Buscar</b></p>
          <p className="text-xs text-zinc-400">Ej: chocolate, uvas, cebolla, pollo, zanahoria...</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  CALCULADORA                                                      */
/* ================================================================ */
function CalculadoraTab({ dog, metabolicProfile, latestWeightKg }: { dog: Dog | null; metabolicProfile: DogMetabolicProfile | null; latestWeightKg?: number }) {
  const supabase = createClient();
  const weight = latestWeightKg ?? dog?.peso_kg ?? 0;

  const defaults = dog ? getFeedingDefaults({
    raza: dog.raza, peso_kg: weight, edad_meses: dog.edad_meses, tamano_guardado: dog.tamano,
  }) : null;
  const lifeStage: LifeStage = defaults?.life_stage ?? "adulto";

  const [dietType, setDietType] = useState<DietType>(
    (metabolicProfile?.diet_type as DietType) ?? defaults?.diet_type ?? "croquetas"
  );
  const [activity, setActivity] = useState<ActivityLevel>(
    metabolicProfile?.activity_level ?? defaults?.activity_level ?? "moderado"
  );
  const [feedingPct, setFeedingPct] = useState(metabolicProfile?.feeding_pct ?? defaults?.feeding_pct ?? 2.5);
  const [mixtaBarfProp, setMixtaBarfProp] = useState(50);
  const [expertMode, setExpertMode] = useState(false);
  const [meatPct, setMeatPct] = useState(metabolicProfile?.custom_meat_pct ?? 50);
  const [bonePct, setBonePct] = useState(metabolicProfile?.custom_bone_pct ?? 20);
  const [organPct, setOrganPct] = useState(metabolicProfile?.custom_organ_pct ?? 10);
  const [veggiePct, setVeggiePct] = useState(metabolicProfile?.custom_veggie_pct ?? 20);
  const [infoModal, setInfoModal] = useState<{ open: boolean; title: string; icon: string; body: string; example: string }>({ open: false, title: "", icon: "💡", body: "", example: "" });

  // Computed racion
  let total = 0, kcalTotal = 0, barfGrams = 0, croqGrams = 0;
  if (dietType === "mixta") {
    const ajusteGlobal = feedingPct / 100;
    const result = calcularRacionMixta({
      peso_kg: weight, life_stage: lifeStage,
      proporcion_barf: mixtaBarfProp, activity_level: activity, ajuste_global: ajusteGlobal,
    });
    barfGrams = result.barf_grams; croqGrams = result.croquetas_grams;
    total = barfGrams + croqGrams; kcalTotal = result.total_kcal;
  } else {
    const result = calcularRacionDiaria({ peso_kg: weight, feeding_pct: feedingPct, diet_type: dietType, activity_level: activity });
    total = result.total_grams; kcalTotal = result.total_kcal;
    if (dietType === "barf") barfGrams = total;
    else croqGrams = total;
  }

  const pctRange = dietType === "barf" ? BARF_PCT_BY_STAGE[lifeStage] :
    dietType === "croquetas" ? CROQUETAS_PCT_BY_STAGE[lifeStage] :
    null; // mixta usa ajuste global, no pctRange

  const handleSave = async () => {
    if (!dog) return;
    const payload: any = {
      dog_id: dog.id, feeding_pct: feedingPct, activity_level: activity,
      diet_type: dietType, custom_meat_pct: meatPct, custom_bone_pct: bonePct,
      custom_organ_pct: organPct, custom_veggie_pct: veggiePct,
    };
    const { error } = await supabase.from("dog_metabolic_profiles").upsert(payload, { onConflict: "dog_id" });
    if (error) {
      console.warn("diet_type puede no existir, guardando sin ella:", error.message);
      delete payload.diet_type;
      await supabase.from("dog_metabolic_profiles").upsert(payload, { onConflict: "dog_id" });
    }
  };

  if (!dog) return <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-5">
      <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Calculadora de ración diaria</h3>

        {/* Tipo de dieta: 3 botones */}
        <div className="flex items-center gap-1.5 mb-1">
          <label className="text-[10px] text-zinc-400">Tipo de alimentación</label>
          <button
            onClick={() => setInfoModal({
              open: true, icon: "🍽️",
              title: "Tipos de alimentación",
              example: "Elige según tu estilo de vida y el de tu perro",
              body: "🦴  Croquetas\nAlimento seco y procesado. Muy práctico: solo sirves y listo. Es concentrado (poca agua), por eso tu perro come menos gramos. Ideal si tienes poco tiempo.\n\n🥩  Natural / BARF\nComida cruda: carne, huesos carnosos, vísceras y vegetales. Tiene ~70% de agua, así que tu perro come más volumen. Ventajas: hidratación natural, nutrientes sin procesar, mejor digestión.\n\n⚖️  Mixta\nCombinas croquetas + comida natural. Lo mejor de dos mundos: la practicidad de las croquetas con los beneficios de la comida natural."
            })}
            className="w-3.5 h-3.5 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
          >
            <Info className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "croquetas" as DietType, label: "Croquetas", icon: "🦴" },
            { key: "barf" as DietType, label: "Natural", icon: "🥩" },
            { key: "mixta" as DietType, label: "Mixta", icon: "⚖️" },
          ].map((opt) => (
            <button key={opt.key} onClick={() => {
              setDietType(opt.key);
              if (opt.key === "mixta") {
                setFeedingPct(100);
              } else if (opt.key === "croquetas") {
                setFeedingPct(CROQUETAS_PCT_BY_STAGE[lifeStage].default);
              } else {
                setFeedingPct(BARF_PCT_BY_STAGE[lifeStage].default);
              }
            }}
              className={`rounded-xl py-2 text-xs font-bold transition-all border-2 ${
                dietType === opt.key
                  ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-700 dark:text-primary-300"
                  : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
              }`}
            >
              <span className="text-base block">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Actividad */}
        <div>
          <label className="text-[10px] text-zinc-400 block mb-1">Nivel de actividad</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs">
            {Object.entries(FS_ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Resumen gramos */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-zinc-800" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{total}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">gramos/día</span>
              <span className="text-[10px] text-zinc-400">{kcalTotal} kcal</span>
            </div>
          </div>
        </div>

        {/* Detalle mixta */}
        {dietType === "mixta" && (
          <div className="text-center space-y-0.5 -mt-2">
            <p className="text-[10px] text-zinc-500">🦴 Croquetas: {croqGrams}g · 🥩 Natural: {barfGrams}g</p>
          </div>
        )}
        {dietType === "croquetas" && (
          <p className="text-[10px] text-zinc-400 text-center -mt-2">
            ≈ {Math.round((total / 110) * 10) / 10} tazas/día
          </p>
        )}

        {/* Slider principal: % peso para BARF/Croquetas, ajuste global para mixta */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">
                {dietType === "mixta" ? "Ajuste de cantidad total" : "% del peso corporal"}
              </span>
              <button
                onClick={() => setInfoModal({
                  open: true, icon: dietType === "mixta" ? "🎚️" : "📐",
                  title: dietType === "mixta" ? "Ajuste de cantidad total" : "% del peso corporal",
                  example: dietType === "mixta"
                    ? "Ejemplo real: 960g estándar → 70% = 672g → 130% = 1.248g"
                    : "Peso del perro × porcentaje ÷ 100 = gramos diarios",
                  body: dietType === "mixta"
                    ? "El sistema ya calculó la cantidad ideal combinando croquetas y comida natural según peso, edad y actividad de tu perro.\n\nEste ajuste te permite adaptar esa ración a la vida real:\n\n🏠  Perro casero → 80-90% para evitar sobrepeso\n🐕  Perro normal con paseos → 100%\n🏃  Perro muy activo o de trabajo → 110-120%\n\n📐  Ejemplo práctico:\nSi el sistema calculó 960g/día como ración estándar:\n· 80% = 768g (perro sedentario)\n· 100% = 960g (perro normal)\n· 120% = 1.152g (perro muy activo)"
                    : "Es la forma de calcular cuánta comida necesita tu perro por día.\n\n📐  Fórmula: Peso actual (kg) × 1000 × (porcentaje ÷ 100)\n\n🧮  Ejemplo: 20 kg × 1000 × 3% = 600 g/día\n\n💧  La comida natural (BARF) necesita un % más alto (~7%) porque tiene ~70% de agua.\n🦴  Las croquetas necesitan un % menor (~2.2%) porque son más concentradas."
                })}
                className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
              {dietType === "mixta" ? `${Math.round(feedingPct)}%` : `${feedingPct.toFixed(1)}%`}
            </span>
          </div>
          <input type="range"
            min={dietType === "mixta" ? MIXTA_AJUSTE_RANGE.min : (pctRange?.min ?? 1.5)}
            max={dietType === "mixta" ? MIXTA_AJUSTE_RANGE.max : (pctRange?.max ?? 8)}
            step={dietType === "mixta" ? 5 : 0.1}
            value={feedingPct}
            onChange={(e) => setFeedingPct(Number(e.target.value))}
            className="w-full accent-primary-600" />
          <p className="text-[10px] text-zinc-400">
            {dietType === "mixta"
              ? `${MIXTA_AJUSTE_RANGE.min}-${MIXTA_AJUSTE_RANGE.max}% = ración estándar ajustable. 100% es la cantidad recomendada.`
              : `Recomendado: ${pctRange?.min}-${pctRange?.max}% (${lifeStage === "cachorro" ? "cachorro" : lifeStage === "adolescente" ? "adolescente" : "adulto"})`
            }
          </p>
        </div>

        {/* Slider proporción BARF (solo mixta) */}
        {dietType === "mixta" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500">Proporción Natural</span>
                <button
                  onClick={() => setInfoModal({ open: true, icon: "🥩", title: "¿Qué es la dieta Natural (BARF)?", example: "Comida cruda biológicamente apropiada", body: "BARF = Biologically Appropriate Raw Food\n\nIncluye:\n🥩  Carne cruda magra (res, pollo, pavo)\n🦴  Huesos carnosos blandos (cuellos, alas)\n🫀  Vísceras (hígado, riñón, bazo)\n🥬  Vegetales y frutas trituradas\n\nVentajas:\n💧  Más hidratación (~70% agua)\n🧬  Nutrientes sin procesar\n🐕  Mejor digestión y menos alergias\n\nImportante: como tiene más agua, tu perro come MÁS gramos que con croquetas. Por eso el % sugerido es más alto (6-8% cachorros, 2-3% adultos)." })}
                  className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
            </div>
            {/* Porcentajes explícitos */}
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-primary-600 dark:text-primary-400">🦴 Croquetas {100 - mixtaBarfProp}%</span>
              <span className="text-accent-600 dark:text-accent-400">{mixtaBarfProp}% Natural 🥩</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={mixtaBarfProp}
              onChange={(e) => setMixtaBarfProp(Number(e.target.value))}
              className="w-full accent-zinc-400" />
            {mixtaBarfProp > 0 && mixtaBarfProp < 100 && (
              <p className="text-[10px] text-zinc-500 text-center pt-1">
                🦴 {croqGrams}g croquetas + 🥩 {barfGrams}g natural
              </p>
            )}
          </div>
        )}

        {/* Frecuencia recomendada */}
        {defaults && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-500">
              🕐 {MEAL_FREQUENCY[defaults.life_stage]?.recommended ?? 3} comidas/día recomendadas
            </p>
          </div>
        )}

        {expertMode && (
          <div className="space-y-3 pt-2">
            <p className="text-[10px] text-zinc-400 text-center">Distribución BARF</p>
            {[
              { label: "Carne", pct: meatPct, set: setMeatPct },
              { label: "Hueso carnoso", pct: bonePct, set: setBonePct },
              { label: "Vísceras", pct: organPct, set: setOrganPct },
              { label: "Vegetales", pct: veggiePct, set: setVeggiePct },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  <span className="text-[10px] text-zinc-400">{item.pct}% · {Math.round((dietType === "mixta" ? barfGrams : total) * (item.pct / 100))}g</span>
                </div>
                <input type="range" min={0} max={100} value={item.pct} onChange={(e) => item.set(Number(e.target.value))} className="w-full accent-primary-600" />
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={() => setExpertMode(!expertMode)} className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {expertMode ? "Modo simple" : "Modo experto"}
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold">
            Guardar
          </button>
        </div>

        {/* Info Modal */}
        {infoModal.open && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInfoModal({ ...infoModal, open: false })} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[1.5rem] px-5 pt-6 pb-8 max-w-md w-full shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-accent-100/40 dark:from-accent-950/30 to-transparent pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent-100 dark:bg-accent-950/50 flex items-center justify-center text-2xl shrink-0">
                  {infoModal.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{infoModal.title}</h3>
                  {infoModal.example && (
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{infoModal.example}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">{infoModal.body}</p>
              <button onClick={() => setInfoModal({ ...infoModal, open: false })}
                className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-bold transition-all active:scale-[0.98]">
                ¡Entendido!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  PLAN TAB                                                         */
/* ================================================================ */
function PlanTab(props: {
  dog: Dog | null;
  mealSlots: DogMealSlot[];
  mealSchedule: (MealSchedule & { recipe: NutritionRecipe | null })[];
  metabolicProfile: DogMetabolicProfile | null;
  recipes: NutritionRecipe[];
  walksCount: number;
  greenWalksCount: number;
  latestWeightKg?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-primary-600" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Plan de Alimentación</h2>
      </div>
      {props.dog ? (
        <MealCalendarWidget
          dog={props.dog}
          mealSlots={props.mealSlots}
          mealSchedule={props.mealSchedule}
          metabolicProfile={props.metabolicProfile}
          recipes={props.recipes}
          walksCount={props.walksCount}
          greenWalksCount={props.greenWalksCount}
          latestWeightKg={props.latestWeightKg}
        />
      ) : (
        <p className="text-zinc-500 text-center py-8">Registra un perro primero para ver tu plan de alimentación.</p>
      )}
    </div>
  );
}

/* ================================================================ */
/*  LISTA DE COMPRAS INTELIGENTE                                     */
/* ================================================================ */
function ListaTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [view, setView] = useState<"generator" | "history" | "stores">("generator");
  const [startDate, setStartDate] = useState(() => { const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; });
  const [endDate, setEndDate] = useState(() => { const d = new Date(); d.setDate(d.getDate()+7); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; });
  const [generating, setGenerating] = useState(false);
  const [listData, setListData] = useState<{ combined: any[]; byDog: any[] } | null>(null);
  const [groupMode, setGroupMode] = useState<"combined" | "byDog">("combined");
  const [stores, setStores] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<any>(null);
  const [purchaseForm, setPurchaseForm] = useState({ quantity: "", quantity_unit: "kg", price_total: "", currency: "PEN", store_id: "", notes: "" });
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");

  useEffect(() => { loadStores(); }, []);

  const loadStores = async () => {
    const res = await fetch(`/api/shopping-list/stores?user_id=${userId}`);
    const j = await res.json();
    setStores(j.data || []);
  };

  const generateList = async () => {
    setGenerating(true);
    const res = await fetch("/api/shopping-list/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, startDate, endDate }),
    });
    const j = await res.json();
    setListData(j.data || { combined: [], byDog: [] });
    setGenerating(false);
  };

  const openPurchase = (item: any) => {
    setPurchaseItem(item);
    setPurchaseForm({ quantity: "", quantity_unit: item.unit_type === 'g' || item.unit_type === 'kg' ? 'kg' : 'unidad', price_total: "", currency: "PEN", store_id: "", notes: "" });
    setShowPurchaseModal(true);
  };

  const savePurchase = async () => {
    if (!purchaseItem || !purchaseForm.quantity || !purchaseForm.price_total) return;
    setSavingPurchase(true);
    await fetch("/api/shopping-list/purchase", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        ingredient_name: purchaseItem.ingredient_name,
        store_id: purchaseForm.store_id || null,
        quantity: parseFloat(purchaseForm.quantity),
        quantity_unit: purchaseForm.quantity_unit,
        currency: purchaseForm.currency,
        price_total: parseFloat(purchaseForm.price_total),
        purchase_date: getTodayLocal(),
        notes: purchaseForm.notes,
      }),
    });
    setSavingPurchase(false);
    setShowPurchaseModal(false);
    if (listData) {
      const mark = (items: any[]) => items.map((it: any) => it.ingredient_name === purchaseItem.ingredient_name ? { ...it, purchased: true } : it);
      setListData({ combined: mark(listData.combined), byDog: listData.byDog.map((d: any) => ({ ...d, items: mark(d.items) })) });
    }
  };

  const addStore = async () => {
    if (!newStoreName.trim()) return;
    await fetch("/api/shopping-list/stores", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, name: newStoreName, location: newStoreLocation }),
    });
    setNewStoreName(""); setNewStoreLocation("");
    loadStores();
  };

  const loadHistory = async () => {
    const res = await fetch(`/api/shopping-list/history?user_id=${userId}`);
    const j = await res.json();
    setHistory(j.data || []);
  };

  const toLocalDateStr = (d: Date) => { const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; };

  const groupedByType = (items: any[]) => {
    const groups: Record<string, any[]> = {};
    items.forEach((item) => {
      const type = item.ingredient_type || "otro";
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });
    return groups;
  };

  const INGREDIENT_TYPE_LABELS: Record<string, string> = { proteina: "Proteínas", hueso: "Huesos", viscera: "Vísceras", vegetal: "Vegetales", suplemento: "Suplementos", otro: "Otros" };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
        <button onClick={() => setView("generator")} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${view === "generator" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Generar Lista</button>
        <button onClick={() => { setView("history"); loadHistory(); }} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${view === "history" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Historial</button>
        <button onClick={() => setView("stores")} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${view === "stores" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Tiendas</button>
      </div>

      {view === "generator" && (
        <div className="space-y-4">
          {/* Date range */}
          <div className="card-soft rounded-[1.5rem] p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Rango de fechas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Desde</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Hasta</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={generateList} disabled={generating} className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white py-2.5 text-sm font-bold flex items-center justify-center gap-2">
              {generating ? "Generando..." : <><Sparkles className="w-4 h-4" /> Generar Lista de Compras</>}
            </button>
          </div>

          {/* Results */}
          {listData && (
            <>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                <button onClick={() => setGroupMode("combined")} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${groupMode === "combined" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Todos los perros</button>
                <button onClick={() => setGroupMode("byDog")} className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${groupMode === "byDog" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Por perro</button>
              </div>

              {groupMode === "combined" && (
                <div className="space-y-3">
                  {Object.entries(groupedByType(listData.combined)).map(([type, items]) => (
                    <div key={type} className="card-soft rounded-[1.5rem] p-4 space-y-2">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{INGREDIENT_TYPE_LABELS[type] || type}</h4>
                      {items.map((item: any) => (
                        <div key={item.ingredient_name} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${item.purchased ? "bg-secondary-50/60 opacity-60" : "bg-white/50 dark:bg-zinc-800/30"}`}>
                          <span className="font-semibold flex-1">{item.ingredient_name}</span>
                          <span className="text-xs text-zinc-500">
                            {item.pieces ? `${item.pieces} ${item.display_unit || item.unit_type}` : `${item.total_g}g`}
                          </span>
                          {!item.purchased && (
                            <button onClick={() => openPurchase(item)} className="text-primary-600 text-[10px] font-bold bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded-lg">Registrar</button>
                          )}
                          {item.purchased && <Check className="w-4 h-4 text-secondary-500" />}
                        </div>
                      ))}
                    </div>
                  ))}
                  {listData.combined.length === 0 && (
                    <p className="text-center text-sm text-zinc-400 py-8">No hay recetas agendadas en este rango de fechas.</p>
                  )}
                </div>
              )}

              {groupMode === "byDog" && (
                <div className="space-y-4">
                  {listData.byDog.map((dog: any) => (
                    <div key={dog.dog_id} className="card-soft rounded-[1.5rem] p-4 space-y-2">
                      <h4 className="text-sm font-bold text-primary-700 dark:text-primary-300">{dog.dog_name}</h4>
                      {dog.items.map((item: any) => (
                        <div key={item.ingredient_name} className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${item.purchased ? "bg-secondary-50/60 opacity-60" : "bg-white/50 dark:bg-zinc-800/30"}`}>
                          <span className="font-semibold flex-1">{item.ingredient_name}</span>
                          <span className="text-xs text-zinc-500">{item.pieces ? `${item.pieces} ${item.display_unit || item.unit_type}` : `${item.total_g}g`}</span>
                          {!item.purchased && (
                            <button onClick={() => openPurchase(item)} className="text-primary-600 text-[10px] font-bold bg-primary-50 dark:bg-primary-950/30 px-2 py-1 rounded-lg">Registrar</button>
                          )}
                          {item.purchased && <Check className="w-4 h-4 text-secondary-500" />}
                        </div>
                      ))}
                      {dog.items.length === 0 && <p className="text-xs text-zinc-400">Sin recetas agendadas.</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="space-y-3">
          {history.length === 0 && <p className="text-center text-sm text-zinc-400 py-8">Aún no has registrado compras.</p>}
          {history.map((h: any) => (
            <div key={h.id} className="card-soft rounded-[1.25rem] p-4 text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{h.ingredient_name}</span>
                <span className="text-xs text-zinc-400">{h.purchase_date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{h.quantity} {h.quantity_unit}</span>
                <span>·</span>
                <span>{h.currency} {h.price_total?.toFixed(2)}</span>
                {h.price_per_kg && <span>· {h.currency} {h.price_per_kg.toFixed(2)}/kg</span>}
              </div>
              {h.store && <span className="text-[10px] text-primary-600 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">{h.store.name}</span>}
            </div>
          ))}
        </div>
      )}

      {view === "stores" && (
        <div className="space-y-4">
          <div className="card-soft rounded-[1.5rem] p-4 space-y-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Mis Tiendas</h3>
            <div className="space-y-2">
              <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="Nombre de la tienda" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              <input value={newStoreLocation} onChange={e => setNewStoreLocation(e.target.value)} placeholder="Ubicación (opcional)" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              <button onClick={addStore} className="w-full rounded-xl bg-primary-600 text-white py-2 text-sm font-bold">Añadir Tienda</button>
            </div>
          </div>
          <div className="space-y-2">
            {stores.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-[1.25rem] card-soft text-sm">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 flex items-center justify-center font-bold text-xs">{s.name[0]}</div>
                <div className="flex-1">
                  <p className="font-semibold">{s.name}</p>
                  {s.location && <p className="text-xs text-zinc-400">{s.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && purchaseItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowPurchaseModal(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Registrar Compra</h3>
              <button onClick={() => setShowPurchaseModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/30">
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{purchaseItem.ingredient_name}</p>
              <p className="text-xs text-zinc-500">Necesitas: {purchaseItem.pieces ? `${purchaseItem.pieces} ${purchaseItem.display_unit || purchaseItem.unit_type}` : `${purchaseItem.total_g}g`}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Cantidad comprada</label>
                <input type="number" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Unidad</label>
                <select value={purchaseForm.quantity_unit} onChange={e => setPurchaseForm({...purchaseForm, quantity_unit: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                  <option value="kg">kg</option><option value="g">g</option><option value="unidad">unidad</option><option value="pieza">pieza</option><option value="docena">docena</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Precio total</label>
                <input type="number" step="0.01" value={purchaseForm.price_total} onChange={e => setPurchaseForm({...purchaseForm, price_total: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 mb-1 block">Moneda</label>
                <select value={purchaseForm.currency} onChange={e => setPurchaseForm({...purchaseForm, currency: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                  <option value="PEN">PEN (S/)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="MXN">MXN</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">Tienda</label>
              <select value={purchaseForm.store_id} onChange={e => setPurchaseForm({...purchaseForm, store_id: e.target.value})} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm">
                <option value="">Sin tienda</option>
                {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">Notas</label>
              <input value={purchaseForm.notes} onChange={e => setPurchaseForm({...purchaseForm, notes: e.target.value})} placeholder="Ej: oferta, marca..." className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm" />
            </div>
            <button onClick={savePurchase} disabled={savingPurchase} className="w-full rounded-2xl bg-gradient-to-r from-secondary-500 to-secondary-600 text-white py-3 text-sm font-bold disabled:opacity-50">
              {savingPurchase ? "Guardando..." : "Guardar Compra"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
