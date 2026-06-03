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
      {activeTab === "detox" && (
        <div className="text-center py-8 text-zinc-400">Reto detox próximamente.</div>
      )}
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
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm border ${meta?.bg ?? "bg-zinc-100 dark:bg-zinc-800"} ${meta?.border ?? "border-zinc-200 dark:border-zinc-700"}`}>
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
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {recipe.prep_time_min}m
          </span>
        )}
        {recipe.kcal_per_100g && (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-orange-400" />
            {Math.round(recipe.kcal_per_100g)}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ================================================================ */
/*  ESCANER                                                          */
/* ================================================================ */
function EscanerTab({ toxicFoods }: { toxicFoods: ToxicFood[] }) {
  const [search, setSearch] = useState("");
  const filtered = toxicFoods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar alimento..."
        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm"
      />
      {filtered.length === 0 && <p className="text-center text-sm text-zinc-400 py-4">No encontrado.</p>}
      <div className="space-y-2">
        {filtered.map((f) => (
          <div key={f.id} className="card-soft rounded-xl p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${f.severity === "alto" || f.severity === "mortal" ? "bg-danger-100 text-danger-600" : f.severity === "medio" ? "bg-warning-100 text-warning-600" : "bg-secondary-100 text-secondary-600"}`}>
              {f.severity === "alto" || f.severity === "mortal" ? "☠️" : f.severity === "medio" ? "⚠️" : "ℹ️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{f.name}</p>
              {f.symptoms && <p className="text-xs text-zinc-500 dark:text-zinc-400">{f.symptoms}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
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

  if (!dog) return <p className="text-zinc-500 dark:text-zinc-400 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-5">
      <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Calculadora de ración diaria</h3>
        <div className="flex items-center justify-center py-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-100 dark:text-zinc-800" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{Math.round(total)}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">gramos/día</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setFeedingPct(Math.max(1.5, feedingPct - 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-zinc-300">-</button>
          <div className="text-center">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{feedingPct.toFixed(1)}%</span>
            <p className="text-[10px] text-zinc-400">del peso corporal</p>
          </div>
          <button onClick={() => setFeedingPct(Math.min(3.5, feedingPct + 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-zinc-300">+</button>
        </div>
        {expertMode && (
          <div className="space-y-3 pt-2">
            {[
              { label: "Carne", pct: meatPct, set: setMeatPct, color: "text-red-500" },
              { label: "Hueso", pct: bonePct, set: setBonePct, color: "text-orange-500" },
              { label: "Víscera", pct: organPct, set: setOrganPct, color: "text-purple-500" },
              { label: "Verdura", pct: veggiePct, set: setVeggiePct, color: "text-green-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  <span className="text-[10px] text-zinc-400">{item.pct}% · {Math.round(total * (item.pct / 100))}g</span>
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
      </div>
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
