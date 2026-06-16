import { redirect } from "next/navigation";
import AutoNav from "@/components/AutoNav";
import { CarProvider, CarSwitcher } from "@/components/CarSwitcher";
import { UserPill } from "@/components/UserPill";
import { SearchOverlay } from "@/components/SearchOverlay";
import TrialWarningToast from "@/components/TrialWarningToast";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";

export default async function AutoAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "auto");
  if (trial.isExpired) redirect("/auto/app/suscripcion");

  return (
    <div className="min-h-screen md:pl-60 bg-auto-gradient">
      <CarProvider>
        <AutoNav />
        <main className="pb-28 md:pb-8 px-4 pt-3 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3 h-9 relative z-20">
            <CarSwitcher />
            <div className="flex items-center gap-1.5">
              <SearchOverlay />
              <button className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-100 flex items-center justify-center text-zinc-600 transition-all hover:scale-105 active:scale-95">
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
