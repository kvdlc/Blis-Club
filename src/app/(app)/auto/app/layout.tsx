import type { Viewport } from "next";
import { redirect } from "next/navigation";
import AutoNav from "@/components/AutoNav";
import { CarProvider } from "@/components/CarSwitcher";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MarketplaceCartProvider } from "@/components/MarketplaceCart";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { AutoAppHeader } from "./AutoAppHeader";

export const viewport: Viewport = {
  themeColor: "#be0b3c",
  colorScheme: "dark",
};

export default async function AutoAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "auto");
  if (trial.isExpired) redirect("/auto/app/suscripcion");

  return (
    <div className="min-h-screen md:pl-20 bg-auto-gradient bg-[#0a0a0c] text-zinc-200">
      <CarProvider>
        <ReferralTracker />
        <ScrollToTop />
        <MarketplaceCartProvider userId={user.id}>
          <AutoNav />
          <main className="relative z-10 pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
            <AutoAppHeader />
            {trial.isWarning && (
              <TrialWarningToast daysLeft={trial.daysLeft} appSlug="auto" />
            )}
            {children}
          </main>
        </MarketplaceCartProvider>
      </CarProvider>
    </div>
  );
}
