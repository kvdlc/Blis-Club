import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keys, notes, favorites } = body as {
      keys?: Record<string, string>;
      notes?: Record<string, string>;
      favorites?: string[];
    };

    if (!keys || typeof keys !== "object" || Object.keys(keys).length === 0) {
      return NextResponse.json({ error: "keys object required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const rows = Object.entries(keys).map(([key_name, key_value]) => ({
      key_name: key_name.trim().toLowerCase(),
      key_value,
      is_global: true,
    }));

    const { error } = await supabase.from("api_keys").upsert(rows, { onConflict: "key_name" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, saved: rows.length, notes: notes || {}, favorites: favorites || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Error al importar" }, { status: 500 });
  }
}
