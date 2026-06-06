import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { DogProvider, DogSwitcher } from "@/components/DogSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { BackgroundPaws } from "@/components/BackgroundPaws";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import { getCachedDog, getCachedMetabolicProfile, getCachedMealSlots, getCachedRecipes, getCachedWalks, getCachedWeightLatest, getCachedMealSchedule } from "@/lib/data-cache";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Trial check
  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  // Precargar datos del perro actual en cache compartido
  // Las páginas hijas reutilizan estos datos sin llamar a Supabase de nuevo
  const cookieStore = await cookies();
  const savedDogId = cookieStore.get("blis_current_dog")?.value ?? null;
  if (savedDogId) {
    getCachedDog(savedDogId, user.id);
    getCachedMetabolicProfile(savedDogId);
    getCachedMealSlots(savedDogId);
    getCachedRecipes();
  }

  return (
    <div className="min-h-screen md:pl-60 bg-app-gradient">
      <DogProvider>
        <BackgroundPaws />
        <ReferralTracker />
        <AppNav />
        <main className="pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3 h-9 relative z-20">
            <DogSwitcher />
            <div className="flex items-center gap-1.5">
              <SearchOverlay />
              <button className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-all hover:scale-105 active:scale-95">
                <Bell className="w-4 h-4" />
              </button>
              <UserPill />
            </div>
          </div>
          {trial.isWarning && (
            <TrialWarningToast daysLeft={trial.daysLeft} />
          )}
          {children}
        </main>
      </DogProvider>
    </div>
  );
}
