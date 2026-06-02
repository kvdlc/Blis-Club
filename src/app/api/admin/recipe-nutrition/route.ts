import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("recipe_id");
  if (!recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });
  const { data, error } = await supabase.from("recipe_nutrition_facts").select("*").eq("recipe_id", recipeId).maybeSingle();
  if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || null });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { recipe_id, ...facts } = body;
  if (!recipe_id) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });
  const { data, error } = await supabase.from("recipe_nutrition_facts").upsert({ recipe_id, ...facts }, { onConflict: "recipe_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
