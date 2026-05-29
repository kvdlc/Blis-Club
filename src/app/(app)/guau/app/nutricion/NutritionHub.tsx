"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, ToxicFood, Dog, DogMetabolicProfile } from "@/types/database";
import { Search, Plus, Minus, ChefHat, Lock, Check, ShoppingCart, AlertTriangle, ShieldCheck, X, Trash2 } from "lucide-react";

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
}

const TABS: { key: Tab; label: string }[] = [
  { key: "recetario", label: "Recetario" },
  { key: "calculadora", label: "Calculadora" },
  { key: "detox", label: "Detox" },
  { key: "escaner", label: "Escáner" },
  { key: "lista", label: "Lista" },
];

export function NutritionHub({ initialRecipes, toxicFoods, dog, metabolicProfile, detoxDays, detoxProgress, shoppingList: initialShoppingList, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("recetario");
  const supabase = createClient();

  return (
    <div className="space-y-4">
      {/* Top Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "recetario" && <RecetarioTab recipes={initialRecipes} dog={dog} metabolicProfile={metabolicProfile} userId={userId} supabase={supabase} />}
      {activeTab === "calculadora" && <CalculadoraTab dog={dog} metabolicProfile={metabolicProfile} userId={userId} supabase={supabase} />}
      {activeTab === "detox" && <DetoxTab dog={dog} detoxDays={detoxDays} detoxProgress={detoxProgress} userId={userId} supabase={supabase} />}
      {activeTab === "escaner" && <EscanerTab toxicFoods={toxicFoods} />}
      {activeTab === "lista" && <ListaTab shoppingList={initialShoppingList} userId={userId} supabase={supabase} />}
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  diario: "Menú Diario", snack: "Snacks", helado: "Helados", pastel: "Pasteles",
};

function RecetarioTab({ recipes, dog, metabolicProfile, supabase, userId }: { recipes: NutritionRecipe[]; dog: Dog | null; metabolicProfile: DogMetabolicProfile | null; userId: string; supabase: ReturnType<typeof createClient> }) {
  const categories = [...new Set(recipes.map(r => r.category))];
  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catRecipes = recipes.filter(r => r.category === cat);
        return (
          <div key={cat}>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">{CATEGORY_LABELS[cat] ?? cat}</h3>
            <div className="grid grid-cols-2 gap-3">
              {catRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/guau/app/nutricion/recetario/${recipe.id}`}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow"
                >
                  <div className={`w-full h-24 rounded-xl mb-3 flex items-center justify-center ${
                    recipe.is_therapeutic ? "bg-accent-100 dark:bg-accent-950" : "bg-primary-50 dark:bg-primary-950"
                  }`}>
                    <ChefHat className={`w-8 h-8 ${recipe.is_therapeutic ? "text-accent-600" : "text-primary-600"}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{recipe.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {recipe.prep_time_min && <span className="text-[10px] text-zinc-400">{recipe.prep_time_min}min</span>}
                    {recipe.kcal_per_100g && <span className="text-[10px] text-zinc-400">{recipe.kcal_per_100g} kcal</span>}
                    {recipe.is_therapeutic && (
                      <span className="text-[10px] font-medium bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-400 px-1.5 py-0.5 rounded">Terapéutico</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalculadoraTab({ dog, metabolicProfile, supabase, userId }: { dog: Dog | null; metabolicProfile: DogMetabolicProfile | null; userId: string; supabase: ReturnType<typeof createClient> }) {
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
    await supabase.from("dog_metabolic_profiles").upsert({
      dog_id: dog.id, feeding_pct: feedingPct, custom_meat_pct: meatPct,
      custom_bone_pct: bonePct, custom_organ_pct: organPct, custom_veggie_pct: veggiePct,
    }, { onConflict: "dog_id" });
  };

  if (!dog) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-6">
      {/* Circular Gauge */}
      <div className="flex flex-col items-center">
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
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(total)}</span>
            <span className="text-xs text-zinc-500">gramos/día</span>
          </div>
        </div>

        {/* Activity adjuster */}
        <div className="flex items-center gap-4 mt-4">
          <button onClick={() => setFeedingPct(Math.max(1.5, feedingPct - 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold">{feedingPct}%</p>
            <p className="text-[10px] text-zinc-400">del peso corporal</p>
          </div>
          <button onClick={() => setFeedingPct(Math.min(3.5, feedingPct + 0.5))} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Proteína", grams: meat, pct: meatPct, color: "border-danger-500", bg: "bg-danger-50 dark:bg-danger-950" },
          { label: "Huesos", grams: bone, pct: bonePct, color: "border-warning-500", bg: "bg-warning-50 dark:bg-warning-950" },
          { label: "Vísceras", grams: organ, pct: organPct, color: "border-accent-500", bg: "bg-accent-50 dark:bg-accent-950" },
          { label: "Vegetales", grams: veggie, pct: veggiePct, color: "border-secondary-500", bg: "bg-secondary-50 dark:bg-secondary-950" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border-l-4 ${item.color} ${item.bg} p-4`}>
            <p className="text-xs text-zinc-500">{item.label}</p>
            <p className="text-lg font-bold">{Math.round(item.grams)}g</p>
            <p className="text-[10px] text-zinc-400">{item.pct}%</p>
          </div>
        ))}
      </div>

      {/* Expert mode toggle */}
      <button onClick={() => setExpertMode(!expertMode)} className="text-xs text-accent-600 dark:text-accent-400 font-medium">
        {expertMode ? "Ocultar modo experto" : "Modo experto"}
      </button>

      {expertMode && (
        <div className="space-y-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          {[
            { label: "Proteína", value: meatPct, set: setMeatPct },
            { label: "Huesos", value: bonePct, set: setBonePct },
            { label: "Vísceras", value: organPct, set: setOrganPct },
            { label: "Vegetales", value: veggiePct, set: setVeggiePct },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-xs w-20 text-zinc-500">{s.label}</span>
              <input type="range" min={0} max={100} value={s.value} onChange={(e) => s.set(Number(e.target.value))} className="flex-1 accent-primary-600" />
              <span className="text-xs font-mono w-10 text-right">{s.value}%</span>
            </div>
          ))}
          <button onClick={handleSave} className="w-full rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white py-2 text-sm font-semibold mt-2">
            Guardar configuración
          </button>
        </div>
      )}
    </div>
  );
}

function DetoxTab({ dog, detoxDays, detoxProgress, supabase, userId }: { dog: Dog | null; detoxDays: { day_number: number; title: string; instructions: string; warning: string | null }[]; detoxProgress: { day_number: number; completed: boolean }[]; userId: string; supabase: ReturnType<typeof createClient> }) {
  const [progressState, setProgressState] = useState(detoxProgress);
  const completedDays = progressState.filter(p => p.completed).map(p => p.day_number);
  const maxUnlocked = completedDays.length > 0 ? Math.max(...completedDays) + 1 : 1;

  const markDay = async (day: number) => {
    if (!dog || day > maxUnlocked || completedDays.includes(day)) return;
    const { error } = await supabase.from("detox_progress").upsert(
      { dog_id: dog.id, day_number: day, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "dog_id,day_number" }
    );
    if (!error) {
      setProgressState(prev => [...prev.filter(p => p.day_number !== day), { day_number: day, completed: true }]);
    }
  };

  if (!dog) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return (
    <div className="space-y-4">
      <div className="bg-warning-50 dark:bg-warning-950 rounded-2xl p-4 border border-warning-200 dark:border-warning-800">
        <p className="text-sm text-warning-700 dark:text-warning-300 font-semibold">Reto Detox 14 Días</p>
        <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">Transición de croquetas a alimentación natural. Completa un día a la vez.</p>
      </div>
      {detoxDays.map((day) => {
        const isCompleted = completedDays.includes(day.day_number);
        const isUnlocked = day.day_number <= maxUnlocked;
        return (
          <div
            key={day.day_number}
            className={`rounded-2xl border p-4 ${
              isCompleted ? "border-secondary-300 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-950" :
              isUnlocked ? "border-primary-200 dark:border-primary-800 bg-white dark:bg-zinc-900" :
              "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted ? "bg-secondary-500 text-white" : isUnlocked ? "bg-primary-100 dark:bg-primary-950 text-primary-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : isUnlocked ? day.day_number : <Lock className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Día {day.day_number}: {day.title}</h4>
                {isUnlocked && (
                  <p className="text-xs text-zinc-500 mt-1">{day.instructions}</p>
                )}
              </div>
              {isUnlocked && !isCompleted && (
                <button onClick={() => markDay(day.day_number)} className="shrink-0 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 text-xs font-semibold">
                  Listo
                </button>
              )}
            </div>
            {day.warning && isUnlocked && (
              <p className="text-[10px] text-warning-600 dark:text-warning-400 mt-2 ml-12">{day.warning}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EscanerTab({ toxicFoods }: { toxicFoods: ToxicFood[] }) {
  const [query, setQuery] = useState("");
  const result = useMemo(() => {
    if (!query.trim()) return null;
    return toxicFoods.find(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, toxicFoods]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Buscar alimento (ej: "Uvas", "Cebolla")'
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {result ? (
        <div className={`rounded-2xl p-6 text-center ${
          result.is_toxic
            ? "bg-danger-50 dark:bg-danger-950 border-2 border-danger-500"
            : "bg-secondary-50 dark:bg-secondary-950 border-2 border-secondary-500"
        }`}>
          <div className="flex justify-center mb-3">
            {result.is_toxic ? (
              <AlertTriangle className="w-12 h-12 text-danger-600" />
            ) : (
              <ShieldCheck className="w-12 h-12 text-secondary-600" />
            )}
          </div>
          <h3 className={`text-lg font-bold ${result.is_toxic ? "text-danger-700 dark:text-danger-300" : "text-secondary-700 dark:text-secondary-300"}`}>
            {result.name}
          </h3>
          <p className={`text-sm font-semibold mt-1 ${result.is_toxic ? "text-danger-600" : "text-secondary-600"}`}>
            {result.is_toxic ? `TÓXICO · Severidad: ${result.severity}` : "SEGURO"}
          </p>
          {result.explanation && (
            <p className="text-sm mt-3 text-zinc-600 dark:text-zinc-400">{result.explanation}</p>
          )}
          {result.symptoms && (
            <p className="text-xs text-danger-600 dark:text-danger-400 mt-2 bg-danger-100 dark:bg-danger-900 rounded-lg p-2">
              Síntomas: {result.symptoms}
            </p>
          )}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-8 text-zinc-400">
          <p>Alimento no encontrado</p>
          <p className="text-xs mt-1">Intenta con otro nombre</p>
        </div>
      ) : (
        <div className="text-center py-8 text-zinc-400">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Busca un alimento para saber si es tóxico o seguro</p>
        </div>
      )}
    </div>
  );
}

function ListaTab({ shoppingList, userId, supabase }: { shoppingList: { id: string; ingredient_name: string; quantity_g: number | null; checked: boolean }[]; userId: string; supabase: ReturnType<typeof createClient> }) {
  const [items, setItems] = useState(shoppingList);

  const toggleCheck = async (id: string, current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !current } : i));
    await supabase.from("shopping_list").update({ checked: !current }).eq("id", id);
  };

  const removeItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
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

  const pending = items.filter(i => !i.checked);
  const completed = items.filter(i => i.checked);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
        </p>
      </div>
      {[...pending, ...completed].map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            item.checked
              ? "border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-950"
              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          }`}
        >
          <button onClick={() => toggleCheck(item.id, item.checked)} className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
            item.checked ? "bg-secondary-500 border-secondary-500" : "border-zinc-300 dark:border-zinc-600"
          }`}>
            {item.checked && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <span className={`flex-1 text-sm ${item.checked ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
            {item.ingredient_name}
          </span>
          {item.quantity_g && (
            <span className="text-xs text-zinc-400">{item.quantity_g}g</span>
          )}
          <button onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-danger-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
