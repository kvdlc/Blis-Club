import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let query = supabase.from("kids_printables").select("*").order("sort_order", { ascending: true }).limit(500);
  if (category) query = query.eq("category_slug", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ printables: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const {
    category_slug, title, description, cover_url, pdf_url, pages,
    age_min, age_max, difficulty, is_free, is_published, sort_order, tags, data,
  } = body;

  if (!category_slug || !title) {
    return NextResponse.json({ error: "category_slug y title son requeridos" }, { status: 400 });
  }

  const { data: created, error } = await supabase
    .from("kids_printables")
    .insert({
      user_id: null,
      category_slug,
      title,
      description: description ?? null,
      cover_url: cover_url ?? null,
      pdf_url: pdf_url ?? null,
      pages: pages ?? 1,
      age_min: age_min ?? 3,
      age_max: age_max ?? 10,
      difficulty: difficulty ?? "facil",
      is_free: is_free ?? true,
      is_published: is_published ?? true,
      sort_order: sort_order ?? 0,
      tags: tags ?? [],
      data: data ?? {},
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ printable: created });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const allowed = [
    "category_slug", "title", "description", "cover_url", "pdf_url", "pages",
    "age_min", "age_max", "difficulty", "is_free", "is_published", "sort_order", "tags", "data",
  ];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of allowed) if (k in patch) update[k] = patch[k];

  const { data, error } = await supabase.from("kids_printables").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ printable: data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const { error } = await supabase.from("kids_printables").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
