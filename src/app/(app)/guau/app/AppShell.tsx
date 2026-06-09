"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMetabolicProfile, DogMealSlot, NutritionRecipe, ToxicFood, MealSchedule, Walk, DogVaccine, Stage, Module, Lesson, UserProgress, Profile, WeeklyChallenge, UserChallenge, Subscription, Plan, UserBadge, Badge } from "@/types/database";
import { NutritionHub } from "./nutricion/NutritionHub";
import { AddDogForm } from "./AddDogForm";
import QuickToolsCarousel from "@/components/QuickToolsCarousel";
import { DashboardWidgets } from "./DashboardWidgets";
import { ProfileClient } from "./perfil/ProfileClient";
import AcademiaClient from "./academia/AcademiaClient";
import { TrackerClient } from "./tracker/TrackerClient";
import { PerdidoClient } from "./perdido/PerdidoClient";

export type TabKey = "inicio" | "nutricion" | "academia" | "tracker" | "perdido" | "perfil";

/* ═══════════════════════════ Skeleton ═══════════════════════ */
function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse pt-2">
      <div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      <div className="h-40 bg-zinc-100 dark:bg-zinc-800/60 rounded-[1.5rem]" />
      <div className="h-20 bg-zinc-100 dark:bg-zinc-800/60 rounded-[1.25rem]" />
    </div>
  );
}

/* ═══════════════════════════ Nutrición ═══════════════════════ */
function NutricionTab({ dog, userId, preloaded }: { dog: Dog | null; userId: string; preloaded?: any }) {
  const [data, setData] = useState<any>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);

  useEffect(() => {
    if (!dog || data) return;
    (async () => {
      const supabase = createClient();
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        supabase.from("nutrition_recipes").select("*").order("category"),
        supabase.from("toxic_foods").select("*").order("name"),
        supabase.from("dog_metabolic_profiles").select("*").eq("dog_id", dog.id).maybeSingle(),
        supabase.from("dog_meal_slots").select("*").eq("dog_id", dog.id).order("slot_index", { ascending: true }),
        supabase.from("meal_schedule").select("*, recipe:nutrition_recipes(*)").eq("dog_id", dog.id).order("fecha", { ascending: true }),
        supabase.from("walks").select("*").eq("dog_id", dog.id).order("start_time", { ascending: false }).limit(30),
      ]);
      setData({ recipes: r1.data ?? [], toxicFoods: r2.data ?? [], metabolicProfile: r3.data ?? null, mealSlots: r4.data ?? [], mealSchedule: r5.data ?? [], walks: r6.data ?? [] });
      setLoading(false);
    })();
  }, [dog?.id, data]);

  if (loading) return <TabSkeleton />;
    if (!dog || !data) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return (
    <NutritionHub
      initialRecipes={data.recipes} toxicFoods={data.toxicFoods} dog={dog} metabolicProfile={data.metabolicProfile}
      detoxDays={[]} detoxProgress={[]} userId={userId} mealSlots={data.mealSlots} mealSchedule={data.mealSchedule}
      walks={data.walks} greenCount={data.walks.filter((w: any) => w.traffic_light === "green").length}
      favoriteRecipeIds={new Set()} hiddenRecipeIds={new Map()}
    />
  );
}

/* ═══════════════════════════ Perfil ═══════════════════════ */
function PerfilTab({ userId, preloaded }: { userId: string; preloaded?: any }) {
  const [data, setData] = useState<any>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);

  useEffect(() => {
    if (data) return;
    (async () => {
      const supabase = createClient();
      const [p, d, mp, b, c, uc, s] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("dogs").select("*").eq("owner_id", userId),
        supabase.from("dog_metabolic_profiles").select("*"),
        supabase.from("user_badges").select("*, badges(*)").eq("user_id", userId),
        supabase.from("weekly_challenges").select("*").order("fecha_inicio", { ascending: false }).limit(5),
        supabase.from("user_challenges").select("*").eq("user_id", userId),
        supabase.from("subscriptions").select("*, plans(*)").eq("user_id", userId).maybeSingle(),
      ]);
      setData({ profile: p.data, dogs: d.data ?? [], metabolicProfiles: mp.data ?? [], userBadges: b.data ?? [], challenges: c.data ?? [], userChallenges: uc.data ?? [], subscription: s.data ?? null });
      setLoading(false);
    })();
  }, [userId, data]);

  if (loading) return <TabSkeleton />;
  if (!data) return <p className="text-zinc-500 text-center py-8">Cargando perfil...</p>;

  return (
    <ProfileClient
      profile={data.profile} dogs={data.dogs} metabolicProfiles={data.metabolicProfiles}
      userBadges={data.userBadges} challenges={data.challenges} userChallenges={data.userChallenges}
      subscription={data.subscription} userId={userId}
    />
  );
}

/* ═══════════════════════════ Academia ═══════════════════════ */
function AcademiaTab({ userId, preloaded }: { userId: string; preloaded?: any }) {
  const [data, setData] = useState<any>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);

  useEffect(() => {
    if (data) return;
    (async () => {
      const supabase = createClient();
      const [s, m, l, p] = await Promise.all([
        supabase.from("stages").select("*").order("order"),
        supabase.from("modules").select("*").order("order"),
        supabase.from("lessons").select("*").order("order"),
        supabase.from("user_progress").select("*").eq("user_id", userId),
      ]);
      setData({ stages: s.data ?? [], modules: m.data ?? [], lessons: l.data ?? [], progress: p.data ?? [] });
      setLoading(false);
    })();
  }, [userId, data]);

  if (loading) return <TabSkeleton />;
  if (!data) return <p className="text-zinc-500 text-center py-8">Cargando academia...</p>;

  return <AcademiaClient stages={data.stages} modules={data.modules} lessons={data.lessons} progress={data.progress} streak={0} />;
}

/* ═══════════════════════════ Tracker ═══════════════════════ */
function TrackerTab({ dog, userId, preloaded }: { dog: Dog | null; userId: string; preloaded?: any }) {
  const [data, setData] = useState<any>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);

  const fetchData = useCallback(async () => {
    if (!dog) return;
    const supabase = createClient();
    const [w, ad, ag, v, st] = await Promise.all([
      supabase.from("walks").select("*").eq("dog_id", dog.id).order("start_time", { ascending: false }).limit(60),
      supabase.from("dogs").select("*").eq("owner_id", userId),
      supabase.from("agility_sessions").select("id, activity_type, duration_min, circuit_time_seconds, fecha").eq("dog_id", dog.id).order("fecha", { ascending: false }).limit(20),
      supabase.from("dog_vaccines").select("*").eq("dog_id", dog.id).order("created_at", { ascending: false }),
      supabase.from("user_streaks").select("*").eq("user_id", userId).eq("streak_type", "walk").maybeSingle(),
    ]);
    setData({ walks: w.data ?? [], allDogs: ad.data ?? [], agilitySessions: ag.data ?? [], vaccines: v.data ?? [], streakDays: (st.data as any)?.current_streak ?? 0 });
    setLoading(false);
  }, [dog?.id, userId]);

  useEffect(() => {
    if (!dog) return;
    fetchData();
  }, [dog?.id, userId, fetchData]);

  // Escuchar cuando se completa un paseo para refrescar datos
  useEffect(() => {
    const handler = () => {
      fetchData();
    };
    window.addEventListener("walk-saved" as any, handler);
    return () => window.removeEventListener("walk-saved" as any, handler);
  }, [fetchData]);

  if (loading) return <TabSkeleton />;
  if (!data) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;

  return <TrackerClient walks={data.walks} dog={dog} allDogs={data.allDogs} agilitySessions={data.agilitySessions} streakDays={data.streakDays} userId={userId} vaccines={data.vaccines} />;
}

/* ═══════════════════════════ Perdido ═══════════════════════ */
function PerdidoTab({ dog, preloaded }: { dog: Dog | null; preloaded?: any }) {
  if (!dog) return <p className="text-zinc-500 text-center py-8">Registra un perro primero.</p>;
  return <PerdidoClient dog={dog} latestWeightPhoto={null} />;
}

/* ═══════════════════════════ Dashboard ═══════════════════════ */
function DashboardContent({ data, dog, userId }: { data: any; dog: Dog | null; userId: string }) {
  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center"><span className="text-4xl">🐾</span></div>
        <div><h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">¡Bienvenido a Blis Club!</h2><p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm text-sm leading-relaxed">Registra tu primer perro para empezar.</p></div>
        <AddDogForm userId={userId} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white shadow-lg shadow-primary-600/20">
        <div className="relative z-10 flex gap-4">
          <div className="w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border-2 border-white/20 overflow-hidden shrink-0 self-stretch">
            <img src={dog.foto_url || data.breedImgRaw || "/icons/dog-default.png"} alt={dog.nombre} className="w-full h-full object-cover object-center" />
          </div>
          <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap"><h2 className="text-xl font-bold">{dog.nombre}</h2>{dog.objetivo_principal && <span className="text-[10px] font-semibold bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full shrink-0">{dog.objetivo_principal}</span>}</div>
            <div className="mt-2.5 space-y-1.5"><p className="text-white/85 text-sm">🐾 {dog.raza}</p><p className="text-white/85 text-sm">🎂 {dog.edad_meses} meses</p><p className="text-white/85 text-sm">⚖️ {dog.peso_kg} kg</p></div>
          </div>
        </div>
        <a
          href={`/guau/perro/${dog.id}`}
          target="_blank"
          rel="noopener"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
          title="Perfil público del perro"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="4" width="20" height="16" rx="3" /><circle cx="12" cy="12" r="3"/><path d="M2 10h3"/><path d="M19 10h3"/><path d="M2 14h3"/><path d="M19 14h3"/></svg>
        </a>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/8 rounded-full" /><div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/8 rounded-full" />
      </div>
      <QuickToolsCarousel isLost={(dog as any).is_lost === true} />
      <DashboardWidgets academyPct={data.academyPct} academyCompleted={data.academyCompleted} academyTotal={data.academyTotal} greenPct={data.greenPct} yellowPct={data.yellowPct} redPct={data.redPct} gramsEaten={data.gramsEaten} gramsTarget={data.gramsTarget} vaccines={data.vaccines} activeMeds={data.activeMeds || []} medLogs={data.medLogs || []} />
    </div>
  );
}

/* ═══════════════════════════ AppShell ═══════════════════════ */
interface AppShellProps { userId: string; dog: Dog | null; initialTab: TabKey; dashboardData?: any; }

const validTabs: TabKey[] = ["inicio", "nutricion", "academia", "tracker", "perdido", "perfil"];

export default function AppShell({ userId, dog, initialTab, dashboardData }: AppShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Una sola fuente de verdad: la URL
  const urlTab = (searchParams.get("tab") as TabKey) || "inicio";
  const activeTab: TabKey = validTabs.includes(urlTab) ? urlTab : "inicio";

  const [tabRefresh, setTabRefresh] = useState<Record<string, number>>({});

  // goToTab: usar router.replace para que Next.js sincronice searchParams automáticamente
  const goToTab = useCallback((tab: TabKey) => {
    setTabRefresh((prev) => ({ ...prev, [tab]: (prev[tab] || 0) + 1 }));
    const url = tab === "inicio" ? "/guau/app" : `/guau/app?tab=${tab}`;
    router.replace(url, { scroll: false });
  }, [router]);

  // Exponer globalmente para QuickTools y DashboardWidgets
  useEffect(() => {
    (window as any).__blisSetTab = goToTab;
    return () => { delete (window as any).__blisSetTab; };
  }, [goToTab]);

  // Renderizar SIEMPRE todos los tabs (los inactivos hidden) para que sus data fetches se ejecuten
  return (
    <>
      <div style={{ display: activeTab === "inicio" ? "block" : "none" }}><DashboardContent data={dashboardData} dog={dog} userId={userId} /></div>
      <div style={{ display: activeTab === "nutricion" ? "block" : "none" }}><NutricionTab dog={dog} userId={userId} /></div>
      <div style={{ display: activeTab === "perfil" ? "block" : "none" }}><PerfilTab userId={userId} /></div>
      <div style={{ display: activeTab === "academia" ? "block" : "none" }}><AcademiaTab userId={userId} /></div>
      <div style={{ display: activeTab === "tracker" ? "block" : "none" }}><TrackerTab key={`tracker-${tabRefresh["tracker"] || 0}`} dog={dog} userId={userId} /></div>
      <div style={{ display: activeTab === "perdido" ? "block" : "none" }}><PerdidoTab dog={dog} /></div>
    </>
  );
}
