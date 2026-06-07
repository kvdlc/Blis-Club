import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  
  const appId = searchParams.get("appId");
  const activeOnly = searchParams.get("active") === "true";
  
  let query = supabase
    .from("products")
    .select("*, applications:application_id (name, slug)")
    .order("created_at", { ascending: false });

  if (appId) {
    query = query.eq("application_id", appId);
  }
  
  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { name, description, price_cents, currency, image_url, stock_quantity, application_id, metadata } = body;

  if (!name || price_cents === undefined) {
    return NextResponse.json({ error: "name and price_cents are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      description,
      price_cents,
      currency: currency || "USD",
      image_url,
      stock_quantity,
      application_id,
      metadata,
    })
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
  const allowed = ["name", "description", "price_cents", "currency", "image_url", "is_active", "stock_quantity", "application_id", "metadata"];
  for (const key of allowed) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase
    .from("products")
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

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
