import type { Viewport } from "next";
import { redirect } from "next/navigation";
import AutoNav from "@/components/AutoNav";
import { CarProvider, CarSwitcher } from "@/components/CarSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";

export const viewport: Viewport = {
  themeColor: "#10b981",
  colorScheme: "dark",
};

export default async function AutoAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "auto");
  if (trial.isExpired) redirect("/auto/app/suscripcion");

  return (
    <div className="min-h-screen md:pl-60 bg-zinc-50 text-zinc-900">
      <CarProvider>
        <ReferralTracker />
        <AutoNav />
        <main className="pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4 h-10 relative z-20">
            <CarSwitcher />
            <div className="flex items-center gap-2">
              <SearchOverlay />
              <button className="w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 transition-all hover:scale-105 active:scale-95">
                <Bell className="w-4 h-4" />
              </button>
              <UserPill appSlug="auto" />
            </div>
          </div>
          {trial.isWarning && (
            <TrialWarningToast daysLeft={trial.daysLeft} appSlug="auto" />
          )}
          {children}
        </main>
      </CarProvider>
    </div>
  );
}
