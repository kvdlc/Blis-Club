import type { Viewport } from "next";
import { redirect } from "next/navigation";
import AutoNav from "@/components/AutoNav";
import { CarProvider } from "@/components/CarSwitcher";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { AutoAppHeader } from "./AutoAppHeader";

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
        <main className="relative z-10 pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
          <AutoAppHeader />
          {trial.isWarning && (
            <TrialWarningToast daysLeft={trial.daysLeft} appSlug="auto" />
          )}
          {children}
        </main>
      </CarProvider>
    </div>
  );
}
