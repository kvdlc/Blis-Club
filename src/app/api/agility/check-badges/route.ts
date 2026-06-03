import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { dog_id } = body;
    if (!dog_id) return NextResponse.json({ error: "Missing dog_id" }, { status: 400 });

    // Verify ownership
    const { data: dog } = await supabase.from("dogs").select("owner_id").eq("id", dog_id).single();
    if (!dog || (dog as { owner_id: string }).owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all agility sessions for this dog
    const { data: sessions } = await supabase
      .from("agility_sessions")
      .select("*")
      .eq("dog_id", dog_id)
      .order("created_at", { ascending: true });

    const sessionList = (sessions as any[]) || [];
    const awarded: string[] = [];

    // Get existing user badges
    const { data: existingBadges } = await supabase
      .from("user_badges")
      .select("badge_id, badges(name)")
      .eq("user_id", user.id);

    const existingBadgeNames = new Set(
      (existingBadges || []).map((b: any) => b.badges?.name).filter(Boolean)
    );

    // Helper to check and award
    const checkAndAward = async (badgeName: string, condition: boolean) => {
      if (condition && !existingBadgeNames.has(badgeName)) {
        const { data: badge } = await supabase
          .from("badges")
          .select("id")
          .eq("name", badgeName)
          .eq("badge_type", "agility")
          .single();

        if (badge) {
          await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_id: (badge as { id: string }).id,
            earned_at: new Date().toISOString(),
          });
          awarded.push(badgeName);
        }
      }
    };

    // Badge checks
    await checkAndAward("Primer paso", sessionList.length >= 1);
    await checkAndAward("Racha de 3 días", sessionList.length >= 3);
    await checkAndAward("Racha de 7 días", sessionList.length >= 7);
    await checkAndAward("Racha de 14 días", sessionList.length >= 14);
    await checkAndAward("Racha de 30 días", sessionList.length >= 30);
    await checkAndAward("Clean Run", sessionList.some((s) => s.clean_run));
    await checkAndAward("3 Clean Runs", sessionList.filter((s) => s.clean_run).length >= 3);
    await checkAndAward("Récord personal", sessionList.length >= 2);
    await checkAndAward("Mejoró el récord 3 veces", (() => {
      const withTime = sessionList.filter((s) => (s.circuit_time_seconds ?? 0) > 0);
      if (withTime.length < 4) return false;
      let improvements = 0;
      let best = withTime[0].circuit_time_seconds;
      for (let i = 1; i < withTime.length; i++) {
        if (withTime[i].circuit_time_seconds < best) {
          improvements++;
          best = withTime[i].circuit_time_seconds;
        }
      }
      return improvements >= 3;
    })());
    await checkAndAward("10 sesiones", sessionList.length >= 10);
    await checkAndAward("20 sesiones", sessionList.length >= 20);
    await checkAndAward("50 sesiones", sessionList.length >= 50);
    await checkAndAward("Velocidad demonio", sessionList.some((s) => (s.net_time_seconds ?? 0) > 0 && (s.net_time_seconds ?? 0) < 30));
    await checkAndAward("Maestro del slalom", sessionList.filter((s) => s.activity_type?.toLowerCase().includes("slalom") && (s.fouls_total ?? 0) === 0).length >= 5);
    await checkAndAward("Rey del contacto", sessionList.filter((s) => s.activity_type?.toLowerCase().includes("contacto") && (s.fouls_total ?? 0) === 0).length >= 5);
    await checkAndAward("10 obstáculos", sessionList.some((s) => (s.obstacles_completed_count ?? 0) >= 10));
    await checkAndAward("15 obstáculos", sessionList.some((s) => (s.obstacles_completed_count ?? 0) >= 15));
    await checkAndAward("Competidor", sessionList.filter((s) => s.clean_run && (s.net_time_seconds ?? 0) > 0 && (s.net_time_seconds ?? 0) < 40).length >= 5);
    await checkAndAward("Experto en variedad", [...new Set(sessionList.map((s) => s.activity_type))].length >= 5);

    return NextResponse.json({ success: true, awarded });
  } catch (err: any) {
    console.error("Badge award error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
