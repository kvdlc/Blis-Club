import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("agility_circuits")
    .select("*, session_type:session_type_id(*)")
    .eq("is_active", true)
    .eq("is_visible", true)
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also get user's custom circuits
  let customCircuits: any[] = [];
  if (user) {
    const { data: custom } = await supabase
      .from("agility_custom_circuits")
      .select("*, session_type:session_type_id(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("is_visible", true)
      .order("name", { ascending: true });
    customCircuits = custom || [];
  }

  return NextResponse.json({ circuits: data, customCircuits });
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, description, session_type_id, difficulty_level, obstacles, dog_id } = body;

    if (!name || !obstacles || obstacles.length === 0) {
      return NextResponse.json({ error: "Name and obstacles are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("agility_custom_circuits")
      .insert({
        user_id: user.id,
        dog_id: dog_id || null,
        name,
        description: description || null,
        session_type_id: session_type_id || null,
        difficulty_level: difficulty_level || null,
        obstacles,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ circuit: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: existing } = await supabase
      .from("agility_custom_circuits")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || (existing as any).user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("agility_custom_circuits")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ circuit: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: existing } = await supabase
      .from("agility_custom_circuits")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existing || (existing as any).user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await supabase.from("agility_custom_circuits").delete().eq("id", id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
