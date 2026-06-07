"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMetabolicProfile, DogMealSlot, NutritionRecipe, ToxicFood, MealSchedule, Walk } from "@/types/database";
import { NutritionHub } from "./nutricion/NutritionHub";
import { AddDogForm } from "./AddDogForm";
import QuickToolsCarousel from "@/components/QuickToolsCarousel";
import { DashboardWidgets } from "./DashboardWidgets";

export type TabKey = "inicio" | "nutricion" | "academia" | "tracker" | "perdido" | "perfil";

/* ════════════════════════════════════════════ */
/* Tab: Nutrición                               */
/* ════════════════════════════════════════════ */
function NutricionTab({ dog, userId }: { dog: Dog | null; userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dog) return;
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
      setData({
        recipes: (r1.data ?? []) as any[],
        toxicFoods: (r2.data ?? []) as any[],
        metabolicProfile: (r3.data ?? null) as any,
        mealSlots: (r4.data ?? []) as any[],
        mealSchedule: (r5.data ?? []) as any[],
        walks: (r6.data ?? []) as any[],
      });
      setLoading(false);
    })();
  }, [dog?.id]);

  if (loading) return <div className="space-y-3 animate-pulse pt-2"><div className="h-8 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" /><div className="h-40 bg-zinc-100 dark:bg-zinc-800/60 rounded-[1.5rem]" /></div>;
  if (!dog || !data) return <p className="text-zinc-500 text-center py-8">Registrá un perro primero.</p>;

  return (
    <NutritionHub
      initialRecipes={data.recipes}
      toxicFoods={data.toxicFoods}
      dog={dog}
      metabolicProfile={data.metabolicProfile}
      detoxDays={[]}
      detoxProgress={[]}
      userId={userId}
      mealSlots={data.mealSlots}
      mealSchedule={data.mealSchedule}
      walks={data.walks}
      greenCount={data.walks.filter((w: any) => w.traffic_light === "green").length}
      favoriteRecipeIds={new Set()}
      hiddenRecipeIds={new Map()}
    />
  );
}

/* ════════════════════════════════════════════ */
/* Placeholder tabs                             */
/* ════════════════════════════════════════════ */
function PlaceholderTab({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="text-center py-16 space-y-4">
      <p className="text-5xl">{icon}</p>
      <h2 className="text-base font-bold text-zinc-700 dark:text-zinc-300">{title}</h2>
      <p className="text-sm text-zinc-400">{desc}</p>
    </div>
  );
}

/* ════════════════════════════════════════════ */
/* Dashboard Content (from SSR data)            */
/* ════════════════════════════════════════════ */
function DashboardContent({ data, dog, userId }: { data: any; dog: Dog | null; userId: string }) {
  if (!dog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center"><span className="text-4xl">🐾</span></div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">¡Bienvenido a Blis Club!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm text-sm leading-relaxed">Registrá tu primer perro para empezar a usar la calculadora de nutrición, el tracker de paseos y la academia de entrenamiento.</p>
        </div>
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{dog.nombre}</h2>
              {dog.objetivo_principal && <span className="text-[10px] font-semibold bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full shrink-0">{dog.objetivo_principal}</span>}
            </div>
            <div className="mt-2.5 space-y-1.5">
              <p className="text-white/85 text-sm">🐾 {dog.raza}</p>
              <p className="text-white/85 text-sm">🎂 {dog.edad_meses} meses</p>
              <p className="text-white/85 text-sm">⚖️ {dog.peso_kg} kg</p>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/8 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/8 rounded-full" />
      </div>
      <QuickToolsCarousel isLost={(dog as any).is_lost === true} />
      <DashboardWidgets
        academyPct={data.academyPct} academyCompleted={data.academyCompleted} academyTotal={data.academyTotal}
        greenPct={data.greenPct} yellowPct={data.yellowPct} redPct={data.redPct}
        gramsEaten={data.gramsEaten} gramsTarget={data.gramsTarget}
        vaccines={data.vaccines} activeMeds={data.activeMeds || []} medLogs={data.medLogs || []}
      />
    </div>
  );
}

/* ════════════════════════════════════════════ */
/* AppShell                                     */
/* ════════════════════════════════════════════ */
interface AppShellProps {
  userId: string;
  dog: Dog | null;
  initialTab: TabKey;
  dashboardData?: any;
}

export default function AppShell({ userId, dog, initialTab, dashboardData }: AppShellProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const handlePopstate = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as TabKey | null;
      if (tab && ["inicio", "nutricion", "academia", "tracker", "perdido", "perfil"].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab("inicio");
      }
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  const goToTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const url = tab === "inicio" ? "/guau/app" : `/guau/app?tab=${tab}`;
    window.history.replaceState(null, "", url);
  }, []);

  // Exponer setTab al AppNav via evento custom
  useEffect(() => {
    (window as any).__blisSetTab = goToTab;
    return () => { delete (window as any).__blisSetTab; };
  }, [goToTab]);

  return (
    <>
      {activeTab === "inicio" && <DashboardContent data={dashboardData} dog={dog} userId={userId} />}
      {activeTab === "nutricion" && <NutricionTab dog={dog} userId={userId} />}
      {activeTab === "academia" && <PlaceholderTab icon="🎓" title="Academia" desc="Usá el menú lateral para acceder a tus lecciones." />}
      {activeTab === "tracker" && <PlaceholderTab icon="🏃" title="Tracker" desc="Usá el menú Track para paseos y agilidad." />}
      {activeTab === "perdido" && <PlaceholderTab icon="🔍" title="Perdido" desc="Usá el menú Perdido para generar alertas." />}
      {activeTab === "perfil" && <PlaceholderTab icon="👤" title="Perfil" desc="Usá el menú Perfil para ver tus datos." />}
    </>
  );
}
