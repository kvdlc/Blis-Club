import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("email_senders").select("*").order("nombre");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("email_senders").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...updates } = body;
  const supabase = createServiceClient();

  // If setting is_default, clear other defaults first
  if (updates.is_default) {
    await supabase.from("email_senders").update({ is_default: false }).eq("is_default", true);
  }

  const { data, error } = await supabase.from("email_senders").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  const supabase = createServiceClient();
  const { error } = await supabase.from("email_senders").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}