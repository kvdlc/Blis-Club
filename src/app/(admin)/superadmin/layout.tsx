import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "superadmin") {
    redirect("/guau/app");
  }

  return (
    <div className="min-h-screen md:pl-60 bg-zinc-100 dark:bg-zinc-950">
      <AdminNav userRole={role} userName={profile?.display_name || user.email || ""} />
      <main className="pb-28 md:pb-8 px-4 md:px-8 pt-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
