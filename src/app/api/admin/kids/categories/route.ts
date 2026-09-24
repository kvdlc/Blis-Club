import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("kids_categories").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data ?? [] });
}

export async function PUT(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json().catch(() => ({}));
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id es requerido" }, { status: 400 });

  const allowed = ["name", "emoji", "description", "color", "sort_order", "is_active"];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in patch) update[k] = patch[k];

  const { data, error } = await supabase.from("kids_categories").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}
