"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog } from "@/types/database";
import { PawPrint, ChevronDown } from "lucide-react";
import { useBreedImage } from "@/lib/breeds";

interface DogContextType {
  currentDog: Dog | null;
  allDogs: Dog[];
  setCurrentDogId: (id: string) => void;
  loading: boolean;
}

const DogContext = createContext<DogContextType>({
  currentDog: null,
  allDogs: [],
  setCurrentDogId: () => {},
  loading: true,
});

export function useCurrentDog() {
  return useContext(DogContext);
}

export function DogProvider({ children }: { children: React.ReactNode }) {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [currentDog, setCurrentDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDogs = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase.from("dogs").select("*").eq("owner_id", user.id).order("created_at", { ascending: true });
      const loadedDogs = (data as Dog[] | null) ?? [];
      setDogs(loadedDogs);

      // Get saved dog from localStorage
      const savedId = typeof window !== "undefined" ? localStorage.getItem("blis_current_dog") : null;
      const selected = savedId ? loadedDogs.find((d) => d.id === savedId) : loadedDogs[0];
      setCurrentDog(selected ?? null);
      setLoading(false);
    };
    loadDogs();
  }, []);

  const setCurrentDogId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blis_current_dog", id);
      document.cookie = `blis_current_dog=${id};path=/;max-age=31536000;SameSite=Lax`;
    }
    const dog = dogs.find((d) => d.id === id);
    if (dog) setCurrentDog(dog);
  };

  return (
    <DogContext.Provider value={{ currentDog, allDogs: dogs, setCurrentDogId, loading }}>
      {children}
    </DogContext.Provider>
  );
}

export function DogSwitcher() {
  const { currentDog, allDogs, setCurrentDogId } = useCurrentDog();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const breedImg = useBreedImage(currentDog?.raza || "");

  if (!currentDog) return null;
  if (allDogs.length <= 1) return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-zinc-200">
        <img src={currentDog.foto_url || breedImg || "/icons/dog-default.png"} alt="" className="w-full h-full object-contain object-center" />
      </div>
      <span className="text-xs font-bold text-zinc-600 truncate max-w-[120px]">
        {currentDog.nombre}
      </span>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 pl-1.5 pr-2.5 py-1 transition-all hover:shadow-sm"
      >
        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center overflow-hidden border-2 border-white">
          <img src={currentDog.foto_url || breedImg || "/icons/dog-default.png"} alt="" className="w-full h-full object-contain object-center" />
        </div>
        <span className="text-xs font-bold text-zinc-700 max-w-[100px] truncate">
          {currentDog.nombre}
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 top-full mt-1 left-0 w-48 bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden">
            {allDogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => { setCurrentDogId(dog.id); setOpen(false); window.location.href = window.location.pathname + window.location.search; }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-zinc-50 ${dog.id === currentDog.id ? "bg-primary-50" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img src={dog.foto_url || "/icons/dog-default.png"} alt="" className="w-full h-full object-contain object-center" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-zinc-800 truncate">{dog.nombre}</p>
                  <p className="text-[9px] text-zinc-400 truncate">{dog.raza}</p>
                </div>
                {dog.id === currentDog.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
