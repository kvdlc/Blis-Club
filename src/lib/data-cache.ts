import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Cache de datos compartido entre layout y páginas.
 * React.cache() deduplica llamadas dentro del mismo request:
 * si el layout ya cargó los datos del perro, las páginas hijas
 * reciben la versión cacheada sin llamar a Supabase de nuevo.
 */

export const getCachedDog = cache(async (dogId: string, userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .eq("owner_id", userId)
    .single();
  return data;
});

export const getCachedMetabolicProfile = cache(async (dogId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dog_metabolic_profiles")
    .select("*")
    .eq("dog_id", dogId)
    .maybeSingle();
  return data;
});

export const getCachedMealSlots = cache(async (dogId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dog_meal_slots")
    .select("*")
    .eq("dog_id", dogId)
    .order("slot_index", { ascending: true });
  return data ?? [];
});

export const getCachedRecipes = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nutrition_recipes")
    .select("*")
    .order("category");
  return data ?? [];
});

export const getCachedWalks = cache(async (dogId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("walks")
    .select("*")
    .eq("dog_id", dogId)
    .order("start_time", { ascending: false })
    .limit(30);
  return data ?? [];
});

export const getCachedWeightLatest = cache(async (dogId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dog_weight_history")
    .select("peso_kg")
    .eq("dog_id", dogId)
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.peso_kg ?? null;
});

export const getCachedMealSchedule = cache(async (dogId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("meal_schedule")
    .select("*, recipe:nutrition_recipes(*)")
    .eq("dog_id", dogId)
    .order("fecha", { ascending: true });
  return data ?? [];
});
