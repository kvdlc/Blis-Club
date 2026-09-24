import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase.from("kids_activities").select("*").order("created_at", { ascending: false }).limit(500);
  if (category) query = query.eq("category_slug", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activities: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const {
    category_slug, title, description, cover_url, age_min, age_max,
    difficulty, is_free, is_published, is_ai_generated, tags, data,
  } = body;

  if (!category_slug || !title) {
    return NextResponse.json({ error: "category_slug y title son requeridos" }, { status: 400 });
  }

  const { data: created, error } = await supabase
    .from("kids_activities")
    .insert({
      user_id: null,
      category_slug,
      title,
      description: description ?? null,
      cover_url: cover_url ?? null,
      age_min: age_min ?? 3,
      age_max: age_max ?? 10,
      difficulty: difficulty ?? "facil",
      is_free: is_free ?? true,
      is_published: is_published ?? true,
      is_ai_generated: is_ai_generated ?? false,
      tags: tags ?? [],
      data: data ?? {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: created });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const allowed = [
    "category_slug", "title", "description", "cover_url", "age_min", "age_max",
    "difficulty", "is_free", "is_published", "is_ai_generated", "tags", "data",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (k in patch) update[k] = patch[k];

  const { data, error } = await supabase.from("kids_activities").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const { error } = await supabase.from("kids_activities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
