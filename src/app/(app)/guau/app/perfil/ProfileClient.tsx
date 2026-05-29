"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import type { Dog, WeeklyChallenge, UserChallenge, DogMetabolicProfile, Badge, UserBadge, Subscription, Plan } from "@/types/database";
import { User, PawPrint, Award, Check, ChevronRight, LogOut, Moon, Sun, MessageCircle, ExternalLink } from "lucide-react";

interface Props {
  profile: { id: string; email: string; display_name: string | null; avatar_url: string | null } | null;
  dogs: Dog[];
  metabolicProfiles: DogMetabolicProfile[];
  userBadges: (UserBadge & { badges: Badge })[];
  challenges: WeeklyChallenge[];
  userChallenges: UserChallenge[];
  subscription: (Subscription & { plans: Plan }) | null;
  userId: string;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: "Sedentario", moderado: "Moderado", activo: "Activo", atletico: "Atlético",
};

const ALLERGIES_LIST = ["Pollo", "Res", "Cordero", "Cerdo", "Pescado", "Lácteos", "Gluten", "Huevo"];
const CONDITIONS_LIST = ["Renal", "Hepático", "Pancreatitis", "Senior", "Obesidad", "Diabetes", "Alergias piel", "Cardíaco"];

export function ProfileClient({ profile, dogs, metabolicProfiles, userBadges, challenges, userChallenges, subscription, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [editDogId, setEditDogId] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState("moderado");
  const [editAllergies, setEditAllergies] = useState<string[]>([]);
  const [editConditions, setEditConditions] = useState<string[]>([]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getUserChallenge = (challengeId: string) =>
    userChallenges.find((uc) => uc.challenge_id === challengeId);

  const handleCompleteChallenge = async (challengeId: string, completed: boolean) => {
    const existing = getUserChallenge(challengeId);
    if (existing) {
      await supabase.from("user_challenges").update({ completed }).eq("id", existing.id);
    } else {
      await supabase.from("user_challenges").insert({
        user_id: userId, challenge_id: challengeId, completed, completed_at: new Date().toISOString(),
      });
    }
    router.refresh();
  };

  const openMetabolicEditor = (dog: Dog) => {
    const mp = metabolicProfiles.find((m) => m.dog_id === dog.id);
    setEditDogId(dog.id);
    setEditActivity(mp?.activity_level ?? "moderado");
    setEditAllergies(mp?.allergies ?? []);
    setEditConditions(mp?.medical_conditions ?? []);
  };

  const saveMetabolicProfile = async (dogId: string) => {
    await supabase.from("dog_metabolic_profiles").upsert({
      dog_id: dogId, activity_level: editActivity, allergies: editAllergies, medical_conditions: editConditions,
    }, { onConflict: "dog_id" });
    setEditDogId(null);
    router.refresh();
  };

  const toggleArrayItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{profile?.display_name ?? "Tutor"}</h2>
            <p className="text-sm text-zinc-500">{profile?.email}</p>
          </div>
        </div>
        {subscription && (
          <div className="mt-4 rounded-xl bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                Plan {(subscription.plans as Plan)?.name ?? "Free"}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                subscription.status === "active" ? "bg-secondary-100 text-secondary-700" : "bg-warning-100 text-warning-700"
              }`}>
                {subscription.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dogs */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Mis Perros</h3>
        {dogs.map((dog) => {
          const mp = metabolicProfiles.find((m) => m.dog_id === dog.id);
          const isEditing = editDogId === dog.id;

          if (isEditing) {
            return (
              <div key={dog.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-primary-200 dark:border-primary-800 p-5 space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Nivel de actividad</label>
                  <select value={editActivity} onChange={(e) => setEditActivity(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm">
                    {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Alergias</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALLERGIES_LIST.map((a) => (
                      <button key={a} onClick={() => setEditAllergies(toggleArrayItem(editAllergies, a))}
                        className={`text-xs rounded-full px-3 py-1 ${
                          editAllergies.includes(a) ? "bg-warning-500 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                        }`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Condiciones médicas</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS_LIST.map((c) => (
                      <button key={c} onClick={() => setEditConditions(toggleArrayItem(editConditions, c))}
                        className={`text-xs rounded-full px-3 py-1 ${
                          editConditions.includes(c) ? "bg-accent-500 text-white" : "bg-zinc-100 dark:bg-zinc-800"
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveMetabolicProfile(dog.id)}
                    className="flex-1 bg-primary-600 text-white rounded-xl py-2 text-sm font-semibold">Guardar</button>
                  <button onClick={() => setEditDogId(null)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl py-2 text-sm">Cancelar</button>
                </div>
              </div>
            );
          }

          return (
            <div key={dog.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-accent-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{dog.nombre}</p>
                  <p className="text-xs text-zinc-500">{dog.raza} · {dog.edad_meses}m · {dog.peso_kg}kg</p>
                  {mp && (
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {ACTIVITY_LABELS[mp.activity_level] ?? mp.activity_level}
                      {mp.medical_conditions.length > 0 && ` · ${mp.medical_conditions.join(", ")}`}
                    </p>
                  )}
                </div>
                <button onClick={() => openMetabolicEditor(dog)}
                  className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      {userBadges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Insignias</h3>
          <div className="flex flex-wrap gap-3">
            {userBadges.map((ub) => (
              <div key={ub.id} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl bg-accent-100 dark:bg-accent-950 border-2 border-accent-300 dark:border-accent-700 flex items-center justify-center">
                  <Award className="w-7 h-7 text-accent-600" />
                </div>
                <span className="text-[10px] text-zinc-500 text-center leading-tight max-w-[60px]">
                  {(ub.badges as Badge)?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Retos Semanales</h3>
        {challenges.map((ch) => {
          const uc = getUserChallenge(ch.id);
          const completed = uc?.completed ?? false;
          return (
            <div key={ch.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleCompleteChallenge(ch.id, !completed)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    completed ? "bg-secondary-500 border-secondary-500" : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {completed && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{ch.title}</p>
                  {ch.description && <p className="text-xs text-zinc-500 mt-1">{ch.description}</p>}
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {new Date(ch.fecha_inicio + "T00:00:00").toLocaleDateString("es")} — {new Date(ch.fecha_fin + "T00:00:00").toLocaleDateString("es")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-secondary-600" />
            <span className="text-sm font-medium">Comunidad WhatsApp</span>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-400" />
        </a>

        <a
          href="https://wa.me/1234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-accent-600" />
            <span className="text-sm font-medium">Academia WhatsApp</span>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-400" />
        </a>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Configuración</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Sun className="w-5 h-5 text-warning-500" /> : <Moon className="w-5 h-5 text-primary-600" />}
              <span className="text-sm">Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-danger-600" />
              <span className="text-sm text-danger-600">Cerrar sesión</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
