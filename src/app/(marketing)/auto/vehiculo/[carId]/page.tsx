import { createClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/types/database";

export default async function PublicVehiclePage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;
  const supabase = await createClient();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", carId)
    .single();

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-auto-gradient flex items-center justify-center">
        <p className="text-zinc-500">Vehículo no encontrado</p>
      </main>
    );
  }

  const car = vehicle as Vehicle;

  return (
    <main className="min-h-screen bg-auto-gradient">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="card-soft rounded-3xl overflow-hidden">
          {/* Foto */}
          <div className="h-56 bg-auto-100 flex items-center justify-center">
            {car.foto_url ? (
              <img src={car.foto_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🚗</span>
            )}
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-extrabold text-zinc-800">
                  {car.marca} {car.modelo}
                </h1>
                <p className="text-sm text-zinc-500">{car.año} · {car.placa}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                car.estado === "activo" ? "bg-emerald-100 text-emerald-700" :
                car.estado === "en venta" ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              }`}>
                {car.estado === "activo" ? "Activo" :
                 car.estado === "en venta" ? "En venta" :
                 car.estado === "robado" ? "Robado" : "Vendido"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-zinc-50 rounded-xl p-3">
                <p className="text-[10px] text-zinc-400">Kilometraje</p>
                <p className="font-bold text-zinc-800">{car.kilometraje.toLocaleString("es-PE")} km</p>
              </div>
              <div className="bg-zinc-50 rounded-xl p-3">
                <p className="text-[10px] text-zinc-400">Color</p>
                <p className="font-bold text-zinc-800">{car.color || "—"}</p>
              </div>
            </div>

            {car.estado === "en venta" && (
              <div className="bg-auto-50 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-auto-700">Este vehículo está a la venta</p>
                <p className="text-xs text-auto-500 mt-1">Contacta al propietario para más información</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
