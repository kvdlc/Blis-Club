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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Trial check using user_apps table
  const trial = await checkTrialServer(supabase, user.id, "guau");

  // If trial expired, redirect to subscription page
  if (trial.isExpired) {
    redirect("/guau/app/suscripcion");
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
