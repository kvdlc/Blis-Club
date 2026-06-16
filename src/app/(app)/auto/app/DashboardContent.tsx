"use client";

import { useRouter } from "next/navigation";
import type { Vehicle, FuelLog, VehicleDocument } from "@/types/database";
import { HeroCard } from "./HeroCard";
import { QuickActions } from "./QuickActions";
import { DashboardWidgets } from "./DashboardWidgets";

interface Props {
  vehicle: Vehicle | null;
  fuelLogs: FuelLog[];
  ecoScore: number;
  nextDocExpiry: VehicleDocument | null;
}

export default function DashboardContent({ vehicle, fuelLogs, ecoScore, nextDocExpiry }: Props) {
  const router = useRouter();

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="w-24 h-24 rounded-full bg-auto-50 flex items-center justify-center">
          <span className="text-4xl">🚗</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">¡Bienvenido a Auto!</h2>
          <p className="text-zinc-500 mt-2 max-w-sm text-sm leading-relaxed">
            Registra tu primer vehículo para comenzar a usar todas las herramientas.
          </p>
        </div>
        <button
          onClick={() => router.push("/auto/app/perfil/vehiculo/nuevo")}
          className="px-6 py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-700 transition-colors active:scale-95 shadow-lg shadow-auto-600/20"
        >
          Agregar vehículo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HeroCard vehicle={vehicle} fuelLogs={fuelLogs} ecoScore={ecoScore} />
      <QuickActions />
      <DashboardWidgets vehicle={vehicle} ecoScore={ecoScore} nextDocExpiry={nextDocExpiry} fuelLogs={fuelLogs} />
    </div>
  );
}
