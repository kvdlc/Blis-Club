import { createClient } from "@/lib/supabase/client";

export const TRIAL_DAYS = 60;
export const WARNING_DAYS = 5;

export interface TrialStatus {
  status: "trialing" | "active" | "expired";
  daysLeft: number;
  isWarning: boolean;
  isExpired: boolean;
}

/**
 * Crear trial de 60 días para un usuario en una app.
 * Se llama desde el registro.
 */
export async function createTrial(userId: string, appSlug: string) {
  const supabase = createClient();
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  const { data: existing } = await supabase
    .from("user_apps")
    .select("id")
    .eq("user_id", userId)
    .eq("app_slug", appSlug)
    .maybeSingle();

  if (existing) return existing;

  const { data } = await supabase
    .from("user_apps")
    .insert({
      user_id: userId,
      app_slug: appSlug,
      status: "trialing",
      trial_ends_at: trialEnd.toISOString(),
    })
    .select()
    .single();

  return data;
}

/**
 * Verificar estado del trial para un usuario en una app.
 * Retorna información de si está en trial, cuántos días quedan,
 * si está en período de advertencia (5 días antes), o si expiró.
 */
export async function checkTrial(userId: string, appSlug: string): Promise<TrialStatus> {
  const supabase = createClient();

  const { data } = await supabase
    .from("user_apps")
    .select("status, trial_ends_at, current_period_end")
    .eq("user_id", userId)
    .eq("app_slug", appSlug)
    .maybeSingle();

  if (!data) {
    // Si no hay registro, crear trial automáticamente
    await createTrial(userId, appSlug);
    return {
      status: "trialing",
      daysLeft: TRIAL_DAYS,
      isWarning: false,
      isExpired: false,
    };
  }

  const record = data as any;
  const now = Date.now();

  // Si tiene suscripción activa
  if (record.status === "active" && record.current_period_end) {
    const end = new Date(record.current_period_end).getTime();
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return {
      status: "active",
      daysLeft,
      isWarning: daysLeft <= WARNING_DAYS && daysLeft > 0,
      isExpired: daysLeft <= 0,
    };
  }

  // En trial
  if (record.trial_ends_at) {
    const trialEnd = new Date(record.trial_ends_at).getTime();
    const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

    if (daysLeft <= 0) {
      return { status: "expired", daysLeft: 0, isWarning: false, isExpired: true };
    }

    return {
      status: "trialing",
      daysLeft,
      isWarning: daysLeft <= WARNING_DAYS,
      isExpired: false,
    };
  }

  return { status: "expired", daysLeft: 0, isWarning: false, isExpired: true };
}

/**
 * Versión server-side de checkTrial.
 */
export async function checkTrialServer(supabase: any, userId: string, appSlug: string): Promise<TrialStatus> {
  const { data } = await supabase
    .from("user_apps")
    .select("status, trial_ends_at, current_period_end")
    .eq("user_id", userId)
    .eq("app_slug", appSlug)
    .maybeSingle();

  const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

  if (!data) {
    // Crear trial si no existe
    const trialEnd = new Date(Date.now() + TRIAL_MS).toISOString();
    await supabase.from("user_apps").insert({
      user_id: userId, app_slug: appSlug, status: "trialing", trial_ends_at: trialEnd,
    });
    return { status: "trialing", daysLeft: TRIAL_DAYS, isWarning: false, isExpired: false };
  }

  const record = data as any;
  const now = Date.now();

  if (record.status === "active" && record.current_period_end) {
    const end = new Date(record.current_period_end).getTime();
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    return { status: "active", daysLeft, isWarning: daysLeft <= WARNING_DAYS && daysLeft > 0, isExpired: daysLeft <= 0 };
  }

  if (record.trial_ends_at) {
    const trialEnd = new Date(record.trial_ends_at).getTime();
    const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
    if (daysLeft <= 0) return { status: "expired", daysLeft: 0, isWarning: false, isExpired: true };
    return { status: "trialing", daysLeft, isWarning: daysLeft <= WARNING_DAYS, isExpired: false };
  }

  return { status: "expired", daysLeft: 0, isWarning: false, isExpired: true };
}

/**
 * Obtener las apps de un usuario para el app switcher.
 */
export async function getUserApps(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_apps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (data ?? []) as any[];
}

/**
 * Obtener las apps de un usuario (server-side).
 */
export async function getUserAppsServer(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_apps")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (data ?? []) as any[];
}
