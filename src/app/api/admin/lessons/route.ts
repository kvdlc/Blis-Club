import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("module_id");
  if (!moduleId) return NextResponse.json({ error: "module_id required" }, { status: 400 });
  const { data, error } = await supabase.from("lessons").select("*").eq("module_id", moduleId).order("order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { module_id, title, type, order, content_json } = body;
  if (!module_id || !title) return NextResponse.json({ error: "module_id and title required" }, { status: 400 });
  const { data, error } = await supabase.from("lessons").insert({
    module_id, title, type: type || "theory", order: order || 0, content_json: content_json || {}
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
  for (const k of ["title", "type", "order", "content_json"]) { if (updates[k] !== undefined) valid[k] = updates[k]; }
  const { data, error } = await supabase.from("lessons").update(valid).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("lessons").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
