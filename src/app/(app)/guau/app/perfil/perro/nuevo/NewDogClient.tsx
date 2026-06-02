"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, PawPrint, Check, PenLine, Search, ChevronDown, Camera, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { uploadDogPhoto, uploadPhotoFromDataUrl } from "@/lib/storage";
import { ImageEditor } from "@/components/ImageEditor";

interface Props {
  userId: string;
}

const BREEDS = [
  "Affenpinscher", "Afgano", "Akita", "Alaskan Malamute", "American Bully", "American Pitbull", "American Staffordshire",
  "Basenji", "Basset Hound", "Beagle", "Border Collie", "Boston Terrier", "Boxer", "Bulldog Francés", "Bulldog Inglés",
  "Caniche", "Cavalier King Charles", "Chihuahua", "Chow Chow", "Cocker Spaniel", "Collie", "Corgi",
  "Dálmata", "Doberman", "Dogo Argentino", "Golden Retriever", "Gran Danés", "Husky Siberiano",
  "Jack Russell Terrier", "Labrador Retriever", "Maltés", "Mestizo", "Pastor Alemán", "Pastor Belga",
  "Pinscher Miniatura", "Pomerania", "Poodle", "Pug", "Rottweiler", "Schnauzer", "Shar Pei", "Shiba Inu", "Shih Tzu",
  "Weimaraner", "Yorkshire Terrier", "Criollo / Mestizo"
].sort();

export function NewDogClient({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [breedSearch, setBreedSearch] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);
  const [birthDate, setBirthDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weightDisplay, setWeightDisplay] = useState("10");
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");

  const getAgeMonths = (birth: string) => {
    const b = new Date(birth);
    const now = new Date();
    return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  };

  const getWeight = () => {
    const v = parseFloat(weightDisplay.replace(",", "."));
    return isNaN(v) ? 10 : v;
  };

  const filteredBreeds = breedSearch.trim()
    ? BREEDS.filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
    : BREEDS;

  const handleCreate = async () => {
    if (!name || !breed) return;
    const edadMeses = getAgeMonths(birthDate);
    const { data: newDog } = await supabase.from("dogs").insert({
      owner_id: userId, nombre: name, raza: breed, edad_meses: edadMeses,
      fecha_nacimiento: birthDate,
      peso_kg: getWeight(), foto_url: photo || "/icons/dog-default.png",
    }).select("id").single();

    if (newDog) {
      const dogId = (newDog as { id: string }).id;
      await supabase.from("dog_metabolic_profiles").insert({
        dog_id: dogId, activity_level: "moderado",
      });
      router.push(`/guau/app/perfil/perro/${dogId}/editar`);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nuevo Perro</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-1.5">
        <label htmlFor="newDogPhoto" className="relative w-20 h-20 rounded-2xl bg-white flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden cursor-pointer group">
          <img src={photo || "/icons/dog-default.png"} alt="" className="w-full h-full object-contain object-center" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <PenLine className="w-3 h-3 text-zinc-500" />
          </div>
        </label>
        <input type="file" accept="image/*" className="hidden" id="newDogPhoto"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const blobUrl = URL.createObjectURL(file);
            setEditorSrc(blobUrl);
            setEditorOpen(true);
            e.target.value = "";
          }} />
      </div>

      {/* Name */}
      <div>
        <label className="text-xs text-zinc-500 block mb-1">Nombre *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" placeholder="Tank" />
      </div>

      {/* Breed */}
      <div className="relative">
        <label className="text-xs text-zinc-500 block mb-1">Raza *</label>
        <button type="button" onClick={() => setShowBreeds(!showBreeds)}
          className="w-full flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
          <span className={breed ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}>{breed || "Buscar raza..."}</span>
          <div className={`w-5 h-5 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center transition-transform ${showBreeds ? "rotate-180" : ""}`}>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </div>
        </button>
        {showBreeds && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl max-h-56 overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 p-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                <input type="text" value={breedSearch} onChange={(e) => setBreedSearch(e.target.value)}
                  placeholder="Escribe para buscar..." autoFocus
                  className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-7 pr-3 py-1.5 text-xs focus:outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto max-h-44">
              {filteredBreeds.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">No se encontraron razas</p>
              ) : (
                filteredBreeds.map((b) => (
                  <button key={b} onClick={() => { setBreed(b); setBreedSearch(""); setShowBreeds(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${b === breed ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 font-semibold" : "text-zinc-700 dark:text-zinc-300"}`}>
                    <span className="mr-2">{b === breed ? "✓" : ""}</span>{b}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Birth date + Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Fecha de nacimiento</label>
          <DatePicker value={birthDate} onChange={setBirthDate} />
          <p className="text-[10px] text-zinc-400 mt-0.5">{getAgeMonths(birthDate)} meses calculados</p>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Peso actual (kg)</label>
          <input type="text" inputMode="decimal" value={weightDisplay}
            onChange={(e) => setWeightDisplay(e.target.value)}
            placeholder="10,5"
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Create button */}
      <button onClick={handleCreate} disabled={!name || !breed}
        className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${!name || !breed ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"}`}>
        Crear Perro
      </button>

      {/* ═══ IMAGE EDITOR ═══ */}
      {editorOpen && (
        <ImageEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          imageUrl={editorSrc}
          onSave={async (dataUrl) => {
            setUploading(true);
            const url = await uploadPhotoFromDataUrl(dataUrl, userId);
            if (url) setPhoto(url);
            setUploading(false);
            setEditorOpen(false);
          }}
          circleSize={180}
        />
      )}
    </div>
  );
}
