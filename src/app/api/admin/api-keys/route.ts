import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .order("key_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const keys = (data || []).map((row) => ({
    ...row,
    key_value: maskValue(row.key_value),
  }));

  return NextResponse.json({ data: keys });
}

export async function POST(request: Request) {
  const supabase = createServiceClient();
  const body = await request.json();
  const { key_name, key_value } = body;

  if (!key_name || key_value === undefined) {
    return NextResponse.json({ error: "key_name y key_value son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("api_keys")
    .upsert({ key_name: key_name.trim().toLowerCase(), key_value, is_global: true }, { onConflict: "key_name" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: { ...data, key_value: maskValue(data.key_value) } });
}

export async function DELETE(request: Request) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const keyName = searchParams.get("key_name");

  if (!keyName) {
    return NextResponse.json({ error: "key_name requerido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("key_name", keyName);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

function maskValue(value: string): string {
  if (!value || value.length <= 8) return "••••";
  return value.slice(0, 4) + "••••" + value.slice(-4);
}
