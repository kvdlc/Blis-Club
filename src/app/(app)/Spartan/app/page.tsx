import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import DashboardContent from "./DashboardContent";

export default async function SpartanDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "Spartan");
  if (trial.isExpired) redirect("/Spartan/app/suscripcion");

  const cookieStore = await cookies();
  const referralCookie = cookieStore.get("blis_referral_code")?.value;
  if (referralCookie) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/referrals/claim`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch {}
  }

  return <DashboardContent />;
}
