import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const recipeId = searchParams.get("recipe_id");
  if (!recipeId) return NextResponse.json({ error: "recipe_id required" }, { status: 400 });
  const { data, error } = await supabase.from("recipe_steps").select("*").eq("recipe_id", recipeId).order("step_number");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { recipe_id, step_number, instruction, duration_min, image_url } = body;
  if (!recipe_id || instruction == null) return NextResponse.json({ error: "recipe_id and instruction required" }, { status: 400 });
  const { data, error } = await supabase.from("recipe_steps").insert({
    recipe_id, step_number: step_number || 1, instruction, duration_min, image_url
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
  for (const k of ["step_number", "instruction", "duration_min", "image_url"]) {
    if (updates[k] !== undefined) valid[k] = updates[k];
  }
  const { data, error } = await supabase.from("recipe_steps").update(valid).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("recipe_steps").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
