"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, ToxicFood, Dog, DogMetabolicProfile, DogMealSlot, MealSchedule, Walk } from "@/types/database";
import { MealCalendarWidget } from "@/components/MealCalendarWidget";
import {
  Search, Plus, Minus, ChefHat, Lock, Check, ShoppingCart,
  AlertTriangle, ShieldCheck, X, Trash2, Sparkles, Clock,
  Flame, ChevronRight, ScanBarcode, UtensilsCrossed, ArrowRight
} from "lucide-react";

type Tab = "recetario" | "calculadora" | "detox" | "escaner" | "lista";

interface Props {
  initialRecipes: NutritionRecipe[];
  toxicFoods: ToxicFood[];
  dog: Dog | null;
  metabolicProfile: DogMetabolicProfile | null;
  detoxDays: { day_number: number; title: string; instructions: string; warning: string | null }[];
  detoxProgress: { day_number: number; completed: boolean }[];
  shoppingList: { id: string; ingredient_name: string; quantity_g: number | null; checked: boolean }[];
  userId: string;
  mealSlots: DogMealSlot[];
  mealSchedule: (MealSchedule & { recipe: NutritionRecipe | null })[];
  walks: Walk[];
  greenCount: number;
  initialTab?: Tab;
}

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "recetario", label: "Recetario", icon: ChefHat },
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
        />
      )}
      {activeTab === "calculadora" && <CalculadoraTab dog={props.dog} metabolicProfile={props.metabolicProfile} />}
      {activeTab === "detox" && <DetoxTab dog={props.dog} detoxDays={props.detoxDays} detoxProgress={props.detoxProgress} />}
      {activeTab === "escaner" && <EscanerTab toxicFoods={props.toxicFoods} />}
      {activeTab === "lista" && <ListaTab shoppingList={props.shoppingList} />}

      {/* Calendario de comidas */}
      {props.dog && (
        <MealCalendarWidget
          dog={props.dog}
          mealSlots={props.mealSlots}
          mealSchedule={props.mealSchedule}
          metabolicProfile={props.metabolicProfile}
          recipes={props.initialRecipes}
          walksCount={props.walks.length}
          greenWalksCount={props.greenCount}
        />
      )}
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
};

function RecetarioView({ recipes, onOpenScanner }: { recipes: NutritionRecipe[]; onOpenScanner: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  const categories = [...new Set(recipes.map((r) => r.category))];

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (selectedCategory !== "all") result = result.filter((r) => r.category === selectedCategory);
    return result;
  }, [recipes, selectedCategory]);

  const popular = filteredRecipes.filter((r) => !r.is_detox).slice(0, 4);
  const newest = [...filteredRecipes].reverse().slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Scanner banner — FIRST */}
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
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border ${meta?.bg ?? "bg-zinc-100"} ${meta?.border ?? "border-zinc-200"}`}>
                  {meta?.icon ?? "🍽️"}
                </div>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{meta?.label ?? cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular section */}
      {popular.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Populares</h3>
            <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{filteredRecipes.length} recetas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {popular.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      )}

      {/* What's New section */}
      {newest.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Nuevas</h3>
          <div className="grid grid-cols-2 gap-3">
            {newest.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
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

function RecipeCard({ recipe }: { recipe: NutritionRecipe }) {
  const categoryMeta = CATEGORY_META[recipe.category];

  return (
    <Link
      href={`/guau/app/nutricion/recetario/${recipe.id}`}
      className="card-soft rounded-[1.25rem] p-3.5 hover:shadow-lg transition-all active:scale-[0.97] block group"
    >
      {/* Image / gradient area */}
      <div className="relative w-full aspect-square rounded-2xl mb-2.5 flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 via-white to-accent-50 dark:from-primary-900/40 dark:via-zinc-900/40 dark:to-accent-900/40 border border-white/50 dark:border-white/5">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <ChefHat className={`w-10 h-10 transition-transform group-hover:scale-110 ${recipe.is_therapeutic ? "text-accent-400" : "text-primary-400"}`} />
        )}

        {/* Therapeutic badge */}
        {recipe.is_therapeutic && (
          <span className="absolute top-2 right-2 bg-accent-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            Terapéutico
          </span>
        )}

        {/* Quick add circle button */}
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
        </div>
      </div>

      {/* Text */}
      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight">{recipe.title}</h4>

      {/* Stats row */}
      <div className="flex items-center gap-2 mt-1.5">
        {recipe.prep_time_min && (
          <span className="text-[10px] text-zinc-500 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {recipe.prep_time_min}m
          </span>
        )}
        {recipe.kcal_per_100g && (
          <span className="text-[10px] text-zinc-500 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-orange-400" />
            {Math.round(recipe.kcal_per_100g)}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ================================================================ */
/*  CALCULADORA                                                      */
/* ================================================================ */
function CalculadoraTab({ dog, metabolicProfile }: { dog: Dog | null; metabolicProfile: DogMetabolicProfile | null }) {
  const supabase = createClient();
  const [feedingPct, setFeedingPct] = useState(metabolicProfile?.feeding_pct ?? 2.5);
  const [expertMode, setExpertMode] = useState(false);
  const [meatPct, setMeatPct] = useState(metabolicProfile?.custom_meat_pct ?? 50);
  const [bonePct, setBonePct] = useState(metabolicProfile?.custom_bone_pct ?? 20);
  const [organPct, setOrganPct] = useState(metabolicProfile?.custom_organ_pct ?? 10);
  const [veggiePct, setVeggiePct] = useState(metabolicProfile?.custom_veggie_pct ?? 20);

  const weight = dog?.peso_kg ?? 0;
  const total = weight * 1000 * (feedingPct / 100);
  const meat = total * (meatPct / 100);
  const bone = total * (bonePct / 100);
  const organ = total * (organPct / 100);
  const veggie = total * (veggiePct / 100);

  const handleSave = async () => {
    if (!dog) return;
    await supabase.from("dog_metabolic_profiles").upsert(
      { dog_id: dog.id, feeding_pct: feedingPct, custom_meat_pct: meatPct, custom_bone_pct: bonePct, custom_organ_pct: organPct, custom_veggie_pct: veggiePct },
      { onConflict: "dog_id" }
    );
  };

  if (!dog) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-5">
      <div className="card-soft rounded-[1.5rem] p-6 flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
              className="text-primary-500"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(feedingPct / 5, 1))}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(total)}</span>
            <span className="text-[10px] text-zinc-500">gramos/día</span>
          </div>
        </div>
        <div className="flex items-center gap-5 mt-4">
          <button onClick={() => setFeedingPct(Math.max(1.5, feedingPct - 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform active:scale-95">
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-base font-bold">{feedingPct}%</p>
            <p className="text-[10px] text-zinc-400">del peso corporal</p>
          </div>
          <button onClick={() => setFeedingPct(Math.min(3.5, feedingPct + 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-transform active:scale-95">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Proteína", grams: meat, pct: meatPct, color: "bg-danger-500", bg: "bg-danger-50 dark:bg-danger-950/30" },
          { label: "Huesos", grams: bone, pct: bonePct, color: "bg-warning-500", bg: "bg-warning-50 dark:bg-warning-950/30" },
          { label: "Vísceras", grams: organ, pct: organPct, color: "bg-accent-500", bg: "bg-accent-50 dark:bg-accent-950/30" },
          { label: "Vegetales", grams: veggie, pct: veggiePct, color: "bg-secondary-500", bg: "bg-secondary-50 dark:bg-secondary-950/30" },
        ].map((item) => (
          <div key={item.label} className={`rounded-[1.25rem] ${item.bg} p-4 card-soft`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <p className="text-[11px] text-zinc-500">{item.label}</p>
            </div>
            <p className="text-lg font-bold">{Math.round(item.grams)}g</p>
            <p className="text-[10px] text-zinc-400">{item.pct}%</p>
          </div>
        ))}
      </div>

      <button onClick={() => setExpertMode(!expertMode)} className="text-xs text-accent-600 dark:text-accent-400 font-semibold">
        {expertMode ? "Ocultar modo experto" : "Modo experto"}
      </button>

      {expertMode && (
        <div className="card-soft rounded-[1.5rem] p-5 space-y-3">
          {[
            { label: "Proteína", value: meatPct, set: setMeatPct },
            { label: "Huesos", value: bonePct, set: setBonePct },
            { label: "Vísceras", value: organPct, set: setOrganPct },
            { label: "Vegetales", value: veggiePct, set: setVeggiePct },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs w-16 text-zinc-500">{s.label}</span>
              <input type="range" min={0} max={100} value={s.value} onChange={(e) => s.set(Number(e.target.value))} className="flex-1 accent-primary-600" />
              <span className="text-xs font-mono w-8 text-right">{s.value}%</span>
            </div>
          ))}
          <button onClick={handleSave} className="w-full rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white py-2.5 text-sm font-bold transition-colors active:scale-[0.98]">
            Guardar configuración
          </button>
        </div>
      )}
    </div>
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
  const result = useMemo(() => {
    if (!query.trim()) return null;
    return toxicFoods.find((f) => f.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, toxicFoods]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Buscar alimento (ej: "Uvas", "Cebolla")'
          className="w-full rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {result ? (
        <div className={`rounded-[1.5rem] p-5 text-center ${
          result.is_toxic ? "bg-danger-50 dark:bg-danger-950/30 border-2 border-danger-400" : "bg-secondary-50 dark:bg-secondary-950/30 border-2 border-secondary-400"
        }`}>
          <div className="flex justify-center mb-2">
            {result.is_toxic ? <AlertTriangle className="w-10 h-10 text-danger-500" /> : <ShieldCheck className="w-10 h-10 text-secondary-500" />}
          </div>
          <h3 className={`text-base font-bold ${result.is_toxic ? "text-danger-700 dark:text-danger-300" : "text-secondary-700 dark:text-secondary-300"}`}>
            {result.name}
          </h3>
          <p className={`text-xs font-semibold mt-1 ${result.is_toxic ? "text-danger-600" : "text-secondary-600"}`}>
            {result.is_toxic ? `TÓXICO · Severidad: ${result.severity}` : "SEGURO"}
          </p>
          {result.explanation && <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-400">{result.explanation}</p>}
          {result.symptoms && (
            <p className="text-[11px] text-danger-600 dark:text-danger-400 mt-2 bg-danger-100 dark:bg-danger-900 rounded-xl p-2.5">Síntomas: {result.symptoms}</p>
          )}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-8 text-zinc-400">
          <p>Alimento no encontrado</p>
          <p className="text-xs mt-1">Intenta con otro nombre</p>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-400">
          <ScanBarcode className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Busca un alimento para saber si es tóxico o seguro</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  LISTA DE COMPRAS                                                 */
/* ================================================================ */
function ListaTab({ shoppingList }: { shoppingList: Props["shoppingList"] }) {
  const supabase = createClient();
  const [items, setItems] = useState(shoppingList);

  const toggleCheck = async (id: string, current: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !current } : i)));
    await supabase.from("shopping_list").update({ checked: !current }).eq("id", id);
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("shopping_list").delete().eq("id", id);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Tu lista de compras está vacía</p>
        <p className="text-xs mt-1">Agrega ingredientes desde las recetas</p>
      </div>
    );
  }

  const pending = items.filter((i) => !i.checked);
  const completed = items.filter((i) => i.checked);

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{pending.length} pendiente{pending.length !== 1 ? "s" : ""}</p>
      {[...pending, ...completed].map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-[1.25rem] transition-all ${
            item.checked ? "card-soft bg-secondary-50/60 dark:bg-secondary-950/20" : "card-soft"
          }`}
        >
          <button
            onClick={() => toggleCheck(item.id, item.checked)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
              item.checked ? "bg-secondary-500 border-secondary-500" : "border-zinc-300 dark:border-zinc-600"
            }`}
          >
            {item.checked && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className={`flex-1 text-sm ${item.checked ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
            {item.ingredient_name}
          </span>
          {item.quantity_g && <span className="text-xs text-zinc-400">{item.quantity_g}g</span>}
          <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-danger-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
