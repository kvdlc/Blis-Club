"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AgilityObstaclePicker } from "@/components/AgilityObstaclePicker";
import type { Dog, AgilityObstacle, AgilitySessionType } from "@/types/database";
import { X, Save, Calendar, Clock, Bookmark, Zap } from "lucide-react";
import { getTodayLocal } from "@/lib/dates";

interface Props {
  dog: Dog;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function AgilityForm({ dog, userId, onClose, onSaved }: Props) {
  const supabase = createClient();

  const [sessionTypeId, setSessionTypeId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("principiante");
  const [fecha, setFecha] = useState(getTodayLocal());
  const [durationMin, setDurationMin] = useState(15);
  const [circuitTimeSec, setCircuitTimeSec] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedObstacles, setSelectedObstacles] = useState<AgilityObstacle[]>([]);
  const [foulsMap, setFoulsMap] = useState<Record<string, number>>({});
  const [sessionTypes, setSessionTypes] = useState<AgilitySessionType[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveAsCircuit, setSaveAsCircuit] = useState(false);
  const [circuitName, setCircuitName] = useState("");

  useEffect(() => {
    fetch("/api/agility/session-types")
      .then((r) => r.json())
      .then((j) => { if (j.sessionTypes) setSessionTypes(j.sessionTypes); });
  }, []);

  const handleFoulsChange = (obstacleId: string, fouls: number) => {
    setFoulsMap((prev) => ({ ...prev, [obstacleId]: fouls }));
  };

  const handleSubmit = async () => {
    setSaving(true);

    const totalFouls = Object.values(foulsMap).reduce((a, b) => a + b, 0);
    const genericPenalty = 5;
    const totalPenalty = totalFouls * genericPenalty;
    const rawTime = circuitTimeSec ?? 0;
    const netTime = rawTime + totalPenalty;

    const sessionType = sessionTypes.find((s) => s.id === sessionTypeId);

    const payload = {
      dog_id: dog.id,
      fecha,
      activity_type: sessionType?.name || "Entrenamiento libre",
      duration_min: durationMin,
      circuit_time_seconds: circuitTimeSec,
      notes,
      session_type_id: sessionTypeId,
      lesson_id: null,
      difficulty_level: difficulty,
      fouls_total: totalFouls,
      clean_run: totalFouls === 0,
      time_fault: false,
      raw_time_seconds: rawTime,
      net_time_seconds: netTime,
      obstacles: selectedObstacles.map((o) => ({
        obstacle_id: o.id,
        used: true,
        fouls_count: foulsMap[o.id] ?? 0,
        notes: null,
      })),
      penalty_settings: [],
      photo_urls: [],
    };

    try {
      const res = await fetch("/api/agility/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        // Save as custom circuit if requested
        if (saveAsCircuit && circuitName.trim()) {
          try {
            await fetch("/api/agility/circuits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: circuitName.trim(),
                description: notes || null,
                session_type_id: sessionTypeId,
                difficulty_level: difficulty,
                dog_id: dog.id,
                obstacles: selectedObstacles.map((o, i) => ({ obstacle_id: o.id, order: i + 1 })),
              }),
            });
          } catch (e) {
            console.error("Save circuit error:", e);
          }
        }
        // Check for new badges
        try {
          await fetch("/api/agility/check-badges", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dog_id: dog.id }),
          });
        } catch (e) {
          console.error("Badge check error:", e);
        }
        onSaved();
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-5 bg-white border-2 border-zinc-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-zinc-800">Circuito personalizado</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      {/* Session Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500">Tipo de sesión</label>
        <div className="grid grid-cols-2 gap-2">
          {sessionTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => setSessionTypeId(st.id)}
              className={`p-3 rounded-xl border-2 text-left text-xs transition-all ${ sessionTypeId === st.id ? "border-accent-400 bg-accent-50" : "border-zinc-100" }`}
            >
              <span className="font-bold text-zinc-700">{st.name}</span>
              <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{st.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500">Nivel</label>
        <div className="flex gap-2">
          {["principiante", "intermedio", "avanzado"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficulty(lvl)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${ difficulty === lvl ? "bg-accent-600 text-white" : "bg-zinc-100 text-zinc-600" }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Duración (min)
          </label>
          <input
            type="number"
            value={durationMin}
            onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Circuit time */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-500">Tiempo de circuito (segundos)</label>
        <input
          type="number"
          value={circuitTimeSec ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            setCircuitTimeSec(val ? parseInt(val) : null);
          }}
          placeholder="Ej: 45"
          className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>

      {/* Obstacles */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500">Obstáculos y faltas</label>
        <AgilityObstaclePicker
          selected={selectedObstacles}
          onChange={setSelectedObstacles}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-500">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="¿Cómo le fue a tu perro?"
          rows={3}
          className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Save as reusable circuit */}
      <div className="space-y-2">
        <button
          onClick={() => setSaveAsCircuit(!saveAsCircuit)}
          className={`flex items-center gap-2 text-xs font-semibold transition-colors ${ saveAsCircuit ? "text-accent-600" : "text-zinc-500" }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saveAsCircuit ? "fill-current" : ""}`} />
          {saveAsCircuit ? "Guardar como circuito reutilizable" : "¿Guardar este circuito para reutilizarlo?"}
        </button>
        {saveAsCircuit && (
          <input
            type="text"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            placeholder="Ej: Mi rutina de mañanas"
            className="w-full rounded-xl bg-white border border-zinc-200 px-3 py-2 text-sm"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || selectedObstacles.length === 0}
        className="w-full bg-accent-600 text-white rounded-2xl py-4 font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        {saving ? "Guardando..." : "Guardar sesión"}
      </button>
    </div>
  );
}
