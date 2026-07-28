import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dumbbell, Plus, Clock, TrendingUp, Camera, Scale, Timer } from "lucide-react";
import ExerciseLibrary from "./ExerciseLibrary";

export const dynamic = "force-dynamic";

async function getWorkoutData(userId: string) {
  const supabase = await createClient();

  const [routinesRes, sessionsRes, measurementsRes] = await Promise.all([
    supabase.from("spartan_workout_routines").select("*, spartan_workout_exercises(*)").eq("user_id", userId).eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("spartan_workout_sessions").select("*").eq("user_id", userId).order("started_at", { ascending: false }).limit(10),
    supabase.from("spartan_workout_measurements").select("*").eq("user_id", userId).order("measured_at", { ascending: false }).limit(5),
  ]);

  return {
    routines: routinesRes.data ?? [],
    sessions: sessionsRes.data ?? [],
    measurements: measurementsRes.data ?? [],
  };
}

export default async function GimnasioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { routines, sessions, measurements } = await getWorkoutData(user.id);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Gimnasio</h1>
          <p className="text-xs text-zinc-500">Rutinas, ejercicios y seguimiento de progreso</p>
        </div>
      </div>

      {routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-zinc-100">
          <Dumbbell className="w-12 h-12 text-zinc-300 mb-3" />
          <h2 className="text-lg font-bold text-zinc-700">Sin rutinas todavía</h2>
          <p className="text-sm text-zinc-500 mt-1 max-w-xs">
            Crea tu primera rutina con ejercicios y GIFs animados.
          </p>
          <button className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors active:scale-95">
            Crear rutina
          </button>
        </div>
      ) : (
        <>
          {/* Rutinas */}
          <section>
            <h2 className="text-sm font-bold text-zinc-700 mb-3">Tus rutinas</h2>
            <div className="space-y-3">
              {routines.map((routine: any) => (
                <div key={routine.id} className="bg-white rounded-2xl border border-zinc-100 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-800">{routine.name}</h3>
                      {routine.muscle_group && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 mt-1 inline-block">
                          {routine.muscle_group}
                        </span>
                      )}
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors active:scale-95">
                      <Timer className="w-4 h-4" />
                    </button>
                  </div>
                  {routine.description && (
                    <p className="text-xs text-zinc-500 mb-3">{routine.description}</p>
                  )}
                  {/* Ejercicios */}
                  {routine.spartan_workout_exercises && routine.spartan_workout_exercises.length > 0 && (
                    <div className="space-y-2">
                      {routine.spartan_workout_exercises
                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                        .map((ex: any) => (
                          <div key={ex.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50">
                            {ex.gif_url ? (
                              <img src={ex.gif_url} alt={ex.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                <Dumbbell className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-zinc-700">{ex.name}</p>
                              <p className="text-[10px] text-zinc-500">
                                {ex.sets} x {ex.reps}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ""}
                                {ex.rest_seconds ? ` · ${ex.rest_seconds}s desc` : ""}
                              </p>
                              {ex.machine_name && (
                                <p className="text-[10px] text-red-500 font-medium">{ex.machine_name}</p>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Últimas sesiones */}
      {sessions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-700">Últimas sesiones</h2>
          </div>
          <div className="space-y-2">
            {sessions.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-700">
                    {new Date(s.started_at).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  {s.duration_minutes && (
                    <p className="text-[10px] text-zinc-500">{s.duration_minutes} min</p>
                  )}
                </div>
                {s.photo_url && <Camera className="w-3.5 h-3.5 text-zinc-400" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mediciones */}
      {measurements.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-700">Registro corporal</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max pb-2">
              {measurements.map((m: any) => (
                <div key={m.id} className="bg-white rounded-2xl border border-zinc-100 p-4 min-w-[140px]">
                  <p className="text-[10px] font-medium text-zinc-500 mb-2">
                    {new Date(m.measured_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                  {m.weight_kg && <p className="text-lg font-extrabold text-zinc-800">{m.weight_kg}<span className="text-xs font-normal text-zinc-400"> kg</span></p>}
                  {m.body_fat_pct && <p className="text-xs text-zinc-500">{m.body_fat_pct}% grasa</p>}
                  {m.photo_url && (
                    <img src={m.photo_url} alt="Progreso" className="w-full h-20 rounded-lg object-cover mt-2 bg-zinc-100" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ExerciseLibrary />
    </div>
  );
}
