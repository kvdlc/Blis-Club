import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("recipe_id");

  if (!recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("recipe_ingredients")
    .select("*")
    .eq("recipe_id", recipeId)
    .order("ingredient_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { recipe_id, ingredient_name, quantity_per_serving_g, ingredient_type } = body;
  if (!recipe_id || !ingredient_name) return NextResponse.json({ error: "recipe_id and ingredient_name required" }, { status: 400 });

  const { data, error } = await supabase.from("recipe_ingredients").insert({
    recipe_id, ingredient_name, quantity_per_serving_g, ingredient_type: ingredient_type || "otro"
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const valid: Record<string, unknown> = {};
  for (const k of ["ingredient_name", "quantity_per_serving_g", "ingredient_type"]) {
    if (updates[k] !== undefined) valid[k] = updates[k];
  }
  const { data, error } = await supabase.from("recipe_ingredients").update(valid).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("recipe_ingredients").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
