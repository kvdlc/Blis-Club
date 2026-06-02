"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMetabolicProfile, DogMealSlot, WeeklyChallenge, UserChallenge } from "@/types/database";
import { ArrowLeft, Camera, PawPrint, Check, Search, PenLine, ChevronDown, Loader2 } from "lucide-react";
import { MealSlotsConfig } from "../../../MealSlotsConfig";
import { DatePicker } from "@/components/DatePicker";
import { uploadDogPhoto, uploadPhotoFromDataUrl } from "@/lib/storage";
import { ImageEditor } from "@/components/ImageEditor";
import { BreedImagePicker } from "@/components/BreedImagePicker";

interface Props {
  dog: Dog;
  metabolicProfile: DogMetabolicProfile | null;
  mealSlots: DogMealSlot[];
  challenges: WeeklyChallenge[];
  userChallenges: UserChallenge[];
  userId: string;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentario: "Sedentario", moderado: "Moderado", activo: "Activo", atletico: "Atlético",
};

const ALLERGIES_LIST = ["Pollo", "Res", "Cordero", "Cerdo", "Pescado", "Lácteos", "Gluten", "Huevo"];
const CONDITIONS_LIST = ["Renal", "Hepático", "Pancreatitis", "Senior", "Obesidad", "Diabetes", "Alergias piel", "Cardíaco"];
const OBJECTIVES = ["Obediencia básica", "Control de reactividad", "Agility", "Perro de servicio", "Terapia", "Guardia y protección", "Trucos avanzados", "Socialización", "Pérdida de peso", "Fortalecimiento muscular"];

const BREEDS = [
  "Affenpinscher", "Afgano", "Akita", "Alaskan Malamute", "American Bully", "American Pitbull", "American Staffordshire",
  "Basenji", "Basset Hound", "Beagle", "Bearded Collie", "Bichón Frisé", "Border Collie", "Boston Terrier", "Boxer", "Boyero de Berna", "Bulldog Francés", "Bulldog Inglés",
  "Caniche", "Cavalier King Charles", "Chihuahua", "Chow Chow", "Cocker Spaniel", "Collie", "Corgi",
  "Dálmata", "Doberman", "Dogo Argentino", "Dogo de Burdeos",
  "Golden Retriever", "Gran Danés", "Greyhound",
  "Husky Siberiano",
  "Jack Russell Terrier",
  "Labrador Retriever", "Lhasa Apso",
  "Maltés", "Mastín", "Mestizo",
  "Pastor Alemán", "Pastor Belga", "Pastor Australiano", "Pekinés", "Pinscher Miniatura", "Pointer", "Pomerania", "Poodle", "Pug",
  "Rottweiler",
  "Samoyedo", "San Bernardo", "Schnauzer", "Setter Irlandés", "Shar Pei", "Shiba Inu", "Shih Tzu",
  "Terranova",
  "Weimaraner", "West Highland Terrier",
  "Yorkshire Terrier",
  "Criollo / Mestizo"
].sort();

export function EditDogClient({ dog, metabolicProfile, mealSlots, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [photo, setPhoto] = useState(dog.foto_url ?? "");
  const [name, setName] = useState(dog.nombre);
  const [breed, setBreed] = useState(dog.raza);
  const [breedSearch, setBreedSearch] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [birthDate, setBirthDate] = useState(() => {
    if (dog.fecha_nacimiento) return dog.fecha_nacimiento;
    const d = new Date();
    d.setMonth(d.getMonth() - dog.edad_meses);
    return d.toISOString().slice(0, 10);
  });
  const [weightDisplay, setWeightDisplay] = useState(String(dog.peso_kg).replace(".", ","));
  const [objective, setObjective] = useState(dog.objetivo_principal ?? "");
  const [breedImage, setBreedImage] = useState(dog.foto_url || (dog as any).breed_image_url || "");

  const getWeightNumber = () => {
    const v = parseFloat(weightDisplay.replace(",", "."));
    return isNaN(v) ? dog.peso_kg : v;
  };

  const [activity, setActivity] = useState(metabolicProfile?.activity_level ?? "moderado");
  const [allergies, setAllergies] = useState<string[]>(metabolicProfile?.allergies ?? []);
  const [conditions, setConditions] = useState<string[]>(metabolicProfile?.medical_conditions ?? []);
  const [feedingPct, setFeedingPct] = useState(metabolicProfile?.feeding_pct ?? 2.5);

  const [saved, setSaved] = useState(false);
  const [saveIcon, setSaveIcon] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");
  const breedRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (breedRef.current && !breedRef.current.contains(e.target as Node)) setShowBreeds(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleArray = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const getAgeMonths = (birth: string): number => {
    const b = new Date(birth);
    const now = new Date();
    let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
    if (now.getDate() < b.getDate()) months--;
    return months;
  };

  const getAgeDays = (birth: string): number => {
    const b = new Date(birth);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth(), b.getDate());
    if (now >= lastMonthDate) {
      return now.getDate() - b.getDate();
    } else {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return (prevMonth.getDate() - b.getDate()) + now.getDate();
    }
  };

  // Auto-save with debounce
  const autoSave = useCallback(async () => {
    setSaveIcon(true);
    const edadMeses = getAgeMonths(birthDate);
    await supabase.from("dogs").update({
      nombre: name, raza: breed, edad_meses: edadMeses, fecha_nacimiento: birthDate,
      peso_kg: getWeightNumber(),
      objetivo_principal: objective || null, foto_url: photo || null, breed_image_url: breedImage || null,
    }).eq("id", dog.id);

    await supabase.from("dog_metabolic_profiles").upsert({
      dog_id: dog.id, activity_level: activity, allergies, medical_conditions: conditions,
      feeding_pct: feedingPct,
    }, { onConflict: "dog_id" });

    setSaved(true);
    setTimeout(() => { setSaved(false); setSaveIcon(false); }, 1500);
  }, [name, breed, birthDate, weightDisplay, objective, photo, breedImage, activity, allergies, conditions, feedingPct, dog.id, supabase]);

  // Debounced auto-save on any field change
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [name, breed, birthDate, weightDisplay, objective, photo, breedImage, activity, allergies, conditions, feedingPct]);

  const filteredBreeds = breedSearch.trim()
    ? BREEDS.filter((b) => b.toLowerCase().includes(breedSearch.toLowerCase()))
    : BREEDS;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {saveIcon && (
          <span className="flex items-center gap-1 text-xs text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-950/30 rounded-full px-2 py-1">
            <Check className="w-3 h-3" /> Guardando...
          </span>
        )}
      </div>

      {/* ═══ AVATAR ═══ */}
      <div className="flex flex-col items-center gap-1.5">
        <label htmlFor="dogPhotoUpload" className="relative w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden cursor-pointer group">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover object-center" />
          ) : (
            <PawPrint className="w-9 h-9 text-zinc-400 group-hover:scale-110 transition-transform" />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          {/* Pencil icon */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-600 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <PenLine className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          </div>
        </label>
        <input type="file" accept="image/*" className="hidden" id="dogPhotoUpload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const blobUrl = URL.createObjectURL(file);
            setEditorSrc(blobUrl);
            setEditorOpen(true);
            e.target.value = "";
          }} />
      </div>

      {/* ═══ BIG DOG NAME (editable, neon effect) ═══ */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                autoFocus
                className="text-4xl font-black text-center bg-transparent border-b-2 border-primary-400 outline-none text-zinc-800 dark:text-zinc-100 w-64"
                style={{ fontFamily: "var(--font-quicksand), 'Nunito', sans-serif", fontWeight: 900 }}
              />
              <button onClick={() => setEditingName(false)} className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-600" />
              </button>
            </div>
          ) : (
            <h1
              onClick={() => setEditingName(true)}
              className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 via-emerald-300 to-secondary-400 animate-pulse drop-shadow-[0_0_14px_rgba(34,197,94,0.35)] cursor-pointer select-none"
              style={{ fontFamily: "var(--font-quicksand), 'Nunito', sans-serif", fontWeight: 900, letterSpacing: "-0.02em" }}
            >
              {name || "Sin nombre"}
            </h1>
          )}
          <div className="absolute -inset-2 bg-gradient-to-r from-secondary-400/15 via-emerald-300/25 to-secondary-400/15 blur-2xl rounded-full animate-pulse -z-10" />
          {!editingName && (
            <button
              onClick={() => setEditingName(true)}
              className="absolute -bottom-1 -right-4 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <PenLine className="w-3 h-3 text-primary-500" />
            </button>
          )}
        </div>
      </div>

      {/* ═══ DATOS BÁSICOS ═══ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Datos Básicos</h3>

        {/* Breed searchable */}
        <div className="relative" ref={breedRef}>
          <label className="text-xs text-zinc-500 block mb-1">Raza</label>
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
                  <input type="text" value={breedSearch}
                    onChange={(e) => { setBreedSearch(e.target.value); }}
                    placeholder="Escribe para buscar..."
                    autoFocus
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

        <BreedImagePicker breed={breed} selected={breedImage} onSelect={setBreedImage} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Fecha de nacimiento</label>
            <DatePicker value={birthDate} onChange={setBirthDate} />
            <p className="text-[10px] text-zinc-400 mt-0.5">{getAgeMonths(birthDate)} meses, {getAgeDays(birthDate)} días calculados</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Peso actual (kg)</label>
            <input type="text" inputMode="decimal" value={weightDisplay}
              onChange={(e) => setWeightDisplay(e.target.value)}
              placeholder="28,5"
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Objective dropdown */}
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Objetivo Principal</label>
          <select value={objective} onChange={(e) => setObjective(e.target.value)}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm">
            <option value="">Sin objetivo</option>
            {OBJECTIVES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* ═══ PERFIL METABÓLICO ═══ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Perfil Metabólico</h3>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">Nivel de actividad</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value as any)}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm">
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">Alergias</label>
          <div className="flex flex-wrap gap-1.5">
            {ALLERGIES_LIST.map((a) => (
              <button key={a} onClick={() => setAllergies(toggleArray(allergies, a))}
                className={`text-[10px] rounded-full px-2.5 py-1 transition-colors ${allergies.includes(a) ? "bg-warning-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>{a}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">Condiciones médicas</label>
          <div className="flex flex-wrap gap-1.5">
            {CONDITIONS_LIST.map((c) => (
              <button key={c} onClick={() => setConditions(toggleArray(conditions, c))}
                className={`text-[10px] rounded-full px-2.5 py-1 transition-colors ${conditions.includes(c) ? "bg-accent-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">% de alimentación corporal</label>
          <div className="flex items-center gap-3">
            <input type="range" min={1.5} max={3.5} step={0.1} value={feedingPct} onChange={(e) => setFeedingPct(Number(e.target.value))}
              className="flex-1 accent-primary-600" />
            <span className="text-sm font-mono font-bold w-10">{feedingPct}%</span>
          </div>
        </div>
      </div>

      {/* ═══ HORARIOS DE COMIDA ═══ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Horarios de Comida</h3>
        <MealSlotsConfig dog={dog} initialSlots={mealSlots} />
      </div>

      {/* ═══ FLOATING SAVE INDICATOR ═══ */}
      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-secondary-500 text-white rounded-full px-5 py-2.5 text-sm font-bold shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" /> Guardado
        </div>
      )}

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
