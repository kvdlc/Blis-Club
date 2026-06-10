"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle, Flame, Target } from "lucide-react";
import type { AgilitySession } from "@/types/database";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  completed: boolean;
  completed_at: string | null;
}

interface Props {
  sessions: AgilitySession[];
}

export function AgilityChallenges({ sessions }: Props) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [sessions]); // Reload when sessions change to reflect auto-completions

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agility/challenges");
      const json = await res.json();
      if (json.challenges) setChallenges(json.challenges);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="card-soft rounded-[1.5rem] p-5 animate-pulse">
        <div className="h-4 bg-zinc-200 rounded w-1/3 mb-3" />
        <div className="h-8 bg-zinc-200 rounded w-full" />
      </div>
    );
  }

  if (challenges.length === 0) return null;

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-warning-100 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-warning-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-800">Desafíos de la semana</h3>
            <p className="text-[10px] text-zinc-400">{completedCount}/{challenges.length} completados</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-warning-50 flex items-center justify-center">
          <Flame className="w-5 h-5 text-warning-500" />
        </div>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${ challenge.completed ? "bg-secondary-50 border border-secondary-200" : "bg-white border border-zinc-100" }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${ challenge.completed ? "bg-secondary-100 text-secondary-600" : "bg-zinc-100 text-zinc-400" }`}
            >
              {challenge.completed ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold ${ challenge.completed ? "text-secondary-700" : "text-zinc-700" }`}
              >
                {challenge.title}
              </p>
              {challenge.description && (
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{challenge.description}</p>
              )}
              {challenge.completed && challenge.completed_at && (
                <p className="text-[9px] text-secondary-500 mt-1">
                  Completado el {new Date(challenge.completed_at).toLocaleDateString("es-ES")}
                </p>
              )}
            </div>
            {challenge.completed && (
              <span className="text-[10px] font-bold bg-secondary-100 text-secondary-700 px-2 py-0.5 rounded-full shrink-0">
                Hecho
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
