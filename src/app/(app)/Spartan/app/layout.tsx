import type { Viewport } from "next";
import { redirect } from "next/navigation";
import SpartanNav from "@/components/SpartanNav";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { SpartanAppHeader } from "./SpartanAppHeader";

export const viewport: Viewport = {
  themeColor: "#be0b3c",
  colorScheme: "dark",
};

export default async function SpartanAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "Spartan");
  if (trial.isExpired) redirect("/Spartan/app/suscripcion");

  return (
    <div className="min-h-screen md:pl-60 bg-zinc-950 text-zinc-200">
      <ReferralTracker />
      <SpartanNav />
      <main className="relative z-10 pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
        <SpartanAppHeader />
        {trial.isWarning && (
          <TrialWarningToast daysLeft={trial.daysLeft} appSlug="Spartan" />
        )}
        {children}
      </main>
    </div>
  );
}
