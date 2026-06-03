import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data, error } = await supabase.from("purchase_stores").select("*").eq("user_id", userId).order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { user_id, name, location, color } = body;
  if (!user_id || !name) return NextResponse.json({ error: "user_id and name required" }, { status: 400 });

  const { data, error } = await supabase.from("purchase_stores").insert({ user_id, name, location, color }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const valid: Record<string, unknown> = {};
  for (const k of ["name", "location", "color"]) {
    if (updates[k] !== undefined) valid[k] = updates[k];
  }
  const { data, error } = await supabase.from("purchase_stores").update(valid).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await supabase.from("purchase_stores").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
