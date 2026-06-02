/**
 * Helpers de autorización para el admin dashboard
 */

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserRole(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role || null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "superadmin";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === "admin" || role === "superadmin";
}

export async function isAppAdmin(applicationId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: role } = await supabase
    .from("user_app_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (role) return true;

  const roleData = await getCurrentUserRole();
  return roleData === "superadmin";
}

export async function requireAdmin(): Promise<{ allowed: boolean; redirect?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, redirect: "/" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { allowed: false, redirect: "/guau/app" };
  }

  return { allowed: true };
}

export async function requireSuperAdmin(): Promise<{ allowed: boolean; redirect?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, redirect: "/" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "superadmin") {
    return { allowed: false, redirect: "/superadmin" };
  }

  return { allowed: true };
}
