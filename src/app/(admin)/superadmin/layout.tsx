import type { Viewport } from "next";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { createClient } from "@/lib/supabase/server";

export const viewport: Viewport = {
  themeColor: "#18181b",
  colorScheme: "dark",
};

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (profileError || (!role && role !== "admin" && role !== "superadmin" && role !== "empleado")) {
    redirect("/guau/app");
  }

  if (role !== "admin" && role !== "superadmin" && role !== "empleado") {
    redirect("/guau/app");
  }

  // Cargar apps del usuario y admin_modules
  let userApps: string[] = [];
  let adminModules: Record<string, any> | null = null;

  if (role === "empleado") {
    const { data: apps } = await supabase
      .from("user_apps")
      .select("app_slug")
      .eq("user_id", user.id);

    userApps = (apps ?? []).map((a: any) => a.app_slug);

    // Si tiene apps, cargar módulos de admin de la primera
    if (userApps.length > 0) {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("admin_modules")
        .eq("application_id", (
          await supabase.from("applications").select("id").eq("slug", userApps[0]).single()
        ).data?.id)
        .maybeSingle();

      adminModules = (settings as any)?.admin_modules ?? null;
    }
  }

  return (
    <div className="min-h-screen md:pl-60 bg-zinc-100">
      <AdminNav
        userRole={role}
        userName={profile?.display_name || user.email || ""}
        userApps={userApps}
        adminModules={adminModules}
      />
      <main className="pb-28 md:pb-8 px-4 md:px-8 pt-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
