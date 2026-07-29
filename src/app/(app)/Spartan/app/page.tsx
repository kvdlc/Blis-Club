import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import DashboardContent from "./DashboardContent";

async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Last 8 weeks of sessions for chart
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const { data: sessions } = await supabase
    .from("spartan_workout_sessions")
    .select("started_at, duration_minutes, series_data")
    .eq("user_id", userId)
    .eq("completed", true)
    .gte("started_at", eightWeeksAgo.toISOString())
    .order("started_at", { ascending: true });

  // All sessions for muscle distribution
  const { data: allSessions } = await supabase
    .from("spartan_workout_sessions")
    .select("started_at, series_data, routine_id, spartan_workout_routines!inner(muscle_group)")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("started_at", { ascending: false })
    .limit(30);

  // Habits for today
  const { data: habits } = await supabase
    .from("spartan_habits")
    .select("*, spartan_habit_entries!left(*)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order");

  // Training plan
  const { data: plan } = await supabase
    .from("spartan_training_plan")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, avatar_url")
    .eq("id", userId)
    .single();

  // Streak calculation
  const sessionDates = [...new Set((sessions ?? []).map((s: any) => new Date(s.started_at).toDateString()))].sort().reverse();
  let streak = 0;
  if (sessionDates.length > 0) {
    const t = new Date().toDateString();
    const y = new Date(today.getTime() - 86400000).toDateString();
    if (sessionDates[0] === t || sessionDates[0] === y) {
      streak = 1;
      for (let i = 1; i < sessionDates.length; i++) {
        const diff = (new Date(sessionDates[i - 1]).getTime() - new Date(sessionDates[i]).getTime()) / 86400000;
        if (diff === 1) streak++;
        else break;
      }
    }
  }

  // Weekly volume for chart (group sessions by ISO week)
  const weeklyVolume: Record<string, number> = {};
  for (const s of (sessions ?? [])) {
    const d = new Date(s.started_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay() + 1);
    const weekKey = weekStart.toISOString().split("T")[0];
    const sd = s.series_data;
    if (sd) {
      let vol = 0;
      for (const k of Object.keys(sd)) {
        const v = sd[k];
        if (v && Array.isArray(v.series)) {
          for (const entry of v.series) {
            if (entry.completed && entry.weight) vol += entry.weight * entry.reps;
          }
        }
      }
      weeklyVolume[weekKey] = (weeklyVolume[weekKey] || 0) + vol;
    }
  }

  // Muscle group distribution for pie chart
  const muscleVolume: Record<string, number> = {};
  for (const s of (allSessions ?? [])) {
    const muscleGroups = (s as any).spartan_workout_routines?.muscle_group;
    if (!muscleGroups) continue;
    const groups = muscleGroups.split("+").map((g: string) => g.trim());
    const sd = s.series_data;
    if (!sd) continue;
    let vol = 0;
    for (const k of Object.keys(sd)) {
      const v = sd[k];
      if (v && Array.isArray(v.series)) {
        for (const entry of v.series) {
          if (entry.completed && entry.weight) vol += entry.weight * entry.reps;
        }
      }
    }
    const perGroup = vol / groups.length;
    for (const g of groups) {
      muscleVolume[g] = (muscleVolume[g] || 0) + perGroup;
    }
  }

  // Last 7 days training status
  const last7Days: Array<{ day: string; trained: boolean; planned: boolean }> = [];
  const plannedDays = new Set((plan as any)?.custom_days ?? []);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
    const trained = sessionDates.includes(d.toDateString());
    const planned = plannedDays.has(dayName);
    last7Days.push({ day: dayName, trained, planned });
  }

  return {
    profile,
    streak,
    sessionsCount: (sessions ?? []).length,
    weeklyVolume: Object.entries(weeklyVolume).map(([week, vol]) => ({ week: week.slice(5), volume: Math.round(vol / 100) / 10 })),
    muscleVolume: Object.entries(muscleVolume).map(([muscle, vol]) => ({ muscle, volume: Math.round(vol / 100) / 10 })),
    habits: habits ?? [],
    todayStr,
    plan: plan as any,
    last7Days,
  };
}

export default async function SpartanDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const trial = await checkTrialServer(supabase, user.id, "Spartan");
  if (trial.isExpired) redirect("/Spartan/app/suscripcion");
  const cookieStore = await cookies();
  const referralCookie = cookieStore.get("blis_referral_code")?.value;
  if (referralCookie) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/referrals/claim`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch {}
  }
  const data = await getDashboardData(user.id);
  return <DashboardContent data={data} userId={user.id} />;
}
