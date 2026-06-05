"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { determinarTamano } from "@/lib/breed-sizes";
import type { Dog, DogMealSlot, MealSchedule, NutritionRecipe, DogMetabolicProfile } from "@/types/database";
import {
  ChevronLeft, ChevronRight, Check, X, Sparkles, Clock, ChefHat, Circle,
  Flame, Footprints, TrendingUp, CalendarDays, Plus, Trash2, UtensilsCrossed
} from "lucide-react";

interface Props {
  dog: Dog;
  mealSlots: DogMealSlot[];
  mealSchedule: (MealSchedule & { recipe?: NutritionRecipe | null })[];
  metabolicProfile: DogMetabolicProfile | null;
  recipes: NutritionRecipe[];
  walksCount: number;
  greenWalksCount: number;
}

export function MealCalendarWidget({ dog, mealSlots, mealSchedule, metabolicProfile, recipes, walksCount, greenWalksCount }: Props) {
  const supabase = createClient();
  const [view, setView] = useState<"today" | "week">("today");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState(mealSchedule);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"recipe" | "free" | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [freeText, setFreeText] = useState("");
  const [addGrams, setAddGrams] = useState(200);

  useEffect(() => {
    setSchedule(mealSchedule);
  }, [mealSchedule]);

  const feedingPct = metabolicProfile?.feeding_pct ?? 2.5;
  const totalGramsTarget = Math.round(dog.peso_kg * 1000 * (feedingPct / 100));
  const kcalTarget = Math.round(totalGramsTarget * 1.8);

  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const selectedStr = toLocalDateStr(selectedDate);

  // Ensure we always have slots to show, with unique keys per dog
  const effectiveSlots: DogMealSlot[] = mealSlots.length > 0
    ? mealSlots
    : [
        { id: `def-${dog.id}-0`, dog_id: dog.id, slot_index: 0, label: "Desayuno", time_of_day: "08:00:00", active: true, created_at: "" },
        { id: `def-${dog.id}-1`, dog_id: dog.id, slot_index: 1, label: "Almuerzo", time_of_day: "13:00:00", active: true, created_at: "" },
        { id: `def-${dog.id}-2`, dog_id: dog.id, slot_index: 2, label: "Cena", time_of_day: "19:00:00", active: true, created_at: "" },
      ];
  const activeSlots = effectiveSlots.filter((s) => s.active).sort((a, b) => a.time_of_day.localeCompare(b.time_of_day));

  // Get schedule for selected date
  const daySchedule = useMemo(() => schedule.filter((s) => typeof s.fecha === "string" && s.fecha.startsWith(selectedStr)), [schedule, selectedStr]);

  // Stats
  const dayStats = useMemo(() => {
    let kcal = 0;
    daySchedule.forEach((item) => {
      if (item.status === "fed" && item.recipe?.kcal_per_100g && item.gramos) {
        kcal += item.recipe.kcal_per_100g * (item.gramos / 100);
      }
    });
    return { kcal: Math.round(kcal) };
  }, [daySchedule]);

  const kcalPercent = Math.min((dayStats.kcal / kcalTarget) * 100, 100);

  // Week days (fix: today calculated inside memo to avoid re-render loop)
  const weekDays = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay() + 1 + weekOffset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const getMealCount = (dateStr: string) => schedule.filter((s) => typeof s.fecha === "string" && s.fecha.startsWith(dateStr)).length;
  const getFedCount = (dateStr: string) => schedule.filter((s) => typeof s.fecha === "string" && s.fecha.startsWith(dateStr) && s.status === "fed").length;

  const toggleStatus = async (scheduleId: string, current: string) => {
    const next = current === "fed" ? "skipped" : current === "skipped" ? "scheduled" : "fed";
    setSchedule((prev) => prev.map((s) => (s.id === scheduleId ? { ...s, status: next as any } : s)));
    await supabase.from("meal_schedule").update({ status: next }).eq("id", scheduleId);
  };

  const deleteMeal = async (scheduleId: string) => {
    if (!confirm("¿Eliminar esta comida de la agenda?")) return;
    setSchedule((prev) => prev.filter((s) => s.id !== scheduleId));
    await supabase.from("meal_schedule").delete().eq("id", scheduleId);
  };

  const openAddModal = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex);
    setAddMode(null);
    setSelectedRecipeId("");
    setFreeText("");
    setAddGrams(Math.round(totalGramsTarget / activeSlots.length));
    setShowAddModal(true);
  };

  const saveAddMeal = async () => {
    if (selectedSlotIndex === null || !addMode) return;
    const payload: any = {
      dog_id: dog.id,
      fecha: selectedStr,
      meal_slot_index: selectedSlotIndex,
      status: "scheduled",
      gramos: addGrams,
    };
    if (addMode === "recipe") {
      if (!selectedRecipeId) return;
      payload.recipe_id = selectedRecipeId;
    } else {
      payload.recipe_id = null;
      payload.notes = freeText || "Comida libre";
    }
    const { data } = await supabase.from("meal_schedule").insert(payload).select("*, recipe:nutrition_recipes(*)").single();
    if (data) setSchedule((prev) => [...prev, data as any]);
    setShowAddModal(false);
  };

  const generateDay = async () => {
    const emptySlots = activeSlots.filter((slot) => !daySchedule.some((s) => s.meal_slot_index === slot.slot_index));
    if (emptySlots.length === 0) return;

    // Get dog's breed size
    const dogSize = determinarTamano(dog.raza, dog.peso_kg, dog.edad_meses, dog.tamano);
    const sizeMap: Record<string, string> = { miniatura: "miniatura", pequena: "pequena", mediana: "mediana", grande: "grande", gigante: "gigante" };
    const lookupSize = sizeMap[dogSize] || dogSize;

    // Prioritize recipes matching the dog's breed size
    const matchingCroquetas = recipes.filter(r =>
      r.category === "croquetas" && r.breed_sizes?.includes(lookupSize)
    );
    const otherRecipes = recipes.filter(r =>
      !(r.category === "croquetas" && r.breed_sizes?.includes(lookupSize))
    );

    for (const slot of emptySlots) {
      // Pick from matching croquetas first (50% chance), or any other recipe
      const pool = matchingCroquetas.length > 0 && Math.random() < 0.5
        ? matchingCroquetas
        : otherRecipes;
      const randomRecipe = pool[Math.floor(Math.random() * pool.length)] || recipes[Math.floor(Math.random() * recipes.length)];
      if (!randomRecipe) continue;
      const grams = Math.round(totalGramsTarget / activeSlots.length);
      const { data } = await supabase.from("meal_schedule").insert({
        dog_id: dog.id, recipe_id: randomRecipe.id, fecha: selectedStr,
        meal_slot_index: slot.slot_index, status: "suggested", gramos: grams,
      }).select("*, recipe:nutrition_recipes(*)").single();
      if (data) setSchedule((prev) => [...prev, data as any]);
    }
  };

  return (
    <div className="space-y-5">

      {/* ═══ WIDGET 1: Plan Semanal ═══ */}
      <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Plan Semanal</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Week strip */}
        <div className="flex justify-between">
          {weekDays.map((d) => {
            const dateStr = toLocalDateStr(d);
            const count = getMealCount(dateStr);
            const fed = getFedCount(dateStr);
            const selected = d.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(d);
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(d)}
                className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-2xl transition-all min-w-[2.2rem] ${
                  selected ? "bg-primary-100 dark:bg-primary-900/40 ring-2 ring-primary-300" : ""
                } ${isTodayDate && !selected ? "bg-secondary-50 dark:bg-secondary-950/20" : ""}`}
              >
                <span className={`text-[9px] font-medium ${isTodayDate ? "text-primary-600" : "text-zinc-400"}`}>
                  {d.toLocaleDateString("es", { weekday: "narrow" }).toUpperCase()}
                </span>
                <span className={`text-sm font-bold ${selected ? "text-primary-700" : isTodayDate ? "text-secondary-600" : "text-zinc-700"}`}>
                  {d.getDate()}
                </span>
                <div className="flex gap-0.5 h-1.5 items-center">
                  {count > 0 ? (
                    Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${i < fed ? "bg-secondary-500" : "bg-primary-400"}`} />
                    ))
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Meals list - SIEMPRE MUESTRA SLOTS */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {view === "today" ? "Comidas de hoy" : `Comidas del ${selectedDate.toLocaleDateString("es", { weekday: "long", day: "numeric" })}`}
          </h4>

          {activeSlots.map((slot) => {
            const item = daySchedule.find((s) => s.meal_slot_index === slot.slot_index);
            return (
              <div
                key={slot.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  item?.status === "fed"
                    ? "bg-secondary-50/60 border-secondary-200/50"
                    : item?.status === "skipped"
                    ? "bg-zinc-50/60 border-zinc-200/50 opacity-60"
                    : item?.status === "suggested"
                    ? "bg-primary-50/60 border-primary-200/50"
                    : "bg-white/60 border-zinc-100"
                }`}
              >
                <div className="flex flex-col items-center w-10 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] font-semibold text-zinc-500 mt-0.5">{slot.time_of_day.slice(0, 5)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {item?.recipe ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <ChefHat className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-800 truncate">{item.recipe.title}</p>
                        <p className="text-[10px] text-zinc-400">{item.gramos ?? 0}g · {Math.round(((item.gramos ?? 0) / 100) * (item.recipe.kcal_per_100g ?? 0))} kcal</p>
                      </div>
                    </div>
                  ) : item ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.status === "fed" ? "bg-secondary-100" : "bg-zinc-100"}`}>
                        <Check className={`w-4 h-4 ${item.status === "fed" ? "text-secondary-600" : "text-zinc-400"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-700">{item.notes || slot.label}</p>
                        <p className="text-[10px] text-zinc-400">{item.gramos ?? 0}g {item.status === "fed" ? "· Completado" : item.status === "skipped" ? "· Saltado" : ""}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        <Circle className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400">{slot.label} — Sin agendar</p>
                        <p className="text-[10px] text-zinc-400">Toca el + para agregar</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {item ? (
                    <>
                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          item.status === "fed" ? "bg-secondary-500 text-white" : item.status === "skipped" ? "bg-zinc-300 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-secondary-100"
                        }`}
                      >
                        {item.status === "fed" ? <Check className="w-4 h-4" /> : item.status === "skipped" ? <X className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteMeal(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openAddModal(slot.slot_index)}
                      className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 hover:bg-primary-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ WIDGET 2: Resumen Nutricional ═══ */}
      <div className="card-soft rounded-[1.5rem] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Resumen Nutricional</h3>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
            <button onClick={() => setView("today")} className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${view === "today" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Hoy</button>
            <button onClick={() => setView("week")} className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${view === "week" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500"}`}>Semana</button>
          </div>
        </div>

        {/* Gauge semicircle */}
        <div className="flex flex-col items-center py-2">
          <div className="relative w-52 h-32">
            <svg className="w-52 h-32" viewBox="0 0 140 80">
              <path d="M 20 70 A 50 50 0 0 1 120 70" fill="none" stroke="currentColor" strokeWidth="12" className="text-zinc-100 dark:text-zinc-800" strokeLinecap="round" />
              <path d="M 20 70 A 50 50 0 0 1 120 70" fill="none" stroke="currentColor" strokeWidth="12" className="text-primary-500" strokeLinecap="round"
                strokeDasharray={Math.PI * 50}
                strokeDashoffset={Math.PI * 50 * (1 - kcalPercent / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{kcalPercent.toFixed(0)}%</span>
              <span className="text-[10px] text-zinc-500">de calorías</span>
            </div>
            <div className="absolute left-2 bottom-2 flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center"><Flame className="w-3 h-3 text-rose-500" /></div>
              <span className="text-[9px] font-bold text-zinc-600">{dayStats.kcal}</span>
            </div>
            <div className="absolute right-2 bottom-2 flex items-center gap-1 flex-row-reverse">
              <div className="w-6 h-6 rounded-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center"><Flame className="w-3 h-3 text-orange-500" /></div>
              <span className="text-[9px] font-bold text-zinc-600">{kcalTarget}</span>
            </div>
          </div>
        </div>

        {/* Macros pills hidden until real data available */}
        {/* <div className="grid grid-cols-3 gap-2"> ... </div> */}

        <button onClick={generateDay} className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-[0.98]">
          <Sparkles className="w-4 h-4" /> Generar Mi Día
        </button>
      </div>

      {/* ═══ ADD MEAL MODAL ═══ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Agregar Comida</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!addMode ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setAddMode("recipe")} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-primary-200 bg-primary-50 dark:bg-primary-950/30 hover:border-primary-400 transition-all">
                  <ChefHat className="w-6 h-6 text-primary-600" />
                  <span className="text-sm font-bold text-primary-700">Elegir receta</span>
                </button>
                <button onClick={() => setAddMode("free")} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-zinc-200 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 transition-all">
                  <UtensilsCrossed className="w-6 h-6 text-zinc-600" />
                  <span className="text-sm font-bold text-zinc-700">Comida libre</span>
                </button>
              </div>
            ) : addMode === "recipe" ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Receta</label>
                <select value={selectedRecipeId} onChange={(e) => setSelectedRecipeId(e.target.value)} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm">
                  <option value="">Selecciona una receta...</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gramos</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAddGrams(Math.max(50, addGrams - 25))} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600">-</button>
                    <div className="flex-1 text-center"><span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{addGrams}g</span></div>
                    <button onClick={() => setAddGrams(addGrams + 25)} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600">+</button>
                  </div>
                </div>
                <button onClick={saveAddMeal} disabled={!selectedRecipeId} className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 text-sm font-bold disabled:opacity-50">Guardar</button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">¿Qué comió?</label>
                  <input value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="Ej: 2 tazas de croquetas" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gramos</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAddGrams(Math.max(50, addGrams - 25))} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600">-</button>
                    <div className="flex-1 text-center"><span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{addGrams}g</span></div>
                    <button onClick={() => setAddGrams(addGrams + 25)} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600">+</button>
                  </div>
                </div>
                <button onClick={saveAddMeal} disabled={!freeText.trim()} className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 text-sm font-bold disabled:opacity-50">Guardar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
