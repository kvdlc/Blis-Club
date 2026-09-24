import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import KidsNav from "@/components/KidsNav";
import { KidsMagicBackground } from "@/components/kids/KidsMagicBackground";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { KidsAppHeader } from "./KidsAppHeader";

export const viewport: Viewport = {
  themeColor: "#F97316",
  colorScheme: "only light",
};

export default async function KidsAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const hdrs = await headers();
  const currentPath = hdrs.get("x-pathname") || "";
  const isPaywallRoute =
    currentPath.startsWith("/kids/app/suscripcion") ||
    currentPath.startsWith("/kids/app/checkout");

  const trial = await checkTrialServer(supabase, user.id, "kids");
  if (trial.isExpired && !isPaywallRoute) redirect("/kids/app/suscripcion");

  return (
    <div className="min-h-screen md:pl-[var(--kids-nav-w,15rem)] transition-[padding] duration-200 overflow-x-hidden">
      <KidsMagicBackground />
      <ReferralTracker />
      <KidsNav />
      <main className="pb-32 md:pb-10 px-4 pt-4 max-w-3xl mx-auto">
        <KidsAppHeader />
        {trial.isWarning && <TrialWarningToast daysLeft={trial.daysLeft} appSlug="kids" />}
        {children}
      </main>
    </div>
  );
}
