"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Vehicle } from "@/types/database";
import { ChevronDown } from "lucide-react";

interface CarContextType {
  currentCar: Vehicle | null;
  allCars: Vehicle[];
  setCurrentCarId: (id: string) => void;
  loading: boolean;
}

const CarContext = createContext<CarContextType>({
  currentCar: null,
  allCars: [],
  setCurrentCarId: () => {},
  loading: true,
});

export function useCurrentCar() {
  return useContext(CarContext);
}

export function CarProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [currentCar, setCurrentCar] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("vehicles")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });
      const loadedCars = (data as Vehicle[] | null) ?? [];
      setCars(loadedCars);

      const savedId = typeof window !== "undefined" ? localStorage.getItem("blis_current_car") : null;
      const selected = savedId ? loadedCars.find((c) => c.id === savedId) : loadedCars[0];
      setCurrentCar(selected ?? null);
      setLoading(false);
    };
    loadCars();
  }, []);

  const setCurrentCarId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blis_current_car", id);
      document.cookie = `blis_current_car=${id};path=/;max-age=31536000;SameSite=Lax`;
    }
    const car = cars.find((c) => c.id === id);
    if (car) setCurrentCar(car);
  };

  return (
    <CarContext.Provider value={{ currentCar, allCars: cars, setCurrentCarId, loading }}>
      {children}
    </CarContext.Provider>
  );
}

export function CarSwitcher() {
  const { currentCar, allCars, setCurrentCarId } = useCurrentCar();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!currentCar && allCars.length === 0) {
    return (
      <button
        onClick={() => router.push("/auto/app/perfil/vehiculo/nuevo")}
        className="flex items-center gap-1.5 rounded-full bg-auto-500 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-auto-600 active:scale-95"
      >
        + Agregar vehículo
      </button>
    );
  }

  if (!currentCar) return null;

  if (allCars.length <= 1) return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
        {currentCar.foto_url ? (
          <img src={currentCar.foto_url} alt="" className="w-full h-full object-cover object-center" />
        ) : (
          <span className="text-xs font-black text-auto-500">{currentCar.marca.charAt(0)}</span>
        )}
      </div>
      <span className="text-xs font-bold text-zinc-300 truncate max-w-[140px]">
        {currentCar.marca} {currentCar.modelo}
      </span>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 pl-1.5 pr-2.5 py-1 transition-all hover:bg-white/10"
      >
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-white">
          {currentCar.foto_url ? (
            <img src={currentCar.foto_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-black text-auto-500">{currentCar.marca.charAt(0)}</span>
          )}
        </div>
        <span className="text-xs font-bold text-zinc-300 max-w-[100px] truncate">
          {currentCar.marca} {currentCar.modelo}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full mt-1 left-0 w-56 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {allCars.map((car) => (
              <button
                key={car.id}
                onClick={() => { setCurrentCarId(car.id); setOpen(false); router.refresh(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${car.id === currentCar.id ? "bg-auto-600/15" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/5">
                  {car.foto_url ? (
                    <img src={car.foto_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-auto-500">{car.marca.charAt(0)}</span>
                  )}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-200 truncate">{car.marca} {car.modelo}</p>
                  <p className="text-[9px] text-zinc-500 truncate">{car.año} · {car.placa}</p>
                </div>
                {car.id === currentCar.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-auto-500" />
                )}
              </button>
            ))}
            <div className="border-t border-white/5 p-1.5">
              <button
                onClick={() => { setOpen(false); router.push("/auto/app/perfil/vehiculo/nuevo"); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-auto-500 hover:bg-auto-600/10 transition-colors"
              >
                + Agregar vehículo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
