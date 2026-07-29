"use client";

import { motion } from "framer-motion";
import { X, Dumbbell, Clock, Scale, Users, Camera, Check, Circle } from "lucide-react";

interface DayData {
  date: Date;
  dayName: string;
  dayNum: number;
  sessions: Array<{
    id: string;
    routine_name: string;
    duration_minutes: number;
    body_weight_kg: number | null;
    gym_occupancy: string | null;
    series_data: any;
    started_at: string;
    ended_at: string | null;
  }>;
  totalVolume: number;
}

interface Props {
  day: DayData;
  onClose: () => void;
}

export default function DayDetailModal({ day, onClose }: Props) {
  const volumeTons = day.totalVolume / 1000;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-zinc-900/95 backdrop-blur-xl border border-white/[0.06] rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
          <div>
            <p className="text-sm font-extrabold text-white">
              {day.date.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {day.sessions.map((session, si) => (
            <div key={si} className="space-y-3">
              {/* Routine info */}
              <div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-spartan-400" />
                  <h3 className="text-base font-extrabold text-white">{session.routine_name}</h3>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(session.started_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      {session.ended_at ? ` - ${new Date(session.ended_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </span>
                  </div>
                  {session.duration_minutes > 0 && (
                    <span className="text-xs font-bold text-zinc-300">{session.duration_minutes} min</span>
                  )}
                  {session.body_weight_kg && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Scale className="w-3 h-3" />
                      <span>{session.body_weight_kg} kg</span>
                    </div>
                  )}
                  {session.gym_occupancy && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Users className="w-3 h-3" />
                      <span>{session.gym_occupancy === "vacio" ? "Vacío" : session.gym_occupancy === "lleno" ? "Lleno" : "Normal"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exercises */}
              <div className="space-y-2">
                {(() => {
                  const sd = session.series_data;
                  if (!sd) return null;
                  return Object.entries(sd).map(([exIdx, exData]: [string, any]) => {
                    if (!exData || !Array.isArray(exData.series)) return null;
                    const maxW = exData.series.reduce((mx: number, s: any) => s.completed && s.weight && s.weight > (mx || 0) ? s.weight : mx, 0 as number | null);
                    const completedSeries = exData.series.filter((s: any) => s.completed);
                    const totalVol = completedSeries.reduce((sum: number, s: any) => sum + (s.weight || 0) * (s.reps || 1), 0);

                    return (
                      <div key={exIdx} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-zinc-200">Ejercicio {parseInt(exIdx) + 1}</span>
                          {maxW && <span className="text-[10px] font-bold text-amber-400">{maxW}kg max</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {exData.series.map((s: any, si: number) => (
                            <span key={si} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${s.completed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.02] text-zinc-600 border-white/[0.04]"}`}>
                              {s.completed ? <Check className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
                              {s.weight ? `${s.weight}kg` : "-"} × {s.reps || "-"}
                            </span>
                          ))}
                        </div>
                        {totalVol > 0 && (
                          <p className="text-[9px] text-zinc-600 mt-1.5">{(totalVol / 1000).toFixed(2)}t</p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ))}

          {/* Summary footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Dumbbell className="w-3 h-3" />
              <span>{volumeTons.toFixed(1)} toneladas</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Camera className="w-3 h-3" />
              <span className="text-zinc-600">Sin foto</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
