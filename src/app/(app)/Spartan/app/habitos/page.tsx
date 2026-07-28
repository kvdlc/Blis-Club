import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckSquare, Droplets, TrendingUp, TrendingDown, Wallet, Check } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHabitsData(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [habitsRes, entriesRes] = await Promise.all([
    supabase.from("spartan_habits").select("*").eq("user_id", userId).eq("is_active", true).order("sort_order", { ascending: true }),
    supabase.from("spartan_habit_entries").select("*").eq("user_id", userId).eq("date", today),
  ]);

  return { habits: habitsRes.data ?? [], todaysEntries: entriesRes.data ?? [] };
}

export default async function HabitosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { habits, todaysEntries } = await getHabitsData(user.id);

  const getEntryForHabit = (habitId: string) => todaysEntries.find((e: any) => e.habit_id === habitId);
  const completedCount = habits.filter((h: any) => { const entry = getEntryForHabit(h.id); return entry && entry.completed; }).length;

  const financialHabits = habits.filter((h: any) => h.type === "currency_income" || h.type === "currency_expense");
  const wellnessHabits = habits.filter((h: any) => h.type === "counter" || h.type === "measure" || h.type === "check");

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckSquare className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Hábitos</h1>
          <p className="text-xs text-zinc-500">Hoy: {completedCount}/{habits.length} completados</p>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl">
          <CheckSquare className="w-12 h-12 text-zinc-700 mb-3" />
          <h2 className="text-lg font-bold text-zinc-300">Sin hábitos configurados</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">Agrega hábitos como ingesta de agua, ingresos y gastos.</p>
          <button className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-95 shadow-[0_0_20px_rgba(190,11,60,0.3)]">Agregar hábito</button>
        </div>
      ) : (
        <>
          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400">Progreso de hoy</span>
              <span className="text-xs font-bold text-zinc-200">{completedCount}/{habits.length}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: habits.length > 0 ? `${(completedCount / habits.length) * 100}%` : "0%" }} />
            </div>
          </div>

          {financialHabits.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-zinc-300">Finanzas</h2>
              </div>
              <div className="space-y-2">
                {financialHabits.map((habit: any) => {
                  const entry: any = getEntryForHabit(habit.id);
                  const isIncome = habit.type === "currency_income";
                  return (
                    <div key={habit.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${entry?.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isIncome ? "bg-emerald-500/10 border-emerald-500/20" : "bg-spartan-500/10 border-spartan-500/20"}`}>
                        {isIncome ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-spartan-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-200">{habit.name}</p>
                        {entry && <p className={`text-lg font-extrabold mt-0.5 ${isIncome ? "text-emerald-400" : "text-spartan-400"}`}>{isIncome ? "+" : "-"}${Number(entry.value).toLocaleString("es-ES")}</p>}
                      </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${entry?.completed ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                        {entry?.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {wellnessHabits.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-bold text-zinc-300">Salud y bienestar</h2>
              </div>
              <div className="space-y-2">
                {wellnessHabits.map((habit: any) => {
                  const entry: any = getEntryForHabit(habit.id);
                  const target = habit.target_value || 1;
                  const current = entry?.value || 0;
                  const pct = Math.min(100, (current / target) * 100);
                  return (
                    <div key={habit.id} className={`p-4 rounded-2xl border ${entry?.completed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-bold text-zinc-200">{habit.name}</span>
                        </div>
                        <span className="text-xs font-bold text-zinc-400">{current}/{target} {habit.unit || ""}</span>
                      </div>
                      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: habit.color || "#3b82f6" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
