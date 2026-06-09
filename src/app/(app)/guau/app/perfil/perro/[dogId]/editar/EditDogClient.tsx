"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dog, DogMetabolicProfile, DogMealSlot, WeeklyChallenge, UserChallenge } from "@/types/database";
import { sugerirTamanoPorRaza, BREED_SIZE_LABELS } from "@/lib/breed-sizes";
import { ArrowLeft, Camera, PawPrint, Check, Search, PenLine, ChevronDown, Loader2, Trash2, AlertTriangle, Globe, Info, Target, Flame } from "lucide-react";
import { MealSlotsConfig } from "../../../MealSlotsConfig";
import { DatePicker } from "@/components/DatePicker";
import { uploadDogPhoto, uploadPhotoFromDataUrl } from "@/lib/storage";
import { ImageEditor } from "@/components/ImageEditor";
import { BreedImagePicker } from "@/components/BreedImagePicker";
import {
  getFeedingDefaults, ACTIVITY_LABELS as FS_ACTIVITY_LABELS,
  calcularRacionDiaria, calcularRacionMixta,
  BARF_PCT_BY_STAGE, CROQUETAS_PCT_BY_STAGE, MIXTA_AJUSTE_RANGE,
} from "@/lib/feeding-standards";
import type { ActivityLevel, DietType, LifeStage } from "@/lib/feeding-standards";

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
  const [tamano, setTamano] = useState(dog.tamano || "");

  // Auto-detect size from breed
  useEffect(() => {
    if (breed && !tamano) {
      const suggested = sugerirTamanoPorRaza(breed);
      if (suggested) setTamano(suggested);
    }
  }, [breed]);

  const getWeightNumber = () => {
    const v = parseFloat(weightDisplay.replace(",", "."));
    return isNaN(v) ? dog.peso_kg : v;
  };

  const [activity, setActivity] = useState(metabolicProfile?.activity_level ?? "moderado");
  const [allergies, setAllergies] = useState<string[]>(metabolicProfile?.allergies ?? []);
  const [conditions, setConditions] = useState<string[]>(metabolicProfile?.medical_conditions ?? []);
  const [feedingPct, setFeedingPct] = useState(metabolicProfile?.feeding_pct ?? 2.5);
  const [dietType, setDietType] = useState<DietType>((metabolicProfile?.diet_type as DietType) ?? "croquetas");
  const [mixtaBarfProp, setMixtaBarfProp] = useState(50);
  const [lifeStage, setLifeStage] = useState<LifeStage>(() => {
    if (!dog) return "adulto";
    const defaults = getFeedingDefaults({ raza: dog.raza, peso_kg: dog.peso_kg, edad_meses: dog.edad_meses, tamano_guardado: dog.tamano || null });
    return defaults.life_stage;
  });

  // Calculated ration (useMemo para evitar hydration mismatch)
  const ration = useMemo(() => {
    const w = getWeightNumber();
    if (dietType === "mixta") {
      return calcularRacionMixta({
        peso_kg: w, life_stage: lifeStage,
        proporcion_barf: mixtaBarfProp, activity_level: activity as ActivityLevel, ajuste_global: feedingPct / 100,
      });
    }
    return calcularRacionDiaria({ peso_kg: w, feeding_pct: feedingPct, diet_type: dietType, activity_level: activity as ActivityLevel });
  }, [dietType, feedingPct, mixtaBarfProp, activity, lifeStage, weightDisplay]);

  const total = ration.total_grams ?? (dietType === "mixta" ? (ration.barf_grams + ration.croquetas_grams) : ration.total_grams);
  const kcalTotal = 'total_kcal' in ration ? ration.total_kcal : 0;
  const barfGrams = 'barf_grams' in ration ? ration.barf_grams : (dietType === "barf" ? total : 0);
  const croqGrams = 'croquetas_grams' in ration ? ration.croquetas_grams : (dietType === "croquetas" ? total : 0);

  const pctRange = dietType === "barf" ? BARF_PCT_BY_STAGE[lifeStage] :
    dietType === "croquetas" ? CROQUETAS_PCT_BY_STAGE[lifeStage] : null;

  const [saved, setSaved] = useState(false);
  const [saveIcon, setSaveIcon] = useState(false);
  const [savingFeeding, setSavingFeeding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  // Auto-save: solo datos básicos (alimentación se guarda con botón manual)
  const autoSave = useCallback(async () => {
    setSaveIcon(true);
    const edadMeses = getAgeMonths(birthDate);
    await supabase.from("dogs").update({
      nombre: name, raza: breed, edad_meses: edadMeses, fecha_nacimiento: birthDate,
      peso_kg: getWeightNumber(),
      tamano: tamano || null,
      objetivo_principal: objective || null, foto_url: photo || null, breed_image_url: breedImage || null,
    }).eq("id", dog.id);

    setSaved(true);
    setTimeout(() => { setSaved(false); setSaveIcon(false); }, 1500);
  }, [name, breed, birthDate, weightDisplay, objective, photo, breedImage, tamano, dog.id, supabase]);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("dogs").delete().eq("id", dog.id);
    setDeleting(false);
    setShowDeleteConfirm(false);
    if (!error) {
      router.push("/guau/app/perfil");
      router.refresh();
    } else {
      alert("Error al eliminar: " + error.message);
    }
  };

  // Debounced auto-save on any field change
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 800);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [name, breed, birthDate, weightDisplay, objective, photo, breedImage, activity, allergies, conditions]);

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
        <label htmlFor="dogPhotoUpload" className="relative w-20 h-20 rounded-2xl bg-white flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden cursor-pointer group">
          <img src={photo || "/icons/dog-default.png"} alt="" className="w-full h-full object-contain object-center" />
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

        {/* Tamaño dropdown */}
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Tamaño de raza</label>
          <select value={tamano} onChange={(e) => setTamano(e.target.value)}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm">
            <option value="">Auto-detectar</option>
            {Object.entries(BREED_SIZE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {tamano
              ? `Seleccionado: ${BREED_SIZE_LABELS[tamano]}`
              : breed
                ? `Se auto-detectará según la raza: ${breed}`
                : "Se auto-detectará según la raza"}
          </p>
        </div>
      </div>

      {/* ═══ ALIMENTACIÓN ═══ */}
      <div className="card-soft rounded-[1.5rem] p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Alimentación</h3>

        {/* Etapa de vida */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Etapa de vida</span>
          <span className="text-xs font-bold text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/30">
            {lifeStage === "cachorro" ? "Cachorro" : lifeStage === "adolescente" ? "Adolescente" : "Adulto"}
            {tamano && ` · ${BREED_SIZE_LABELS[tamano] || tamano}`}
          </span>
        </div>

        {/* Tipo de dieta */}
        <div>
          <label className="text-[10px] text-zinc-400 block mb-1.5">Tipo de alimentación</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: "croquetas" as DietType, label: "Croquetas", icon: "🦴" },
              { key: "barf" as DietType, label: "Natural", icon: "🥩" },
              { key: "mixta" as DietType, label: "Mixta", icon: "⚖️" },
            ]).map((opt) => (
              <button key={opt.key} onClick={() => {
                setDietType(opt.key);
                if (opt.key === "mixta") { setFeedingPct(100); }
                else if (opt.key === "croquetas") { setFeedingPct(CROQUETAS_PCT_BY_STAGE[lifeStage].default); }
                else { setFeedingPct(BARF_PCT_BY_STAGE[lifeStage].default); }
              }}
                className={`rounded-xl py-2 text-xs font-bold transition-all border-2 ${
                  dietType === opt.key
                    ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-700 dark:text-primary-300"
                    : "bg-zinc-100 dark:bg-zinc-800 border-transparent text-zinc-500"
                }`}
              >
                <span className="text-base block">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ración diaria */}
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{total}</span>
            <span className="text-[10px] text-zinc-500 block">gramos/día</span>
            <span className="text-[10px] text-zinc-400">{kcalTotal} kcal</span>
          </div>
        </div>

        {/* Detalle mixta / croquetas */}
        {dietType === "mixta" && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-500">🦴 Croquetas: {croqGrams}g · 🥩 Natural: {barfGrams}g</p>
          </div>
        )}
        {dietType === "croquetas" && (
          <p className="text-[10px] text-zinc-400 text-center">≈ {Math.round((total / 110) * 10) / 10} tazas/día</p>
        )}

        {/* Actividad */}
        <div>
          <label className="text-[10px] text-zinc-400 block mb-1">Nivel de actividad</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value as any)}
            className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs">
            {Object.entries(FS_ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Slider principal */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {dietType === "mixta" ? "Ajuste de cantidad" : "% del peso corporal"}
            </span>
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
              {dietType === "mixta" ? `${Math.round(feedingPct)}%` : `${feedingPct.toFixed(1)}%`}
            </span>
          </div>
          <input type="range"
            min={dietType === "mixta" ? MIXTA_AJUSTE_RANGE.min : (pctRange?.min ?? 1.5)}
            max={dietType === "mixta" ? MIXTA_AJUSTE_RANGE.max : (pctRange?.max ?? 8)}
            step={dietType === "mixta" ? 5 : 0.1}
            value={feedingPct}
            onChange={(e) => setFeedingPct(Number(e.target.value))}
            className="w-full accent-primary-600" />
          <p className="text-[10px] text-zinc-400">
            {dietType === "mixta"
              ? `${MIXTA_AJUSTE_RANGE.min}-${MIXTA_AJUSTE_RANGE.max}%`
              : `Recomendado: ${pctRange?.min}-${pctRange?.max}%`}
          </p>
        </div>

        {/* Slider proporción BARF (mixta) */}
        {dietType === "mixta" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-primary-600 dark:text-primary-400">🦴 Croquetas {100 - mixtaBarfProp}%</span>
              <span className="text-accent-600 dark:text-accent-400">{mixtaBarfProp}% Natural 🥩</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={mixtaBarfProp}
              onChange={(e) => setMixtaBarfProp(Number(e.target.value))}
              className="w-full accent-zinc-400" />
          </div>
        )}

        {/* Botón Guardar alimentación y salud */}
        <button
          onClick={async () => {
            setSavingFeeding(true);
            const { error } = await supabase.from("dog_metabolic_profiles").upsert({
              dog_id: dog.id, activity_level: activity, allergies, medical_conditions: conditions,
              feeding_pct: feedingPct, diet_type: dietType,
            }, { onConflict: "dog_id" });
            if (error) {
              // Retry without diet_type if column missing
              const { error: e2 } = await supabase.from("dog_metabolic_profiles").upsert({
                dog_id: dog.id, activity_level: activity, allergies, medical_conditions: conditions,
                feeding_pct: feedingPct,
              }, { onConflict: "dog_id" });
              if (e2) console.warn("[EditDog] Save failed:", e2.message);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
            setSavingFeeding(false);
          }}
          disabled={savingFeeding}
          className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-2.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {savingFeeding ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {/* ═══ SALUD ═══ */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Salud</h3>

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

      {/* ═══ PERFIL PÚBLICO ═══ */}
      <div className="pt-4 space-y-3">
        <a
          href={`/guau/app/perfil/perro/${dog.id}/publico`}
          className="card-elevated rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Perfil Público</p>
            <p className="text-[10px] text-zinc-400">Configura lo que el mundo ve de {name}</p>
          </div>
          <ChevronDown className="w-5 h-5 text-zinc-400 -rotate-90" />
        </a>
      </div>

      {/* ═══ ELIMINAR PERRO ═══ */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-3 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Eliminar perro
          </button>
        ) : (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-300">
                  ¿Eliminar a {name}?
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                  Se borrarán todos sus datos: paseos, vacunas, comidas, historial médico y fotos. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 text-white px-3 py-2 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Sí, eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

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
