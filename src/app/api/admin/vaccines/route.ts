import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const appSlug = searchParams.get("app");

  let query = supabase.from("vaccines").select("*").order("name");

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
  const { name, group_name, vaccine_group, description, severity, contagion_type, mandatory, dose_count, application_id } = body;

  if (!name || !application_id) {
    return NextResponse.json({ error: "name and application_id are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("vaccines")
    .insert({ name, group_name, vaccine_group, description, severity, contagion_type, mandatory, dose_count, application_id })
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
  const allowed = ["name", "group_name", "vaccine_group", "description", "severity", "contagion_type", "mandatory", "dose_count"];
  for (const key of allowed) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase.from("vaccines").update(validFields).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("vaccines").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
