import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET active challenges for the user + their completion status
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);

    // Get active challenges for guau app
    const { data: app } = await supabase.from("applications").select("id").eq("slug", "guau").single();
    const appId = app?.id;

    let query = supabase
      .from("weekly_challenges")
      .select("*")
      .lte("fecha_inicio", today)
      .gte("fecha_fin", today)
      .order("fecha_inicio", { ascending: true });

    if (appId) query = query.eq("application_id", appId);

    const { data: challenges, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get user's completions
    const { data: completions } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", user.id)
      .in("challenge_id", (challenges || []).map((c) => c.id));

    const completionMap = new Map((completions || []).map((c) => [c.challenge_id, c]));

    const enriched = (challenges || []).map((c) => ({
      ...c,
      completed: completionMap.has(c.id),
      completed_at: completionMap.get(c.id)?.completed_at ?? null,
    }));

    return NextResponse.json({ challenges: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST complete a challenge
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { challenge_id } = body;
    if (!challenge_id) return NextResponse.json({ error: "Missing challenge_id" }, { status: 400 });

    const { data, error } = await supabase
      .from("user_challenges")
      .insert({
        user_id: user.id,
        challenge_id,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If already completed, just return success
      if (error.message?.includes("duplicate")) {
        return NextResponse.json({ success: true, alreadyCompleted: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, completion: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
