import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("agility_obstacles")
    .select("*")
    .or("is_custom.eq.false,approved_by_admin.eq.true")
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ obstacles: data });
}
