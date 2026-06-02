import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const appSlug = searchParams.get("app");

  if (appSlug) {
    const { data: app } = await supabase.from("applications").select("id").eq("slug", appSlug).single();
    if (!app) return NextResponse.json({ error: "App not found" }, { status: 404 });

    const { data, error } = await supabase.from("app_settings").select("*").eq("application_id", app.id).single();
    if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data || null });
  }

  const { data, error } = await supabase.from("app_settings").select("*, applications!inner(slug, name)").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const validFields: Record<string, unknown> = {};
  const allowed = [
    "referral_commission_pct", "referral_free_months",
    "max_dogs_usuario", "max_dogs_institucion", "max_dogs_admin", "max_dogs_superadmin",
    "enabled_features", "security_config",
  ];
  for (const key of allowed) {
    if (updates[key] !== undefined) validFields[key] = updates[key];
  }

  const { data, error } = await supabase.from("app_settings").update(validFields).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
