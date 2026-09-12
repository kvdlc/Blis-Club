import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const keyName = searchParams.get("key");

  if (!keyName) {
    return NextResponse.json({ error: "key parameter required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("key_name, key_value")
    .eq("key_name", keyName)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ value: data.key_value });
}
