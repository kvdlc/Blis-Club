import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const appSlug = searchParams.get("app");
  const category = searchParams.get("category");

  let query = supabase.from("nutrition_recipes").select("*").order("title");

  if (appSlug) {
    const { data: app } = await supabase.from("applications").select("id").eq("slug", appSlug).single();
    if (app) query = query.eq("application_id", app.id);
  }
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();

  const recipeFields = {
    title: body.title,
    description: body.description,
    category: body.category,
    image_url: body.image_url,
    video_url: body.video_url,
    is_therapeutic: body.is_therapeutic || false,
    health_tags: body.health_tags || [],
    source_book: body.source_book,
    prep_time_min: body.prep_time_min,
    difficulty: body.difficulty || "facil",
    kcal_per_100g: body.kcal_per_100g,
    is_detox: body.is_detox || false,
    application_id: body.application_id,
  };

  if (!recipeFields.title || !recipeFields.application_id) {
    return NextResponse.json({ error: "title and application_id are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("nutrition_recipes")
    .insert(recipeFields)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const validFields: Record<string, unknown> = {};
  const allowed = ["title", "description", "category", "image_url", "video_url", "is_therapeutic", "health_tags", "source_book", "prep_time_min", "difficulty", "kcal_per_100g", "is_detox"];
  for (const key of allowed) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("nutrition_recipes")
    .update(validFields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("nutrition_recipes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
