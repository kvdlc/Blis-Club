import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkTrialServer } from "@/lib/trial";
import { cookies } from "next/headers";
import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleSpecs } from "@/types/database";
import { AUTO_BADGES } from "@/lib/auto-badges";
import DashboardContent from "./DashboardContent";

async function getDashboardData(userId: string, carId: string | null) {
  const supabase = await createClient();
  if (!carId) {
    const fallback = await supabase
      .from("vehicles")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    carId = (fallback.data as { id: string } | null)?.id ?? null;
  }
  if (!carId) return { vehicle: null, fuelLogs: [], documents: [], ecoScore: 0, nextDocExpiry: null, maintenances: [], specs: null };

  // Fetch vehicle, fuel logs (last 30), documents, maintenances, and specs in parallel
  const [
    { data: vehicle },
    { data: fuelLogs },
    { data: documents },
    { data: maintenances },
    { data: specs },
  ] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", carId).single(),
    supabase.from("fuel_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(30),
    supabase.from("vehicle_documents").select("*").eq("vehicle_id", carId).order("fecha_vencimiento", { ascending: true }),
    supabase.from("maintenance_logs").select("*").eq("vehicle_id", carId).order("fecha", { ascending: false }).limit(50),
    supabase.from("vehicle_specs").select("*").eq("vehicle_id", carId).maybeSingle(),
  ]);

  // Calculate eco-score from fuel logs
  let ecoScore = 50; // Default midpoint
  if (fuelLogs && fuelLogs.length >= 2) {
    const sorted = [...fuelLogs].sort((a: any, b: any) => a.odometro - b.odometro);
    let totalKm = 0;
    let totalGalones = 0;

    for (let i = 1; i < sorted.length; i++) {
      const kmRecorridos = sorted[i].odometro - sorted[i - 1].odometro;
      const galones = sorted[i - 1].litros / 3.78541;
      totalKm += kmRecorridos;
      totalGalones += galones;
    }

    if (totalGalones > 0) {
      const rendimientoPromedio = totalKm / totalGalones;
      // Score: map 15-45 km/gal to 0-100
      ecoScore = Math.min(100, Math.max(0, Math.round(((rendimientoPromedio - 15) / 30) * 100)));
    }
  }

  // Find next document expiring (within 60 days)
  const hoy = new Date();
  const docs = (documents as VehicleDocument[] | null) ?? [];
  const hoyStr = hoy.toISOString().split("T")[0];
  const limite = new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const nextDocExpiry = docs.find((d) => d.fecha_vencimiento >= hoyStr && d.fecha_vencimiento <= limite) ?? null;

  // Badges
  const checkData = {
    fuelLogs: (fuelLogs as FuelLog[] | null) ?? [],
    maintenances: (maintenances as MaintenanceLog[] | null) ?? [],
    documents: docs,
    vehiclesCount: 1,
  };
  const unlockedBadges = AUTO_BADGES.filter((b) => b.check(checkData)).map((b) => b.key);

  return {
    vehicle: vehicle as Vehicle | null,
    fuelLogs: (fuelLogs as FuelLog[] | null) ?? [],
    documents: docs,
    ecoScore,
    nextDocExpiry,
    maintenances: (maintenances as MaintenanceLog[] | null) ?? [],
    specs: specs as VehicleSpecs | null,
    badges: unlockedBadges,
  };
}

export default async function AutoDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const trial = await checkTrialServer(supabase, user.id, "auto");
  if (trial.isExpired) redirect("/auto/app/suscripcion");

  const cookieStore = await cookies();
  const referralCookie = cookieStore.get("blis_referral_code")?.value;
  if (referralCookie) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await fetch(`${baseUrl}/api/referrals/claim`, { method: "POST", headers: { "Content-Type": "application/json" } });
    } catch {}
  }

  const carId = cookieStore.get("blis_current_car")?.value ?? null;
  const data = await getDashboardData(user.id, carId);

  return (
    <DashboardContent vehicle={data.vehicle} fuelLogs={data.fuelLogs} ecoScore={data.ecoScore} nextDocExpiry={data.nextDocExpiry} maintenances={data.maintenances} specs={data.specs} badges={data.badges} />
  );
}
