import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      dog_id,
      fecha,
      activity_type,
      duration_min,
      circuit_time_seconds,
      notes,
      session_type_id,
      lesson_id,
      difficulty_level,
      fouls_total,
      clean_run,
      time_fault,
      raw_time_seconds,
      net_time_seconds,
      obstacles,
      penalty_settings,
      photo_urls,
      video_url,
    } = body;

    if (!dog_id || !fecha || !activity_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert session
    const { data: sessionData, error: sessionError } = await supabase
      .from("agility_sessions")
      .insert({
        dog_id,
        fecha,
        activity_type,
        duration_min: duration_min ?? 0,
        circuit_time_seconds: circuit_time_seconds ?? null,
        notes: notes ?? null,
        session_type_id: session_type_id ?? null,
        lesson_id: lesson_id ?? null,
        difficulty_level: difficulty_level ?? null,
        fouls_total: fouls_total ?? 0,
        clean_run: clean_run ?? false,
        time_fault: time_fault ?? false,
        raw_time_seconds: raw_time_seconds ?? null,
        net_time_seconds: net_time_seconds ?? null,
        obstacles_completed_count: obstacles?.length ?? 0,
        video_url: video_url ?? photo_urls?.[0] ?? null,
      })
      .select()
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: sessionError?.message || "Insert failed" }, { status: 500 });
    }

    // Insert session obstacles
    if (obstacles && obstacles.length > 0) {
      const sessionObstacles = obstacles.map((o: any) => ({
        session_id: sessionData.id,
        obstacle_id: o.obstacle_id,
        used: o.used ?? true,
        fouls_count: o.fouls_count ?? 0,
        notes: o.notes ?? null,
      }));

      const { error: obsError } = await supabase
        .from("agility_session_obstacles")
        .insert(sessionObstacles);

      if (obsError) {
        console.error("Error inserting session obstacles:", obsError);
      }
    }

    // Insert penalty settings
    if (penalty_settings && penalty_settings.length > 0) {
      const penalties = penalty_settings.map((p: any) => ({
        session_id: sessionData.id,
        foul_type_id: p.foul_type_id,
        penalty_seconds: p.penalty_seconds,
      }));

      const { error: penError } = await supabase
        .from("agility_session_penalty_settings")
        .insert(penalties);

      if (penError) {
        console.error("Error inserting penalty settings:", penError);
      }
    }

    // Update lesson progress if lesson_id provided
    if (lesson_id) {
      await supabase.from("user_progress").upsert({
        user_id: user.id,
        lesson_id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });
    }

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .eq("streak_type", "agility")
      .maybeSingle();

    if (streak) {
      const s = streak as { id: string; last_activity_date: string; current_streak: number; longest_streak: number };
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (s.last_activity_date !== today) {
        if (s.last_activity_date === yesterdayStr) {
          const newStreak = s.current_streak + 1;
          await supabase.from("user_streaks").update({
            current_streak: newStreak,
            longest_streak: Math.max(s.longest_streak, newStreak),
            last_activity_date: today,
          }).eq("id", s.id);
        } else {
          await supabase.from("user_streaks").update({
            current_streak: 1,
            last_activity_date: today,
          }).eq("id", s.id);
        }
      }
    } else {
      await supabase.from("user_streaks").insert({
        user_id: user.id,
        streak_type: "agility",
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
    }

    // Auto-complete challenges
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data: activeChallenges } = await supabase
        .from("weekly_challenges")
        .select("*")
        .lte("fecha_inicio", today)
        .gte("fecha_fin", today);

      if (activeChallenges && activeChallenges.length > 0) {
        const { data: existingCompletions } = await supabase
          .from("user_challenges")
          .select("challenge_id")
          .eq("user_id", user.id)
          .in("challenge_id", activeChallenges.map((c: any) => c.id));

        const completedIds = new Set((existingCompletions || []).map((c: any) => c.challenge_id));

        for (const challenge of activeChallenges) {
          if (completedIds.has(challenge.id)) continue;

          const title = (challenge.title || "").toLowerCase();
          const desc = (challenge.description || "").toLowerCase();

          let shouldComplete = false;

          // Check challenge criteria
          if (title.includes("sesion") || title.includes("sesión") || desc.includes("sesión")) {
            // Count sessions this week
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const { count } = await supabase
              .from("agility_sessions")
              .select("*", { count: "exact", head: true })
              .eq("dog_id", dog_id)
              .gte("fecha", weekStart.toISOString().slice(0, 10));
            const target = parseInt(title.match(/\d+/)?.[0] || "1");
            if ((count || 0) >= target) shouldComplete = true;
          }

          if (title.includes("clean run") || title.includes("clean_run") || title.includes("sin faltas")) {
            if (clean_run) shouldComplete = true;
          }

          if (title.includes("récord") || title.includes("record") || title.includes("mejorar")) {
            // Simple check: any session with time
            if ((circuit_time_seconds ?? 0) > 0) shouldComplete = true;
          }

          if (title.includes("obstáculo") || title.includes("obstaculo")) {
            const target = parseInt(title.match(/\d+/)?.[0] || "5");
            if ((obstacles?.length || 0) >= target) shouldComplete = true;
          }

          if (shouldComplete) {
            await supabase.from("user_challenges").insert({
              user_id: user.id,
              challenge_id: challenge.id,
              completed: true,
              completed_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (e) {
      console.error("Auto-complete challenges error:", e);
    }

    return NextResponse.json({ session: sessionData, success: true });
  } catch (err: any) {
    console.error("Agility session POST error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session id" }, { status: 400 });
    }

    // Verify ownership via dog
    const { data: session } = await supabase
      .from("agility_sessions")
      .select("id, dog_id, dogs!inner(owner_id)")
      .eq("id", sessionId)
      .single();

    const ownerId = (session as any)?.dogs?.owner_id;
    if (ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await supabase.from("agility_sessions").delete().eq("id", sessionId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
