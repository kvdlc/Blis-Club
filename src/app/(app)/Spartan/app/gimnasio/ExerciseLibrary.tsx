"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, Dumbbell, X } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  gif_url: string;
  instructions: string | null;
}

const MUSCLE_GROUPS = [
  "Todos",
  "Abdomen",
  "Antebrazo",
  "Biceps",
  "Espalda",
  "Hombros",
  "Pecho",
  "Piernas",
  "Trapecio",
  "Triceps",
];

const EQUIPMENT = [
  "Todos",
  "peso corporal",
  "mancuerna/barra",
  "máquina",
  "banda elástica",
];

const DIFFICULTY = [
  "Todas",
  "principiante",
  "intermedio",
  "avanzado",
];

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("Todos");
  const [equipmentFilter, setEquipmentFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("spartan_exercise_library")
        .select("*")
        .eq("is_active", true)
        .order("muscle_group")
        .order("name");
      setExercises((data as Exercise[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = exercises;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((ex) => ex.name.toLowerCase().includes(q));
    }

    if (muscleFilter !== "Todos") {
      result = result.filter((ex) => ex.muscle_group.toLowerCase() === muscleFilter.toLowerCase());
    }

    if (equipmentFilter !== "Todos") {
      result = result.filter((ex) => ex.equipment === equipmentFilter);
    }

    return result;
  }, [exercises, search, muscleFilter, equipmentFilter]);

  // Group by muscle for display
  const grouped = useMemo(() => {
    const map: Record<string, Exercise[]> = {};
    for (const ex of filtered) {
      if (!map[ex.muscle_group]) map[ex.muscle_group] = [];
      map[ex.muscle_group].push(ex);
    }
    return map;
  }, [filtered]);

  const difficultyColor: Record<string, string> = {
    principiante: "bg-emerald-100 text-emerald-700",
    intermedio: "bg-amber-100 text-amber-700",
    avanzado: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold text-zinc-700">Biblioteca de ejercicios</h2>
          <span className="text-[10px] text-zinc-400">({filtered.length})</span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
            showFilters ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 mb-3 p-3 bg-white rounded-xl border border-zinc-100">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Grupo muscular</p>
            <div className="flex flex-wrap gap-1">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMuscleFilter(m)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    muscleFilter === m
                      ? "bg-red-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Equipo</p>
            <div className="flex flex-wrap gap-1">
              {EQUIPMENT.map((e) => (
                <button
                  key={e}
                  onClick={() => setEquipmentFilter(e)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    equipmentFilter === e
                      ? "bg-red-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Grid */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([muscle, exs]) => (
          <div key={muscle}>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">
              {muscle} ({exs.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exs.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="group bg-white rounded-xl border border-zinc-100 overflow-hidden hover:shadow-md hover:border-red-200 transition-all active:scale-[0.98] text-left"
                >
                  <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                    <img
                      src={ex.gif_url}
                      alt={ex.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-[9px] font-bold text-white uppercase">{ex.muscle_group}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-bold text-zinc-800 leading-tight line-clamp-2">
                      {ex.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${difficultyColor[ex.difficulty] || "bg-zinc-100 text-zinc-600"}`}>
                        {ex.difficulty}
                      </span>
                      <span className="text-[8px] text-zinc-400">{ex.equipment}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="w-10 h-10 text-zinc-300 mb-2" />
            <p className="text-sm font-medium text-zinc-500">Sin resultados</p>
            <p className="text-xs text-zinc-400">Prueba con otros filtros</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={() => setSelectedExercise(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors z-10"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>

            <div className="w-full aspect-square bg-zinc-100 rounded-2xl overflow-hidden mb-4">
              <img
                src={selectedExercise.gif_url}
                alt={selectedExercise.name}
                className="w-full h-full object-contain"
              />
            </div>

            <h2 className="text-lg font-extrabold text-zinc-900">{selectedExercise.name}</h2>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                {selectedExercise.muscle_group}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyColor[selectedExercise.difficulty] || "bg-zinc-100 text-zinc-600"}`}>
                {selectedExercise.difficulty}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                {selectedExercise.equipment}
              </span>
            </div>

            <button className="w-full mt-4 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors active:scale-95 flex items-center justify-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Agregar a mi rutina
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
