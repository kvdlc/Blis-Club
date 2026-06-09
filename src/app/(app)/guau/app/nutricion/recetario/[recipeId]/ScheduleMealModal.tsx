"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NutritionRecipe, Dog, DogMealSlot } from "@/types/database";
import { X, ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  recipe: NutritionRecipe;
  dog: Dog | null;
  totalGrams: number;
  gramsPerMeal?: number;
  perMealMode?: boolean;
}

export function ScheduleMealModal({ open, onClose, recipe, dog, totalGrams, gramsPerMeal, perMealMode }: Props) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [slots, setSlots] = useState<DogMealSlot[]>([]);
  const [existingSchedule, setExistingSchedule] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAllMeals = !perMealMode;
  const activeSlots = slots.filter(s => s.active);
  const computedPerMeal = activeSlots.length > 0 ? Math.round(totalGrams / activeSlots.length) : totalGrams;
  const initialGrams = gramsPerMeal && gramsPerMeal > 0 ? gramsPerMeal : computedPerMeal;
  const [grams, setGrams] = useState(initialGrams);

const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const dateStr = toLocalDateStr(selectedDate);

  useEffect(() => {
    if (!open || !dog) return;
    loadSlots();
    loadExistingSchedule();
  }, [open, dog, selectedDate]);

  useEffect(() => {
    const ap = slots.filter(s => s.active);
    const cp = ap.length > 0 ? Math.round(totalGrams / ap.length) : totalGrams;
    setGrams(gramsPerMeal && gramsPerMeal > 0 ? gramsPerMeal : cp);
  }, [gramsPerMeal, slots, totalGrams]);

  const loadSlots = async () => {
    if (!dog) return;
    const { data } = await supabase
      .from("dog_meal_slots")
      .select("*")
      .eq("dog_id", dog.id)
      .order("slot_index", { ascending: true });
    setSlots((data as DogMealSlot[] | null) ?? []);
  };

  const loadExistingSchedule = async () => {
    if (!dog) return;
    const { data } = await supabase
      .from("meal_schedule")
      .select("meal_slot_index")
      .eq("dog_id", dog.id)
      .eq("fecha", dateStr);
    setExistingSchedule(new Set((data as { meal_slot_index: number }[] | null)?.map((d) => String(d.meal_slot_index)) ?? []));
  };

  const handleSave = async () => {
    if (!dog) return;
    if (isAllMeals) {
      if (activeSlots.length === 0) return;
    } else {
      if (selectedSlot === null) return;
    }
    setSaving(true);

    const slotsToRegister = isAllMeals ? activeSlots : [slots.find(s => s.slot_index === selectedSlot)!];

    for (const slot of slotsToRegister) {
      await supabase.from("meal_schedule").upsert({
        dog_id: dog.id,
        recipe_id: recipe.id,
        fecha: dateStr,
        meal_slot_index: slot.slot_index,
        status: "scheduled",
        gramos: grams,
      }, { onConflict: "dog_id,fecha,meal_slot_index" });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const weekDays = [];
  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    weekDays.push(d);
  }

  if (!open) return null;

  const canSave = isAllMeals ? activeSlots.length > 0 : selectedSlot !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Agendar Comida</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/30">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <span className="text-lg">🍽️</span>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{recipe.title}</p>
            <p className="text-xs text-zinc-500">{Math.round(recipe.kcal_per_100g ?? 0)} kcal/100g</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Fecha</label>
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-2">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d);
              }}
              className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {weekDays.map((d) => {
                const isSelected = d.toDateString() === selectedDate.toDateString();
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center px-2 py-1.5 rounded-xl transition-all min-w-[2.2rem] ${
                      isSelected
                        ? "bg-primary-500 text-white shadow-md"
                        : isToday
                        ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span className="text-[9px] font-medium">{d.toLocaleDateString("es", { weekday: "narrow" }).toUpperCase()}</span>
                    <span className="text-sm font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d);
              }}
              className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {isAllMeals ? (
            <>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Se agendará en todas las comidas</label>
              {activeSlots.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-4">No hay horarios activos. Configúralos en el perfil del perro.</p>
              ) : (
                <div className="space-y-2">
                  {activeSlots.map((slot) => {
                    const isTaken = existingSchedule.has(String(slot.slot_index));
                    return (
                      <div key={slot.slot_index} className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-950/20 text-left">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
                          <p className="text-xs text-zinc-400">{slot.time_of_day.slice(0, 5)} · {grams}g</p>
                        </div>
                        {isTaken && <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Ocupado</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Horario</label>
              <div className="grid grid-cols-1 gap-2">
                {slots.length === 0 && (
                  <p className="text-sm text-zinc-400 text-center py-4">No hay horarios configurados. Configúralos en el perfil del perro.</p>
                )}
                {slots.filter(s => s.active).map((slot) => {
                  const isTaken = existingSchedule.has(String(slot.slot_index));
                  const isSelected = selectedSlot === slot.slot_index;
                  return (
                    <button
                      key={slot.slot_index}
                      onClick={() => !isTaken && setSelectedSlot(slot.slot_index)}
                      disabled={isTaken}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary-400 bg-primary-50 dark:bg-primary-950/30"
                          : isTaken
                          ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-50 cursor-not-allowed"
                          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-200 dark:hover:border-primary-800"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-primary-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{slot.label}</p>
                        <p className="text-xs text-zinc-400">{slot.time_of_day.slice(0, 5)}</p>
                      </div>
                      {isTaken && <span className="text-[10px] text-zinc-400 font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Ocupado</span>}
                      {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{isAllMeals ? 'Gramos por comida' : 'Gramos'}</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGrams(Math.max(50, grams - 25))}
              className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-bold text-zinc-600"
            >
              -
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{grams}g</span>
            </div>
            <button
              onClick={() => setGrams(grams + 25)}
              className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-bold text-zinc-600"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || saving || saved}
          className={`w-full rounded-2xl py-3.5 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-secondary-500 text-white"
              : !canSave
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.97]"
          }`}
        >
          {saved ? <><Check className="w-4 h-4" /> Guardado</> : saving ? "Guardando..." : isAllMeals ? `Agendar ${activeSlots.length} comidas` : "Guardar en Agenda"}
        </button>
      </div>
    </div>
  );
}