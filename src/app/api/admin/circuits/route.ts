import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const appSlug = searchParams.get("app");

  let query = supabase.from("agility_circuits").select("*, session_type:session_type_id(*)").order("name", { ascending: true });

  if (appSlug) {
    const { data: app } = await supabase.from("applications").select("id").eq("slug", appSlug).single();
    if (app) query = query.eq("application_id", app.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { name, slug, description, session_type_id, difficulty_level, standard_obstacles, is_active, is_visible, application_id } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("agility_circuits")
    .insert({ name, slug, description, session_type_id, difficulty_level, standard_obstacles, is_active, is_visible, application_id })
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

  const { data, error } = await supabase.from("agility_circuits").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("agility_circuits").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
