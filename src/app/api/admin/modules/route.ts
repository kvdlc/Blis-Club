import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("modules").select("*").order("order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { stage_id, title, description, order, icon_name } = body;
  if (!stage_id || !title) return NextResponse.json({ error: "stage_id and title required" }, { status: 400 });
  const { data, error } = await supabase.from("modules").insert({ stage_id, title, description, order: order || 0, icon_name }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const valid: Record<string, unknown> = {};
  for (const k of ["title", "description", "order", "icon_name"]) { if (updates[k] !== undefined) valid[k] = updates[k]; }
  const { data, error } = await supabase.from("modules").update(valid).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("modules").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
