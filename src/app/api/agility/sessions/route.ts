import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const dogId = searchParams.get("dog_id");

  if (!dogId) {
    return NextResponse.json({ error: "Missing dog_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("agility_sessions")
    .select("*")
    .eq("dog_id", dogId)
    .order("fecha", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
