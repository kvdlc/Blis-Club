import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

const ALLOWED_FIELDS = [
  "name",
  "price_cents",
  "original_price_cents",
  "izipay_price_id",
  "max_dogs",
  "features",
  "billing_interval",
  "application_id",
  "landing_visible",
  "landing_order",
  "landing_slug",
  "description",
  "badge",
  "payment_provider",
  "cta_text",
];

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const appSlug = searchParams.get("app");

  let query = supabase.from("plans").select("*").order("landing_order", { ascending: true });

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

  if (!body.name || !body.application_id) {
    return NextResponse.json({ error: "name and application_id are required" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) insertData[key] = body[key];
  }

  const { data, error } = await supabase.from("plans").insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const validFields: Record<string, unknown> = {};
  for (const key of ALLOWED_FIELDS) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase.from("plans").update(validFields).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}