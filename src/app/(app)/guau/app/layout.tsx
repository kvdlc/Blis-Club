import type { Viewport } from "next";
import { redirect } from "next/navigation";
import AppNav from "@/components/AppNav";
import { DogProvider, DogSwitcher } from "@/components/DogSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { BackgroundPaws } from "@/components/BackgroundPaws";
import { AdminNotificationsBell } from "@/components/admin/AdminNotificationsBell";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { getAdminFeed } from "@/lib/admin-notifications";
import { cookies } from "next/headers";
import { getCachedDog, getCachedMetabolicProfile, getCachedMealSlots, getCachedRecipes, getCachedWalks, getCachedWeightLatest, getCachedMealSchedule } from "@/lib/data-cache";

export const viewport: Viewport = {
  themeColor: "#5956e9",
  colorScheme: "only light",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Trial check
  const trial = await checkTrialServer(supabase, user.id, "guau");
  if (trial.isExpired) redirect("/guau/app/suscripcion");

  const adminFeed = await getAdminFeed(user.id);

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
              <AdminNotificationsBell feed={adminFeed} dark={false} />
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
