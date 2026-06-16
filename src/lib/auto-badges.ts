import { createClient } from "@/lib/supabase/client";
import type { FuelLog, MaintenanceLog, VehicleDocument } from "@/types/database";

export interface BadgeInfo {
  key: string;
  name: string;
  emoji: string;
  desc: string;
  check: (data: CheckData) => boolean;
}

interface CheckData {
  fuelLogs: FuelLog[];
  maintenances: MaintenanceLog[];
  documents: VehicleDocument[];
  vehiclesCount: number;
}

export const AUTO_BADGES: BadgeInfo[] = [
  {
    key: "primera_carga",
    name: "Primera carga",
    emoji: "⛽",
    desc: "Registraste tu primera carga de combustible",
    check: (d) => d.fuelLogs.length >= 1,
  },
  {
    key: "tanque_lleno",
    name: "Tanque lleno",
    emoji: "🛢️",
    desc: "Registraste 10 o más cargas de combustible",
    check: (d) => d.fuelLogs.length >= 10,
  },
  {
    key: "eco_warrior",
    name: "Eco-Warrior",
    emoji: "🌿",
    desc: "Rendimiento promedio ≥ 40 km/gal",
    check: (d) => {
      if (d.fuelLogs.length < 2) return false;
      const sorted = [...d.fuelLogs].sort((a, b) => a.odometro - b.odometro);
      let totalKm = 0, totalGal = 0;
      for (let i = 1; i < sorted.length; i++) {
        totalKm += sorted[i].odometro - sorted[i - 1].odometro;
        totalGal += sorted[i - 1].litros / 3.78541;
      }
      return totalGal > 0 && (totalKm / totalGal) >= 40;
    },
  },
  {
    key: "preventivo",
    name: "Preventivo",
    emoji: "🔧",
    desc: "Registraste 3+ mantenimientos preventivos",
    check: (d) => d.maintenances.filter((m) => m.tipo === "preventivo").length >= 3,
  },
  {
    key: "viajero",
    name: "Viajero",
    emoji: "🛣️",
    desc: "5,000+ km acumulados en cargas",
    check: (d) => {
      if (d.fuelLogs.length < 2) return false;
      const sorted = [...d.fuelLogs].sort((a, b) => a.odometro - b.odometro);
      return sorted[sorted.length - 1].odometro - sorted[0].odometro >= 5000;
    },
  },
  {
    key: "documentado",
    name: "Documentado",
    emoji: "📋",
    desc: "3+ documentos vigentes registrados",
    check: (d) => {
      const hoy = new Date().toISOString().split("T")[0];
      return d.documents.filter((doc) => doc.fecha_vencimiento >= hoy).length >= 3;
    },
  },
  {
    key: "primer_vehiculo",
    name: "Primer vehículo",
    emoji: "🚗",
    desc: "Registraste tu primer vehículo",
    check: (d) => d.vehiclesCount >= 1,
  },
];

export async function checkAndUnlockBadges(userId: string, data: CheckData): Promise<string[]> {
  const supabase = createClient();
  const { data: existing } = await supabase.from("auto_badges").select("badge_key").eq("user_id", userId);
  const existingKeys = new Set((existing ?? []).map((b: any) => b.badge_key));

  const newBadges: string[] = [];
  for (const badge of AUTO_BADGES) {
    if (!existingKeys.has(badge.key) && badge.check(data)) {
      const { error } = await supabase.from("auto_badges").insert({ user_id: userId, badge_key: badge.key });
      if (!error) newBadges.push(badge.key);
    }
  }
  return newBadges;
}

export async function getUserBadges(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("auto_badges").select("badge_key").eq("user_id", userId);
  return (data ?? []).map((b: any) => b.badge_key);
}
