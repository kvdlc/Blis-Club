"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMealSlot } from "@/types/database";
import { Clock, Plus, Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";

interface Props {
  dog: Dog;
  initialSlots: DogMealSlot[];
}

export function MealSlotsConfig({ dog, initialSlots }: Props) {
  const supabase = createClient();
  const [slots, setSlots] = useState<DogMealSlot[]>(initialSlots.length > 0 ? initialSlots : [
    { id: "", dog_id: dog.id, slot_index: 0, label: "Desayuno", time_of_day: "08:00:00", active: true, created_at: "" },
    { id: "", dog_id: dog.id, slot_index: 1, label: "Almuerzo", time_of_day: "13:00:00", active: true, created_at: "" },
    { id: "", dog_id: dog.id, slot_index: 2, label: "Cena", time_of_day: "19:00:00", active: true, created_at: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeCount = slots.filter((s) => s.active).length;

  const updateSlot = (index: number, updates: Partial<DogMealSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  };

  const addSlot = () => {
    if (slots.length >= 8) return;
    const nextIndex = slots.length;
    const defaultTimes = ["08:00", "13:00", "19:00", "10:00", "16:00", "21:00", "12:00", "18:00"];
    const defaultLabels = ["Desayuno", "Almuerzo", "Cena", "Snack mañana", "Snack tarde", "Cena tardía", "Brunch", "Merienda"];
    setSlots((prev) => [
      ...prev,
      {
        id: "",
        dog_id: dog.id,
        slot_index: nextIndex,
        label: defaultLabels[nextIndex] ?? `Comida ${nextIndex + 1}`,
        time_of_day: `${defaultTimes[nextIndex] ?? "09:00"}:00`,
        active: true,
        created_at: "",
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, slot_index: i })));
  };

  const handleSave = async () => {
    setSaving(true);
    // Delete existing slots for this dog and re-insert
    await supabase.from("dog_meal_slots").delete().eq("dog_id", dog.id);
    for (const slot of slots) {
      await supabase.from("dog_meal_slots").insert({
        dog_id: dog.id,
        slot_index: slot.slot_index,
        label: slot.label,
        time_of_day: slot.time_of_day,
        active: slot.active,
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Horarios de Comida</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{activeCount} comidas al día</p>
        </div>
        <div className="flex items-center gap-2">
          {slots.length < 8 && (
            <button
              onClick={addSlot}
              className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
              slot.active
                ? "bg-white/70 dark:bg-zinc-800/70 border-zinc-100 dark:border-zinc-800"
                : "bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100/50 dark:border-zinc-800/30 opacity-60"
            }`}
          >
            <button
              onClick={() => updateSlot(index, { active: !slot.active })}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                slot.active ? "bg-secondary-500 border-secondary-500" : "border-zinc-300 dark:border-zinc-600"
              }`}
            >
              {slot.active && <Check className="w-3 h-3 text-white" />}
            </button>

            <input
              type="text"
              value={slot.label}
              onChange={(e) => updateSlot(index, { label: e.target.value })}
              className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
              placeholder="Nombre"
            />

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="time"
                value={slot.time_of_day.slice(0, 5)}
                onChange={(e) => updateSlot(index, { time_of_day: `${e.target.value}:00` })}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {slots.length > 1 && (
              <button
                onClick={() => removeSlot(index)}
                className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all ${
          saved
            ? "bg-secondary-500 text-white"
            : "bg-primary-600 hover:bg-primary-700 text-white active:scale-[0.98]"
        }`}
      >
        {saved ? "Guardado ✓" : saving ? "Guardando..." : "Guardar Horarios"}
      </button>
    </div>
  );
}
