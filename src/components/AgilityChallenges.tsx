"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle, Flame, Target } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  completed: boolean;
  completed_at: string | null;
}

export function AgilityChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

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

  const completeChallenge = async (challengeId: string) => {
    try {
      const res = await fetch("/api/agility/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      const json = await res.json();
      if (json.success) {
        setChallenges((prev) =>
          prev.map((c) =>
            c.id === challengeId ? { ...c, completed: true, completed_at: new Date().toISOString() } : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="card-soft rounded-[1.5rem] p-5 animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-3" />
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
      </div>
    );
  }

  if (challenges.length === 0) return null;

  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-warning-100 dark:bg-warning-900 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-warning-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Desafíos de la semana</h3>
            <p className="text-[10px] text-zinc-400">{completedCount}/{challenges.length} completados</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-warning-50 dark:bg-warning-950 flex items-center justify-center">
          <Flame className="w-5 h-5 text-warning-500" />
        </div>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              challenge.completed
                ? "bg-secondary-50 dark:bg-secondary-950/30 border border-secondary-200 dark:border-secondary-800"
                : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                challenge.completed
                  ? "bg-secondary-100 dark:bg-secondary-900 text-secondary-600"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
              }`}
            >
              {challenge.completed ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold ${
                  challenge.completed ? "text-secondary-700 dark:text-secondary-300 line-through" : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {challenge.title}
              </p>
              {challenge.description && (
                <p className="text-[10px] text-zinc-400 truncate">{challenge.description}</p>
              )}
            </div>
            {!challenge.completed && (
              <button
                onClick={() => completeChallenge(challenge.id)}
                className="text-[10px] font-bold bg-accent-600 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
              >
                Completar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
