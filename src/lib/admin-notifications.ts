import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AdminNotification } from "@/types/database";
import type { AdminFeed } from "@/lib/admin-notifications-shared";

export type { AdminFeed } from "@/lib/admin-notifications-shared";
export { APP_LABELS } from "@/lib/admin-notifications-shared";

/**
 * Feed unificado de notificaciones para admins/superadmins.
 * Devuelve null si el usuario no es admin (los no-admins no cargan nada más).
 */
export const getAdminFeed = cache(async (userId: string, limit = 30): Promise<AdminFeed | null> => {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) return null;

  const service = createServiceClient();

  const [notifRes, readsRes, notifCountRes, totalRes, appsRes] = await Promise.all([
    service
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit),
    service.from("admin_notification_reads").select("notification_id").eq("user_id", userId),
    service.from("admin_notifications").select("id", { count: "exact", head: true }),
    service.from("profiles").select("id", { count: "exact", head: true }),
    service.from("user_apps").select("app_slug"),
  ]);

  const readSet = new Set(((readsRes.data ?? []) as { notification_id: string }[]).map((r) => r.notification_id));

  const notifications: AdminNotification[] = ((notifRes.data ?? []) as AdminNotification[]).map((n) => ({
    ...n,
    read: readSet.has(n.id),
  }));

  const unreadCount = Math.max(0, (notifCountRes.count ?? 0) - readSet.size);

  const map = new Map<string, number>();
  for (const row of (appsRes.data ?? []) as { app_slug: string }[]) {
    map.set(row.app_slug, (map.get(row.app_slug) ?? 0) + 1);
  }
  const byApp = Array.from(map.entries())
    .map(([app_slug, count]) => ({ app_slug, count }))
    .sort((a, b) => b.count - a.count);

  return {
    notifications,
    unreadCount,
    totals: { total: totalRes.count ?? 0, byApp },
  };
});
