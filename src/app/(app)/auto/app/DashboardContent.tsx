"use client";

import { useRouter } from "next/navigation";
import type { Vehicle, FuelLog, VehicleDocument, MaintenanceLog, VehicleSpecs } from "@/types/database";
import { Car } from "lucide-react";
import { HeroCard } from "./HeroCard";
import { QuickActions } from "./QuickActions";
import { DashboardWidgets } from "./DashboardWidgets";

interface Props {
  vehicle: Vehicle | null;
  fuelLogs: FuelLog[];
  ecoScore: number;
  nextDocExpiry: VehicleDocument | null;
  maintenances: MaintenanceLog[];
  specs: VehicleSpecs | null;
  badges?: string[];
}

export default function DashboardContent({ vehicle, fuelLogs, ecoScore, nextDocExpiry, maintenances, specs, badges = [] }: Props) {
  const router = useRouter();

  const bgLayer = (
    <div className="absolute -inset-x-4 -top-14 bottom-0 bg-auto-gradient z-0 pointer-events-none" />
  );

  if (!vehicle) {
    return (
      <div className="relative -mx-4 -mt-3 px-4 pt-3 min-h-[calc(100vh-7rem)] text-zinc-200">
        {bgLayer}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            <Car className="w-10 h-10 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">¡Bienvenido a Auto!</h2>
            <p className="text-zinc-500 mt-2 max-w-sm text-sm leading-relaxed">
              Registra tu primer vehículo para comenzar a usar todas las herramientas.
            </p>
          </div>
          <button
            onClick={() => router.push("/auto/app/perfil/vehiculo/nuevo")}
            className="px-6 py-3 rounded-2xl bg-auto-600 text-white font-bold text-sm hover:bg-auto-500 transition-colors active:scale-95 shadow-auto-glow"
          >
            Agregar vehículo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative -mx-4 -mt-3 px-4 pt-3 min-h-[calc(100vh-7rem)] text-zinc-200">
      {bgLayer}
      <div className="relative z-10 space-y-4">
        <HeroCard vehicle={vehicle} fuelLogs={fuelLogs} ecoScore={ecoScore} />
        <QuickActions />
        <DashboardWidgets vehicle={vehicle} ecoScore={ecoScore} nextDocExpiry={nextDocExpiry} fuelLogs={fuelLogs} maintenances={maintenances} specs={specs} badges={badges} />
      </div>
    </div>
  );
}
