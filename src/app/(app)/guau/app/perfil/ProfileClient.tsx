"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Dog, WeeklyChallenge, UserChallenge, DogMetabolicProfile, Badge, UserBadge, Subscription, Plan, Profile } from "@/types/database";
import { User, PawPrint, Award, Check, LogOut, MessageCircle, ExternalLink, Edit3, Plus, Building2, Crown, Shield, ChevronRight, Sparkles, Copy, Wallet, Clock, Gift, BookOpen } from "lucide-react";
import { useState } from "react";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";

interface Props {
  profile: Profile | null;
  dogs: Dog[];
  metabolicProfiles: DogMetabolicProfile[];
  userBadges: (UserBadge & { badges: Badge })[];
  challenges: WeeklyChallenge[];
  userChallenges: UserChallenge[];
  subscription: (Subscription & { plans: Plan }) | null;
  userId: string;
  daysLeft?: number;
  referralCode?: string;
  rewards?: {
    total_cash_usd: number;
    total_months_free: number;
    available_cash_usd: number;
    default_reward_mode: string;
  } | null;
}

export function ProfileClient({ profile, dogs, metabolicProfiles, userBadges, challenges, userChallenges, subscription, userId, daysLeft = 0, referralCode = "", rewards = null }: Props) {
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : profile?.display_name ?? "Tutor";

  return (
    <>
      <OnboardingTutorial key={showTutorial ? "tutorial-open" : "tutorial-closed"} userId={userId} hasSeenTutorial={profile?.has_seen_tutorial ?? false} forceShow={showTutorial} onComplete={() => setShowTutorial(false)} />
      <div className="space-y-5">
      {/* ═══ TOP BAR: Suscripción + Blis Corp ═══ */}
      <div className="flex items-center justify-between card-soft rounded-[1.25rem] px-4 py-3">
        <a href="https://www.blis-corp.com" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-primary-500 transition-colors">
          <Building2 className="w-3 h-3" />
          Con el respaldo de <span className="font-bold text-zinc-500">Blis Corp</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* ═══ SUBSCRIPTION ═══ */}
      <div className="card-soft rounded-[1.25rem] p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
            <Crown className="w-5 h-5 text-accent-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Plan Pro
            </p>
            <p className="text-[10px] font-semibold text-secondary-600">
              Activo
            </p>
          </div>
          <Link href="/guau/app/suscripcion" className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
            Ver planes <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Referidos */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-accent-500" />
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Invita y gana</h4>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Comparte tu enlace magico y gana 1 mes gratis o efectivo por cada amigo que se suscriba.
          </p>
          {referralCode && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://blis.club/guau/webg?ref=${referralCode}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate pr-2">
                blis.club/guau/webg?ref={referralCode}
              </span>
              <span className="text-xs font-semibold text-primary-600 flex items-center gap-1 shrink-0">
                {copied ? <><Check className="w-3 h-3" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
              </span>
            </button>
          )}
          <p className="text-[10px] text-zinc-400">
            Cuando alguien entre por tu enlace y se registre, se vincula automaticamente a ti.
          </p>
        </div>

        {/* Billetera */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary-500" />
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tus recompensas</h4>
            </div>
            <Link href="/guau/app/perfil/billetera" className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline">
              Ver billetera →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-primary-50 dark:bg-primary-950/30 p-2.5 text-center">
              <p className="text-lg font-extrabold text-primary-600">{rewards?.total_months_free ?? 0}</p>
              <p className="text-[10px] text-zinc-500">Meses gratis ganados</p>
            </div>
            <div className="rounded-xl bg-secondary-50 dark:bg-secondary-950/30 p-2.5 text-center">
              <p className="text-lg font-extrabold text-secondary-600">${((rewards?.available_cash_usd ?? 0) / 100).toFixed(2)}</p>
              <p className="text-[10px] text-zinc-500">Efectivo disponible</p>
            </div>
          </div>
          {(rewards?.available_cash_usd ?? 0) >= 1000 && (
            <Link href="/guau/app/perfil/billetera" className="block w-full text-center rounded-xl bg-secondary-600 text-white py-2 text-xs font-bold active:scale-[0.98] transition-transform">
              Solicitar retiro
            </Link>
          )}
        </div>
      </div>

      {/* ═══ HUMAN PROFILE ═══ */}
      <div className="card-soft rounded-[1.5rem] p-5 space-y-3">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center border-2 border-primary-100 dark:border-primary-900 overflow-hidden shrink-0">
            <img src={profile?.avatar_url || "/icons/user-default.png"} alt="" className="w-full h-full object-cover object-center" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">{displayName}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-zinc-400">ID: {userId.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {profile?.country && <span className="text-[10px] text-zinc-400">{profile.country}</span>}
              {profile?.whatsapp && <span className="text-[10px] text-zinc-400">{profile.whatsapp.split(" ")[1] || profile.whatsapp}</span>}
            </div>
          </div>
        </div>
        <Link href="/guau/app/perfil/editar"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 py-2.5 text-sm font-bold active:scale-[0.98] transition-transform">
          <Edit3 className="w-4 h-4" /> Editar Perfil
        </Link>
      </div>

      {/* ═══ MIS PERROS ═══ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Mis Perros</h3>
          <Link href="/guau/app/perfil/perro/nuevo" className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400">
            <Plus className="w-4 h-4" /> Agregar
          </Link>
        </div>

        {dogs.length === 0 && (
          <p className="text-center text-zinc-400 py-6 text-sm">Aún no tienes perros registrados</p>
        )}

        {dogs.map((dog) => {
          const mp = metabolicProfiles.find((m) => m.dog_id === dog.id);
          return (
            <div key={dog.id} className="card-soft rounded-[1.5rem] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <img src={dog.foto_url || "/icons/dog-default.png"} alt={dog.nombre} className="w-full h-full object-contain object-center" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{dog.nombre}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{dog.raza} · {dog.edad_meses}m · {dog.peso_kg}kg</p>
                  {dog.objetivo_principal && <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{dog.objetivo_principal}</p>}
                  {mp && (
                    <p className="text-[10px] text-zinc-400">
                      {mp.activity_level === "sedentario" ? "Sedentario" : mp.activity_level === "moderado" ? "Moderado" : mp.activity_level === "activo" ? "Activo" : "Atlético"}
                      {mp.medical_conditions.length > 0 && ` · ${mp.medical_conditions.slice(0, 2).join(", ")}`}
                    </p>
                  )}
                </div>
              </div>
              <Link href={`/guau/app/perfil/perro/${dog.id}/editar`}
                className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 py-2 text-xs font-bold active:scale-[0.98] transition-transform">
                <Edit3 className="w-3.5 h-3.5" /> Editar {dog.nombre}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ═══ BADGES ═══ */}
      {userBadges.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Insignias</h3>
          <div className="flex flex-wrap gap-3">
            {userBadges.map((ub) => (
              <div key={ub.id} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent-500" />
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center max-w-[60px] leading-tight">{(ub.badges as Badge)?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ WHATSAPP ═══ */}
      <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-between card-soft rounded-[1.25rem] p-4 hover:bg-white/90 dark:hover:bg-zinc-800/90 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-950/40 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-secondary-600" />
          </div>
          <span className="text-sm font-semibold">Comunidad WhatsApp</span>
        </div>
        <ExternalLink className="w-4 h-4 text-zinc-400" />
      </a>

      {/* ═══ TUTORIAL ═══ */}
      <button
        onClick={() => setShowTutorial(true)}
        className="w-full flex items-center justify-between card-soft rounded-[1.25rem] p-4 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ver tutorial de bienvenida</p>
            <p className="text-[10px] text-zinc-500">Conoce todo lo que puedes hacer en Blis Club</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
      </button>

      {/* ═══ LOGOUT ═══ */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 card-soft rounded-[1.25rem] p-4 hover:bg-danger-50 dark:hover:bg-danger-950/20 transition-colors text-sm font-medium text-danger-600">
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>
      </div>
    </>
  );
}
