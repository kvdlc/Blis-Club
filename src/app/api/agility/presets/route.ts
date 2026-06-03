import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();

    const { searchParams } = new URL(request.url);
    const dogId = searchParams.get("dog_id");
    const sessionTypeId = searchParams.get("session_type_id");

    if (!dogId || !sessionTypeId) {
      return NextResponse.json({ error: "Missing dog_id or session_type_id" }, { status: 400 });
    }

    // 1. Try user's preset for this dog + session type
    const { data: preset } = await supabase
      .from("agility_custom_circuits")
      .select("*")
      .eq("user_id", user.id)
      .eq("dog_id", dogId)
      .eq("session_type_id", sessionTypeId)
      .eq("is_active", true)
      .maybeSingle();

    if (preset) {
      return NextResponse.json({ preset });
    }

    // 2. Fallback to native circuit for this session type
    const { data: nativeCircuit } = await supabase
      .from("agility_circuits")
      .select("*")
      .eq("session_type_id", sessionTypeId)
      .eq("is_active", true)
      .eq("is_visible", true)
      .maybeSingle();

    if (nativeCircuit) {
      return NextResponse.json({ preset: nativeCircuit, isNative: true });
    }

    return NextResponse.json({ preset: null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const serverClient = await createClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();

    const body = await request.json();
    const { dog_id, session_type_id, difficulty_level, obstacles } = body;

    if (!dog_id || !session_type_id || !obstacles) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upsert preset: find existing by user+dog+session_type
    const { data: existing } = await supabase
      .from("agility_custom_circuits")
      .select("id")
      .eq("user_id", user.id)
      .eq("dog_id", dog_id)
      .eq("session_type_id", session_type_id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from("agility_custom_circuits")
        .update({
          obstacles,
          difficulty_level: difficulty_level || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    } else {
      // Get session type name for the preset name
      const { data: st } = await supabase
        .from("agility_session_types")
        .select("name")
        .eq("id", session_type_id)
        .single();

      const { data, error } = await supabase
        .from("agility_custom_circuits")
        .insert({
          user_id: user.id,
          dog_id,
          session_type_id,
          name: st?.name ? `Mi ${st.name}` : "Plantilla personalizada",
          description: "Configuración guardada automáticamente",
          difficulty_level: difficulty_level || null,
          obstacles,
          is_active: true,
          is_visible: true,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    }

    return NextResponse.json({ preset: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
