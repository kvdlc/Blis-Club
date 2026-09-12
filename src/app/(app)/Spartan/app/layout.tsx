import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import SpartanNav from "@/components/SpartanNav";
import TrialWarningToast from "@/components/TrialWarningToast";
import ReferralTracker from "@/components/ReferralTracker";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { getAdminFeed } from "@/lib/admin-notifications";
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
  const pathname = (await headers()).get("x-pathname") || "";
  if (trial.isExpired && !pathname.includes("/suscripcion")) redirect("/Spartan/app/suscripcion");

  const adminFeed = await getAdminFeed(user.id);

  return (
    <div className="min-h-screen md:pl-60 bg-zinc-950 text-zinc-200">
      <ReferralTracker />
      <SpartanNav />
      <main className="pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
        <SpartanAppHeader feed={adminFeed} />
        {trial.isWarning && (
          <TrialWarningToast daysLeft={trial.daysLeft} appSlug="Spartan" />
        )}
        {children}
      </main>
    </div>
  );
}
