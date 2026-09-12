import type { AdminNotification } from "@/types/database";

export type { AdminNotification };

export const APP_LABELS: Record<string, { name: string; color: string }> = {
  guau: { name: "Guau", color: "#5956e9" },
  auto: { name: "Auto", color: "#10b981" },
  Spartan: { name: "Spartan", color: "#be0b3c" },
};

export interface AdminFeed {
  notifications: AdminNotification[];
  unreadCount: number;
  totals: {
    total: number;
    byApp: { app_slug: string; count: number }[];
  };
}
