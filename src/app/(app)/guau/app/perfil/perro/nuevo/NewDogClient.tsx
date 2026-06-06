"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sugerirTamanoPorRaza, BREED_SIZE_LABELS } from "@/lib/breed-sizes";
import {
  getFeedingDefaults, ACTIVITY_LABELS, MEAL_FREQUENCY,
  sugerirMealSlots, calcularRacionDiaria,
} from "@/lib/feeding-standards";
import type { ActivityLevel, DietType, LifeStage } from "@/lib/feeding-standards";
import { ArrowLeft, PawPrint, Check, PenLine, Search, ChevronDown, Camera, Loader2, ChevronRight, UtensilsCrossed, Clock, Flame, Target } from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { uploadPhotoFromDataUrl } from "@/lib/storage";
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

  const [step, setStep] = useState(1);

  // Step 1 fields
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [breedSearch, setBreedSearch] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);
  const [birthDate, setBirthDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weightDisplay, setWeightDisplay] = useState("10");
  const [tamano, setTamano] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");

  // Step 2 fields (feeding config)
  const [dietType, setDietType] = useState<DietType>("croquetas");
  const [activity, setActivity] = useState<ActivityLevel>("moderado");
  const [feedingPct, setFeedingPct] = useState(2.5);
  const [mealFreq, setMealFreq] = useState(3);
  const [lifeStage, setLifeStage] = useState<LifeStage>("cachorro");
  const [mealSlots, setMealSlots] = useState<{ label: string; time: string }[]>([]);
  const [dailyGrams, setDailyGrams] = useState(0);
  const [dailyKcal, setDailyKcal] = useState(0);

  // Auto-detect size from breed
  useEffect(() => {
    if (breed && !tamano) {
      const suggested = sugerirTamanoPorRaza(breed);
      if (suggested) setTamano(suggested);
    }
  }, [breed]);

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

  const goToStep2 = () => {
    if (!name || !breed) return;
    try {
      const edadMeses = getAgeMonths(birthDate);
      const pesoKg = getWeight();

      const defaults = getFeedingDefaults({
        raza: breed,
        peso_kg: pesoKg,
        edad_meses: edadMeses,
        tamano_guardado: tamano || null,
      });

      setDietType(defaults.diet_type);
      setActivity(defaults.activity_level);
      setFeedingPct(defaults.feeding_pct);
      setMealFreq(defaults.meal_frequency);
      setLifeStage(defaults.life_stage);
      setDailyGrams(defaults.daily_grams);
      setDailyKcal(Math.round(defaults.daily_grams * (defaults.diet_type === "croquetas" ? 3.8 : 1.8)));
      setMealSlots(sugerirMealSlots(defaults.life_stage));
      setStep(2);
    } catch (err) {
      console.error("Error al calcular defaults:", err);
      // Fallback: ir al paso 2 con valores por defecto
      setDietType("croquetas");
      setActivity("moderado");
      setFeedingPct(2.5);
      setMealFreq(3);
      setLifeStage("adulto");
      setDailyGrams(Math.round(getWeight() * 1000 * 0.025));
      setDailyKcal(Math.round(getWeight() * 1000 * 0.025 * 3.8));
      setMealSlots(sugerirMealSlots("adulto"));
      setStep(2);
    }
  };

  const createWithDefaults = async () => {
    if (!name || !breed) return;
    try {
      const edadMeses = getAgeMonths(birthDate);
      const pesoKg = getWeight();

      const defaults = getFeedingDefaults({
        raza: breed,
        peso_kg: pesoKg,
        edad_meses: edadMeses,
        tamano_guardado: tamano || null,
      });

      const { data: newDog, error: dogError } = await supabase.from("dogs").insert({
        owner_id: userId, nombre: name, raza: breed, edad_meses: edadMeses,
        fecha_nacimiento: birthDate, tamano: tamano || null,
        peso_kg: pesoKg, foto_url: photo || "/icons/dog-default.png",
      }).select("id").single();

      if (dogError || !newDog) {
        console.error("Error al crear perro:", dogError);
        return;
      }
      const dogId = (newDog as { id: string }).id;

      const { error: mpError } = await supabase.from("dog_metabolic_profiles").insert({
        dog_id: dogId, activity_level: defaults.activity_level,
        feeding_pct: defaults.feeding_pct, diet_type: defaults.diet_type,
      });
      if (mpError) {
        console.warn("diet_type may not exist yet, retrying without:", mpError.message);
        await supabase.from("dog_metabolic_profiles").insert({
          dog_id: dogId, activity_level: defaults.activity_level,
          feeding_pct: defaults.feeding_pct,
        });
      }

      const slots = sugerirMealSlots(defaults.life_stage);
      for (let i = 0; i < slots.length; i++) {
        await supabase.from("dog_meal_slots").insert({
          dog_id: dogId, slot_index: i,
          label: slots[i].label, time_of_day: `${slots[i].time}:00`, active: true,
        });
      }
      await supabase.from("dog_weight_history").insert({
        dog_id: dogId, peso_kg: pesoKg,
        fecha: new Date().toISOString().slice(0, 10), notas: "Peso inicial al registro",
      });
      router.push(`/guau/app/perfil/perro/${dogId}/editar`);
    } catch (err) {
      console.error("Error al crear perro:", err);
    }
  };

  const recalcGrams = (pct: number, act: ActivityLevel, dt: DietType) => {
    const result = calcularRacionDiaria({
      peso_kg: getWeight(),
      feeding_pct: pct,
      diet_type: dt,
      activity_level: act,
    });
    setDailyGrams(result.total_grams);
    setDailyKcal(result.total_kcal);
  };

  const handleCreate = async () => {
    if (!name || !breed) return;
    try {
      const edadMeses = getAgeMonths(birthDate);
      const pesoKg = getWeight();

      const { data: newDog, error: dogError } = await supabase.from("dogs").insert({
        owner_id: userId, nombre: name, raza: breed, edad_meses: edadMeses,
        fecha_nacimiento: birthDate, tamano: tamano || null,
        peso_kg: pesoKg, foto_url: photo || "/icons/dog-default.png",
      }).select("id").single();

      if (dogError) {
        console.error("Error al crear perro:", dogError);
        return;
      }
      if (!newDog) return;

      const dogId = (newDog as { id: string }).id;

      // Insert metabolic profile — fallback sin diet_type si la columna no existe
      const { error: mpError } = await supabase.from("dog_metabolic_profiles").insert({
        dog_id: dogId, activity_level: activity, feeding_pct: feedingPct, diet_type: dietType,
      });
      if (mpError) {
        console.warn("diet_type may not exist yet, retrying without:", mpError.message);
        await supabase.from("dog_metabolic_profiles").insert({
          dog_id: dogId, activity_level: activity, feeding_pct: feedingPct,
        });
      }

      for (let i = 0; i < mealSlots.length; i++) {
        await supabase.from("dog_meal_slots").insert({
          dog_id: dogId, slot_index: i,
          label: mealSlots[i].label, time_of_day: `${mealSlots[i].time}:00`, active: true,
        });
      }

      await supabase.from("dog_weight_history").insert({
        dog_id: dogId, peso_kg: pesoKg,
        fecha: new Date().toISOString().slice(0, 10), notas: "Peso inicial al registro",
      });

      router.push(`/guau/app/perfil/perro/${dogId}/editar`);
    } catch (err) {
      console.error("Error al crear perro:", err);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => step === 2 ? setStep(1) : router.back()} className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {step === 1 ? "Nuevo Perro" : "Plan de Alimentación"}
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${step === 1 ? "bg-primary-500" : "bg-secondary-400"}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${step === 2 ? "bg-primary-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 1: DATOS BÁSICOS                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
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

          {/* Birth date + Weight + Tamaño */}
          <div className="grid grid-cols-3 gap-2">
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
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Tamaño de raza</label>
              <select value={tamano} onChange={(e) => setTamano(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-2 text-xs">
                <option value="">Auto</option>
                {Object.entries(BREED_SIZE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Step 1 buttons */}
          <div className="space-y-2">
            <button onClick={createWithDefaults} disabled={!name || !breed}
              className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${!name || !breed ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"}`}>
              <PawPrint className="w-4 h-4" /> Crear Perro
            </button>
            <button onClick={goToStep2} disabled={!name || !breed}
              className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${!name || !breed ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-white dark:bg-zinc-800 border-2 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30"}`}>
              <UtensilsCrossed className="w-4 h-4" /> Personalizar Alimentación <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 2: PLAN DE ALIMENTACIÓN                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          {/* Resumen visual */}
          <div className="card-soft rounded-[1.5rem] p-5 space-y-3 bg-gradient-to-br from-primary-50/60 to-secondary-50/40 dark:from-primary-950/30 dark:to-secondary-950/20 border border-primary-100 dark:border-primary-900/30">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary-600" />
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Plan para {name || "tu perro"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 dark:bg-zinc-800/80 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500 mb-0.5">Etapa de vida</p>
                <p className="text-sm font-bold text-primary-700 dark:text-primary-300 capitalize">
                  {lifeStage === "cachorro" ? "Cachorro" : lifeStage === "adolescente" ? "Adolescente" : "Adulto"}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {breed} · {getAgeMonths(birthDate)} meses · {getWeight()} kg
                </p>
              </div>
              <div className="bg-white/80 dark:bg-zinc-800/80 rounded-xl p-3 text-center">
                <p className="text-[10px] text-zinc-500 mb-0.5">Tamaño de raza</p>
                <p className="text-sm font-bold text-secondary-700 dark:text-secondary-300">
                  {BREED_SIZE_LABELS[tamano] ?? tamano ?? "Auto-detectado"}
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de dieta */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Tipo de alimentación</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setDietType("croquetas"); recalcGrams(feedingPct, activity, "croquetas"); }}
                className={`rounded-xl p-3 text-sm font-semibold transition-all border-2 ${
                  dietType === "croquetas"
                    ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-700 dark:text-primary-300"
                    : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span className="text-lg block mb-0.5">🦴</span>
                Croquetas / Pienso
              </button>
              <button
                onClick={() => { setDietType("barf"); recalcGrams(feedingPct, activity, "barf"); }}
                className={`rounded-xl p-3 text-sm font-semibold transition-all border-2 ${
                  dietType === "barf"
                    ? "bg-accent-50 dark:bg-accent-950/30 border-accent-500 text-accent-700 dark:text-accent-300"
                    : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span className="text-lg block mb-0.5">🥩</span>
                Dieta BARF / Natural
              </button>
            </div>
          </div>

          {/* Nivel de actividad */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Nivel de actividad</label>
            <select value={activity} onChange={(e) => { const v = e.target.value as ActivityLevel; setActivity(v); recalcGrams(feedingPct, v, dietType); }}
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm">
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* % alimentación */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">% de alimentación diaria</label>
            <div className="flex items-center gap-3">
              <input type="range"
                min={dietType === "barf" ? 1.5 : 1}
                max={dietType === "barf" ? 8 : 5}
                step={0.1}
                value={feedingPct}
                onChange={(e) => { const v = Number(e.target.value); setFeedingPct(v); recalcGrams(v, activity, dietType); }}
                className="flex-1 accent-primary-600" />
              <span className="text-sm font-mono font-bold w-12 text-right">{feedingPct}%</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {dietType === "barf"
                ? `Recomendado para ${lifeStage === "cachorro" ? "cachorros" : lifeStage === "adolescente" ? "adolescentes" : "adultos"}: cachorro 6-8%, adolescente 4-5%, adulto 2-3%`
                : "En croquetas, el % es menor porque el alimento es más denso calóricamente"}
            </p>
          </div>

          {/* Resultado */}
          <div className="card-soft rounded-[1.25rem] p-4 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-950/20 dark:to-primary-950/20 border border-secondary-200 dark:border-secondary-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-secondary-600" />
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ración diaria estimada</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-primary-700 dark:text-primary-300">{dailyGrams}</span>
              <span className="text-sm text-zinc-500">gramos/día</span>
              <span className="text-sm text-zinc-400 ml-1">· {dailyKcal} kcal</span>
            </div>
            {dietType === "croquetas" && (
              <p className="text-xs text-zinc-500 mt-1">
                ≈ {Math.round((dailyGrams / 110) * 10) / 10} tazas/día (1 taza ≈ 110g)
              </p>
            )}
          </div>

          {/* Frecuencia de comidas */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Frecuencia de comidas diarias</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n}
                  onClick={() => {
                    setMealFreq(n);
                    const stage = n >= 3 ? "cachorro" : n === 2 ? "adulto" : "adulto";
                    setMealSlots(sugerirMealSlots(stage as LifeStage).slice(0, n));
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all border-2 ${
                    mealFreq === n
                      ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-700 dark:text-primary-300"
                      : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {n} {n === 1 ? "vez" : "veces"}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">
              Recomendado: {MEAL_FREQUENCY[lifeStage]?.recommended ?? 3} tomas para {lifeStage === "cachorro" ? "cachorros" : lifeStage === "adolescente" ? "adolescentes" : "adultos"}
              {lifeStage === "cachorro" && " (previene torsión gástrica en razas de pecho profundo)"}
            </p>
          </div>

          {/* Horarios sugeridos */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Horarios de comida sugeridos</label>
            <div className="space-y-1.5">
              {mealSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={slot.label}
                    onChange={(e) => {
                      const updated = [...mealSlots];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setMealSlots(updated);
                    }}
                    className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
                  />
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => {
                      const updated = [...mealSlots];
                      updated[i] = { ...updated[i], time: e.target.value };
                      setMealSlots(updated);
                    }}
                    className="bg-zinc-100 dark:bg-zinc-700 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-[10px] text-zinc-400">≈ {Math.round(dailyGrams / mealSlots.length)}g</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Puedes editarlos ahora o después desde el perfil del perro</p>
          </div>

          {/* Create button */}
          <button onClick={handleCreate}
            className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3.5 text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4" /> Crear Perro y Plan de Alimentación
          </button>
        </>
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
