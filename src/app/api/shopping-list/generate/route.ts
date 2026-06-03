import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  try {
    const body = await request.json();
    const { userId, startDate, endDate } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: "userId, startDate, endDate required" }, { status: 400 });
    }

    // 1. Get user's dogs
    const { data: dogs } = await supabase.from("dogs").select("id, nombre, peso_kg").eq("owner_id", userId);
    if (!dogs?.length) return NextResponse.json({ data: { combined: [], byDog: [] } });

    const dogIds = dogs.map((d: any) => d.id);

    // 2. Get meal_schedule with recipes in date range
    const { data: schedules } = await supabase
      .from("meal_schedule")
      .select("dog_id, recipe_id, gramos, recipe:nutrition_recipes(id)")
      .in("dog_id", dogIds)
      .gte("fecha", startDate)
      .lte("fecha", endDate)
      .not("recipe_id", "is", null);

    if (!schedules?.length) return NextResponse.json({ data: { combined: [], byDog: [] } });

    const recipeIds = [...new Set(schedules.map((s: any) => s.recipe_id))];

    // 3. Get ingredients for those recipes
    const { data: recipeIngredients } = await supabase
      .from("recipe_ingredients")
      .select("*")
      .in("recipe_id", recipeIds);

    // 4. Calculate per dog
    const byDog = dogs.map((dog: any) => {
      const dogSchedules = schedules.filter((s: any) => s.dog_id === dog.id);
      const totalGramsTarget = dog.peso_kg * 1000 * 2.5; // default 2.5%

      const ingredientMap: Record<string, any> = {};

      dogSchedules.forEach((sched: any) => {
        const recipeGrams = sched.gramos || totalGramsTarget;
        const ings = (recipeIngredients || []).filter((i: any) => i.recipe_id === sched.recipe_id);
        const totalIngGrams = ings.reduce((s: number, i: any) => s + i.quantity_per_serving_g, 0);

        ings.forEach((ing: any) => {
          const scaledGrams = (ing.quantity_per_serving_g / totalIngGrams) * recipeGrams;
          const key = ing.ingredient_name;
          if (!ingredientMap[key]) {
            ingredientMap[key] = {
              ingredient_name: ing.ingredient_name,
              ingredient_type: ing.ingredient_type,
              unit_type: ing.unit_type,
              unit_weight_g: ing.unit_weight_g,
              display_unit: ing.display_unit,
              total_g: 0,
            };
          }
          ingredientMap[key].total_g += scaledGrams;
        });
      });

      return {
        dog_id: dog.id,
        dog_name: dog.nombre,
        items: Object.values(ingredientMap).map((item: any) => ({
          ...item,
          total_g: Math.round(item.total_g),
          pieces: item.unit_type === 'g' || item.unit_type === 'kg' ? null : Math.round(item.total_g / (item.unit_weight_g || 1)),
        })),
      };
    });

    // 5. Combine all
    const combinedMap: Record<string, any> = {};
    byDog.forEach((dog: any) => {
      dog.items.forEach((item: any) => {
        const key = item.ingredient_name;
        if (!combinedMap[key]) {
          combinedMap[key] = { ...item, total_g: 0 };
        }
        combinedMap[key].total_g += item.total_g;
      });
    });

    const combined = Object.values(combinedMap).map((item: any) => ({
      ...item,
      total_g: Math.round(item.total_g),
      pieces: item.unit_type === 'g' || item.unit_type === 'kg' ? null : Math.round(item.total_g / (item.unit_weight_g || 1)),
    }));

    return NextResponse.json({ data: { combined, byDog } });
  } catch (error) {
    console.error("[Shopping List Generate] Error:", error);
    return NextResponse.json({ error: "Failed to generate shopping list" }, { status: 500 });
  }
}
