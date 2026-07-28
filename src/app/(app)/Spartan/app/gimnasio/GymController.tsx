"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Flame,
  TrendingUp,
  Plus,
  Timer,
  Pencil,
} from "lucide-react";
import ExerciseLibrary from "./ExerciseLibrary";
import MuscleGroupView from "./MuscleGroupView";
import RoutineBuilder from "./RoutineBuilder";
import WorkoutSession from "./WorkoutSession";

interface WorkoutExercise {
  id: string;
  name: string;
  gif_url: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
  rest_seconds: number;
}

interface Routine {
  id: string;
  name: string;
  muscle_group: string | null;
  description: string | null;
  exercise_count: number;
}

interface SelectedRoutine {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

interface EditingRoutine {
  id: string;
  name: string;
  muscle_group: string | null;
  exercises: Array<{
    id: string;
    name: string;
    gif_url: string;
    muscle_group: string;
    sets: number;
    reps: number;
    weight_kg: number | null;
    rest_seconds: number;
    exercise_library_id?: string | null;
  }>;
}

type ViewState = "main" | "muscle" | "builder" | "session";

export default function GymController({ userId }: { userId: string }) {
  const [view, setView] = useState<ViewState>("main");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedRoutine, setSelectedRoutine] = useState<SelectedRoutine | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<EditingRoutine | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [stats, setStats] = useState({ streak: 0, sessionsThisWeek: 0, totalVolume: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const [routinesRes, sessionsRes] = await Promise.all([
      supabase
        .from("spartan_workout_routines")
        .select("id, name, muscle_group, description")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("spartan_workout_sessions")
        .select("started_at, duration_minutes, series_data")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("started_at", { ascending: false })
        .limit(30),
    ]);

    const routineData = routinesRes.data ?? [];
    const sessionData = sessionsRes.data ?? [];

    // Count exercises per routine
    const routinesWithCounts = await Promise.all(
      routineData.map(async (r: any) => {
        const { count } = await supabase
          .from("spartan_workout_exercises")
          .select("*", { count: "exact", head: true })
          .eq("routine_id", r.id);
        return { ...r, exercise_count: count ?? 0 };
      })
    );

    // Calculate stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekSessions = (sessionData as any[]).filter(
      (s) => new Date(s.started_at) >= oneWeekAgo
    );

    let totalVolume = 0;
    thisWeekSessions.forEach((s: any) => {
      if (s.series_data) {
        const data = s.series_data as Record<string, (number | null)[]>;
        Object.values(data).forEach((weights) => {
          weights.forEach((w) => {
            if (w) totalVolume += w;
          });
        });
      }
    });

    // Simple streak calculation
    let streak = 0;
    const sortedSessions = (sessionData as any[])
      .map((s) => new Date(s.started_at).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i);

    const today = new Date().toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    if (sortedSessions[0] === today || sortedSessions[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sortedSessions.length; i++) {
        const prev = new Date(sortedSessions[i - 1]);
        const curr = new Date(sortedSessions[i]);
        const diff = (prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000);
        if (diff === 1) streak++;
        else break;
      }
    }

    setRoutines(routinesWithCounts as Routine[]);
    setStats({
      streak,
      sessionsThisWeek: thisWeekSessions.length,
      totalVolume,
    });
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleStartRoutine = async (routine: Routine) => {
    const supabase = createClient();
    const { data: exercises } = await supabase
      .from("spartan_workout_exercises")
      .select("*")
      .eq("routine_id", routine.id)
      .order("sort_order");

    const exs: WorkoutExercise[] = (exercises ?? []).map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      gif_url: ex.gif_url ?? "",
      muscle_group: ex.muscle_group,
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      weight_kg: ex.weight_kg,
      rest_seconds: ex.rest_seconds ?? 60,
    }));

    setSelectedRoutine({ id: routine.id, name: routine.name, exercises: exs });
    setView("session");
  };

  const handleEditRoutine = async (routine: Routine) => {
    const supabase = createClient();
    const { data: exercises } = await supabase
      .from("spartan_workout_exercises")
      .select("*")
      .eq("routine_id", routine.id)
      .order("sort_order");

    const exs = (exercises ?? []).map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      gif_url: ex.gif_url ?? "",
      muscle_group: ex.muscle_group,
      sets: ex.sets ?? 3,
      reps: ex.reps ?? 10,
      weight_kg: ex.weight_kg,
      rest_seconds: ex.rest_seconds ?? 60,
      exercise_library_id: ex.exercise_library_id ?? null,
    }));

    setEditingRoutine({
      id: routine.id,
      name: routine.name,
      muscle_group: routine.muscle_group,
      exercises: exs,
    });
    setView("builder");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-spartan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Main view */}
      {view === "main" && (
        <>
          {/* Hero stats card */}
          <div className="rounded-3xl bg-gradient-to-br from-spartan-950 to-zinc-950 border border-white/[0.06] p-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-spartan-600/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-spartan-600/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-spartan-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Gimnasio</h1>
                <p className="text-xs text-zinc-500">Rutinas, ejercicios y progreso</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-lg font-extrabold text-white">{stats.streak}</span>
                </div>
                <p className="text-[10px] text-zinc-500">días de racha</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Timer className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-lg font-extrabold text-white">{stats.sessionsThisWeek}</span>
                </div>
                <p className="text-[10px] text-zinc-500">esta semana</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-lg font-extrabold text-white">
                    {(stats.totalVolume / 1000).toFixed(1)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">toneladas/sem</p>
              </div>
            </div>
          </div>

          {/* Mis rutinas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-zinc-200">Mis rutinas</h2>
              <button
                onClick={() => setView("builder")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-spartan-600/10 border border-spartan-500/20 text-spartan-400 text-[10px] font-bold hover:bg-spartan-600/20 transition-colors active:scale-[0.97]"
              >
                <Plus className="w-3 h-3" />
                Nueva
              </button>
            </div>

            {routines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <Dumbbell className="w-10 h-10 text-zinc-700 mb-2" />
                <p className="text-sm font-medium text-zinc-500">Sin rutinas todavía</p>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                  Crea tu primera rutina con ejercicios y GIFs animados.
                </p>
                <button
                  onClick={() => setView("builder")}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(190,11,60,0.3)]"
                >
                  Crear rutina
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map((routine) => (
                  <div
                    key={routine.id}
                    className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 hover:border-spartan-500/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">{routine.name}</h3>
                        {routine.muscle_group && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-spartan-500/10 text-spartan-400 border border-spartan-500/20 mt-1 inline-block">
                            {routine.muscle_group}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-zinc-600">
                        {routine.exercise_count} ejerc.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold hover:bg-white/10 transition-all active:scale-[0.97]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleStartRoutine(routine)}
                        className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-spartan-600 to-spartan-700 text-white text-sm font-bold hover:from-spartan-500 hover:to-spartan-600 transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(190,11,60,0.3)]"
                      >
                        <Timer className="w-4 h-4" />
                        Iniciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Exercise Library */}
          <ExerciseLibrary
            onSelectMuscle={(muscle) => {
              setSelectedMuscle(muscle);
              setView("muscle");
            }}
          />
        </>
      )}

      {/* Muscle group view */}
      <AnimatePresence>
        {view === "muscle" && (
          <MuscleGroupView
            muscleGroup={selectedMuscle}
            onBack={() => setView("main")}
            onSelectExercise={() => {}}
          />
        )}
      </AnimatePresence>

      {/* Routine builder */}
      <AnimatePresence>
        {view === "builder" && (
          <RoutineBuilder
            userId={userId}
            editingRoutine={editingRoutine}
            onClose={() => {
              setView("main");
              setEditingRoutine(null);
            }}
            onSave={() => {
              setView("main");
              setEditingRoutine(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
      </AnimatePresence>

      {/* Workout session */}
      <AnimatePresence>
        {view === "session" && selectedRoutine && (
          <WorkoutSession
            userId={userId}
            routineId={selectedRoutine.id}
            routineName={selectedRoutine.name}
            exercises={selectedRoutine.exercises}
            onClose={() => {
              setView("main");
              setSelectedRoutine(null);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
