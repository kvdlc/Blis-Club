"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sugerirTamanoPorRaza, BREED_SIZE_LABELS } from "@/lib/breed-sizes";
import {
  getFeedingDefaults, ACTIVITY_LABELS, MEAL_FREQUENCY,
  sugerirMealSlots, calcularRacionDiaria, calcularRacionMixta,
  BARF_PCT_BY_STAGE, CROQUETAS_PCT_BY_STAGE, MIXTA_AJUSTE_RANGE,
} from "@/lib/feeding-standards";
import type { ActivityLevel, DietType, LifeStage } from "@/lib/feeding-standards";
import {
  ArrowLeft, PawPrint, Check, PenLine, Search, ChevronDown, Camera, Loader2,
  ChevronRight, UtensilsCrossed, Clock, Flame, Target, Bone, Beef, Info,
} from "lucide-react";
import { DatePicker } from "@/components/DatePicker";
import { uploadPhotoFromDataUrl } from "@/lib/storage";
import { ImageEditor } from "@/components/ImageEditor";
import { getTodayLocal } from "@/lib/dates";

interface Props {
  userId: string;
}

const BREEDS = [
  "Affenpinscher", "Afgano", "Akita", "Alaskan Malamute", "American Bully", "American Pitbull", "American Staffordshire",
  "Basenji", "Basset Hound", "Beagle", "Border Collie", "Boston Terrier", "Boxer", "Bulldog Francés", "Bulldog Inglés",
  "Caniche", "Cavalier King Charles", "Chihuahua", "Chow Chow", "Cocker Spaniel", "Collie", "Corgi",
  "Dálmata", "Doberman", "Dogo Argentino", "Dogo de Burdeos", "Golden Retriever", "Gran Danés", "Husky Siberiano",
  "Jack Russell Terrier", "Labrador Retriever", "Lhasa Apso", "Maltés", "Mestizo", "Pastor Alemán", "Pastor Australiano", "Pastor Belga",
  "Pinscher Miniatura", "Pomerania", "Poodle", "Pug", "Rottweiler", "Schnauzer", "Shar Pei", "Shiba Inu", "Shih Tzu",
  "Weimaraner", "Yorkshire Terrier", "Criollo / Mestizo"
].sort();

export function NewDogClient({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);

  // Step 1: Datos básicos
  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [breedSearch, setBreedSearch] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);
  const [birthDate, setBirthDate] = useState(() => getTodayLocal());
  const [weightDisplay, setWeightDisplay] = useState("10");
  const [tamano, setTamano] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState("");

  // Step 2: Configuración de alimentación
  const [activity, setActivity] = useState<ActivityLevel>("moderado");
  const [dietType, setDietType] = useState<DietType>("croquetas");
  const [mealFreq, setMealFreq] = useState(3);
  const [mealSlots, setMealSlots] = useState<{ label: string; time: string }[]>([]);

  // Step 3: Porcentajes
  const [lifeStage, setLifeStage] = useState<LifeStage>("cachorro");
  const [feedingPct, setFeedingPct] = useState(2.5);
  const [barfPct, setBarfPct] = useState(0);
  const [croquetasPct, setCroquetasPct] = useState(2.5);
  const [mixtaBarfProp, setMixtaBarfProp] = useState(50); // proporción BARF en dieta mixta (0-100)

  // Computed
  const [dailyGrams, setDailyGrams] = useState(0);
  const [dailyKcal, setDailyKcal] = useState(0);
  const [barfGrams, setBarfGrams] = useState(0);
  const [croquetasGrams, setCroquetasGrams] = useState(0);

  // Info modal
  const [infoModal, setInfoModal] = useState<{ open: boolean; title: string; icon: string; body: string; example: string }>({ open: false, title: "", icon: "💡", body: "", example: "" });

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

  const computeRacion = () => {
    const pesoKg = getWeight();
    if (dietType === "mixta") {
      const ajusteGlobal = feedingPct / 100;
      const { BARF_PCT_BY_STAGE, CROQUETAS_PCT_BY_STAGE, ACTIVITY_MULTIPLIER } = require("@/lib/feeding-standards");
      // ... no, can't use require in client component
      // I'll compute pcts manually
      const result = calcularRacionMixta({
        peso_kg: pesoKg,
        life_stage: lifeStage,
        proporcion_barf: mixtaBarfProp,
        activity_level: activity,
        ajuste_global: ajusteGlobal,
      });
      setBarfGrams(result.barf_grams);
      setCroquetasGrams(result.croquetas_grams);
      setDailyGrams(result.barf_grams + result.croquetas_grams);
      setDailyKcal(result.total_kcal);
    } else {
      const racion = calcularRacionDiaria({
        peso_kg: pesoKg, feeding_pct: feedingPct,
        diet_type: dietType, activity_level: activity,
      });
      setDailyGrams(racion.total_grams);
      setDailyKcal(racion.total_kcal);
      if (dietType === "barf") { setBarfPct(feedingPct); setCroquetasPct(0); }
      else { setBarfPct(0); setCroquetasPct(feedingPct); }
      setBarfGrams(dietType === "barf" ? racion.total_grams : 0);
      setCroquetasGrams(dietType === "croquetas" ? racion.total_grams : 0);
    }
  };

  const goToStep2 = () => {
    if (!name || !breed) return;
    try {
      const edadMeses = getAgeMonths(birthDate);
      const defaults = getFeedingDefaults({
        raza: breed, peso_kg: getWeight(), edad_meses: edadMeses,
        tamano_guardado: tamano || null,
      });
      setActivity(defaults.activity_level);
      setDietType(defaults.diet_type);
      setMealFreq(defaults.meal_frequency);
      setMealSlots(sugerirMealSlots(defaults.life_stage));
      setLifeStage(defaults.life_stage);
      setStep(2);
    } catch (err) {
      console.error("Error al calcular defaults:", err);
      setActivity("moderado");
      setDietType("croquetas");
      setMealFreq(3);
      setMealSlots(sugerirMealSlots("adulto"));
      setLifeStage("adulto");
      setStep(2);
    }
  };

  const goToStep3 = () => {
    try {
      const edadMeses = getAgeMonths(birthDate);
      const defaults = getFeedingDefaults({
        raza: breed, peso_kg: getWeight(), edad_meses: edadMeses,
        tamano_guardado: tamano || null, diet_type_override: dietType,
        activity_override: activity,
      });
      // Para mixta, el ajuste global empieza en 100% (estándar). Para BARF/croquetas, usa el % recomendado.
      setFeedingPct(dietType === "mixta" ? 100 : defaults.feeding_pct);
      setMixtaBarfProp(50);
      setLifeStage(defaults.life_stage);
      computeRacion();
      setStep(3);
    } catch (err) {
      console.error("Error al calcular porcentajes:", err);
      setFeedingPct(2.5);
      setStep(3);
    }
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

      if (dogError || !newDog) {
        console.error("Error al crear perro:", dogError);
        return;
      }
      const dogId = (newDog as { id: string }).id;

      const mpPayload: any = {
        dog_id: dogId, activity_level: activity,
        feeding_pct: feedingPct, diet_type: dietType,
      };
      if (dietType === "mixta") {
        mpPayload.feeding_pct = feedingPct;
      }

      const { error: mpError } = await supabase.from("dog_metabolic_profiles").insert(mpPayload);
      if (mpError) {
        console.warn("diet_type puede no existir, reintentando sin ella:", mpError.message);
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
        fecha: getTodayLocal(), notas: "Peso inicial al registro",
      });

      router.push(`/guau/app/perfil/perro/${dogId}/editar`);
    } catch (err) {
      console.error("Error al crear perro:", err);
    }
  };

  useEffect(() => {
    computeRacion();
  }, [feedingPct, dietType, activity, mixtaBarfProp, weightDisplay]);

  const canProceedStep1 = name.trim().length > 0 && breed.trim().length > 0;
  const pctRange = dietType === "barf" ? BARF_PCT_BY_STAGE[lifeStage] :
    dietType === "croquetas" ? CROQUETAS_PCT_BY_STAGE[lifeStage] :
    null; // mixta usa ajuste global

  return (
    <div className="space-y-4 pb-8">
      {/* Header con indicador de pasos */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => step === 1 ? router.back() : setStep(step - 1)}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {step === 1 ? "Nuevo Perro" : step === 2 ? "Alimentación" : "Ración Diaria"}
        </h1>
        <div className="ml-auto flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${
              s === step ? "bg-primary-500" : s < step ? "bg-secondary-400" : "bg-zinc-300 dark:bg-zinc-700"
            }`} />
          ))}
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
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" placeholder="Rex" />
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
              <p className="text-[10px] text-zinc-400 mt-0.5">{getAgeMonths(birthDate)} meses</p>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Peso actual (kg)</label>
              <input type="text" inputMode="decimal" value={weightDisplay}
                onChange={(e) => setWeightDisplay(e.target.value)}
                placeholder="10,5"
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Tamaño</label>
              <select value={tamano} onChange={(e) => setTamano(e.target.value)}
                className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-2 text-xs">
                <option value="">Auto</option>
                {Object.entries(BREED_SIZE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <button onClick={goToStep2} disabled={!canProceedStep1}
            className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${!canProceedStep1 ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"}`}>
            Siguiente: Configurar Alimentación <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 2: CONFIGURACIÓN DE ALIMENTACIÓN                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          {/* Resumen del perro */}
          <div className="card-soft rounded-[1.25rem] p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950/20 dark:to-secondary-950/20 border border-primary-100 dark:border-primary-900/30">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{name}</p>
            <p className="text-xs text-zinc-500">{breed} · {getAgeMonths(birthDate)} meses · {getWeight()} kg</p>
          </div>

          {/* Actividad */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Nivel de actividad</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 text-sm">
              {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Tipo de dieta */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-xs text-zinc-500">Tipo de alimentación</label>
              <button
                onClick={() => setInfoModal({
                  open: true, icon: "🍽️",
                  title: "Tipos de alimentación",
                  example: "Elegí según tu estilo de vida y el de tu perro",
                  body: "🦴  Croquetas\nAlimento seco y procesado. Muy práctico: solo servís y listo. No necesita refrigeración y dura meses. Es concentrado (poca agua), por eso tu perro come menos gramos. Ideal si tenés poco tiempo.\n\n🥩  Natural / BARF\nComida cruda biológicamente apropiada: carne, huesos carnosos, vísceras y vegetales. Tiene ~70% de agua, así que tu perro come más volumen. Ventajas: hidratación natural, nutrientes sin procesar, mejor digestión. Requiere más preparación.\n\n⚖️  Mixta\nCombinás croquetas + comida natural. Podés dar croquetas en la mañana y BARF en la noche, o mezclar en cada comida. Lo mejor de dos mundos: la practicidad de las croquetas con los beneficios de la comida natural."
                })}
                className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "croquetas" as DietType, label: "Croquetas", icon: "🦴" },
                { key: "barf" as DietType, label: "Natural / BARF", icon: "🥩" },
                { key: "mixta" as DietType, label: "Mixta", icon: "⚖️" },
              ].map((opt) => (
                <button key={opt.key} onClick={() => setDietType(opt.key)}
                  className={`rounded-xl p-3 text-xs font-bold transition-all border-2 ${
                    dietType === opt.key
                      ? "bg-primary-50 dark:bg-primary-950/30 border-primary-500 text-primary-700 dark:text-primary-300"
                      : "bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-lg block mb-0.5">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia de comidas */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Comidas al día</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => {
                  setMealFreq(n);
                  const stage = n >= 3 ? "cachorro" : "adulto";
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
          </div>

          {/* Horarios */}
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Horarios de comida</label>
            <div className="space-y-1.5">
              {mealSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <input type="text" value={slot.label}
                    onChange={(e) => { const u = [...mealSlots]; u[i] = { ...u[i], label: e.target.value }; setMealSlots(u); }}
                    className="flex-1 min-w-0 bg-transparent text-sm font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none" />
                  <input type="time" value={slot.time}
                    onChange={(e) => { const u = [...mealSlots]; u[i] = { ...u[i], time: e.target.value }; setMealSlots(u); }}
                    className="bg-zinc-100 dark:bg-zinc-700 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
              ))}
            </div>
          </div>

          <button onClick={goToStep3}
            className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3.5 text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
            Siguiente: Ajustar Porcentajes <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STEP 3: PORCENTAJES DE ALIMENTACIÓN                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <>
          {/* Resumen */}
          <div className="card-soft rounded-[1.25rem] p-4 bg-gradient-to-r from-secondary-50 to-primary-50 dark:from-secondary-950/20 dark:to-primary-950/20 border border-secondary-200 dark:border-secondary-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-secondary-600" />
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Ración diaria estimada</span>
            </div>
            {/* Selector rápido de tipo de dieta */}
            <div className="flex gap-1.5 mb-2">
              {[
                { key: "croquetas" as DietType, label: "🦴 Croquetas" },
                { key: "barf" as DietType, label: "🥩 Natural" },
                { key: "mixta" as DietType, label: "⚖️ Mixta" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setDietType(opt.key);
                    if (opt.key === "mixta") {
                      setFeedingPct(100);
                    } else if (opt.key === "croquetas") {
                      setFeedingPct(CROQUETAS_PCT_BY_STAGE[lifeStage].default);
                    } else {
                      setFeedingPct(BARF_PCT_BY_STAGE[lifeStage].default);
                    }
                  }}
                  className={`text-[10px] px-2 py-1 rounded-lg font-semibold transition-all border ${
                    dietType === opt.key
                      ? "bg-white dark:bg-zinc-800 border-primary-400 text-primary-700 dark:text-primary-300 shadow-sm"
                      : "bg-white/40 dark:bg-zinc-800/40 border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary-700 dark:text-primary-300">{dailyGrams}</span>
              <span className="text-sm text-zinc-500">gramos/día</span>
              <span className="text-sm text-zinc-400">· {dailyKcal} kcal</span>
            </div>
            {dietType === "mixta" && (
              <div className="mt-2 text-xs text-zinc-500 space-y-0.5">
                <p>🦴 Croquetas: {croquetasGrams}g</p>
                <p>🥩 Natural: {barfGrams}g</p>
              </div>
            )}
            {dietType === "croquetas" && (
              <p className="text-xs text-zinc-500 mt-1">≈ {Math.round((dailyGrams / 110) * 10) / 10} tazas/día</p>
            )}
          </div>

          {/* % del peso (solo BARF o croquetas) / Ajuste global (mixta) */}
          <div className="card-soft rounded-[1.25rem] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-zinc-500">
                  {dietType === "mixta" ? "Ajuste de cantidad total" : "% del peso corporal"}
                </label>
                <button
                  onClick={() => setInfoModal({
                    open: true, icon: dietType === "mixta" ? "🎚️" : "📐",
                    title: dietType === "mixta" ? "Ajuste de cantidad total" : "% del peso corporal",
                    example: dietType === "mixta"
                      ? "Ejemplo real: 960g estándar → 70% = 672g → 130% = 1.248g"
                      : "Peso del perro × porcentaje ÷ 100 = gramos diarios",
                    body: dietType === "mixta"
                      ? "El sistema ya calculó la cantidad ideal de comida combinando croquetas y comida natural según el peso, edad y actividad de tu perro.\n\nEste ajuste te permite adaptar esa ración a la vida real:\n\n🏠  Si tu perro es casero y no hace mucho ejercicio, bajalo a 80-90% para evitar sobrepeso.\n🐕  Si es un perro normal con paseos diarios, deja el 100%.\n🏃  Si es muy activo, perro de trabajo o necesita ganar peso, subilo a 110-120%.\n\n📐  Ejemplo práctico:\nSi el sistema calculó 960g/día como ración estándar:\n· 80% = 768g (perro sedentario)\n· 100% = 960g (perro normal)\n· 120% = 1.152g (perro muy activo)"
                      : "Es la forma de calcular cuánta comida necesita tu perro por día.\n\n📐  Fórmula: Peso actual (kg) × 1000 × (porcentaje ÷ 100)\n\n🧮  Ejemplo: 20 kg × 1000 × 3% = 600 g/día\n\n💧  La comida natural (BARF) necesita un % más alto (~7%) porque tiene ~70% de agua.\n🦴  Las croquetas necesitan un % menor (~2.2%) porque son más concentradas (solo ~10% de agua)."
                  })}
                  className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                {dietType === "mixta" ? `${Math.round(feedingPct)}%` : `${Math.round(feedingPct * 10) / 10}%`}
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
                ? `${MIXTA_AJUSTE_RANGE.min}-${MIXTA_AJUSTE_RANGE.max}% = ración estándar ajustable. 100% es la cantidad recomendada.`
                : `Recomendado para ${lifeStage === "cachorro" ? "cachorros" : lifeStage === "adolescente" ? "adolescentes" : "adultos"} con ${dietType === "barf" ? "dieta natural" : "croquetas"}: ${pctRange?.min}-${pctRange?.max}%`
              }
            </p>
          </div>

          {/* Mixta: proporción BARF vs Croquetas */}
          {dietType === "mixta" && (
            <div className="card-soft rounded-[1.25rem] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs text-zinc-500">Proporción Natural (BARF)</label>
                  <button
                    onClick={() => setInfoModal({
                      open: true, icon: "🥩",
                      title: "¿Qué es la dieta Natural (BARF)?",
                      example: "Comida cruda biológicamente apropiada para perros",
                      body: "BARF = Biologically Appropriate Raw Food\n\nIncluye:\n🥩  Carne cruda magra (res, pollo, pavo, cerdo)\n🦴  Huesos carnosos blandos (cuellos, alas, carcasas)\n🫀  Vísceras (hígado, riñón, bazo)\n🥬  Vegetales y frutas trituradas\n\nVentajas:\n💧  Más hidratación natural (~70% agua)\n🧬  Nutrientes sin procesar\n🦷  Mejor salud dental\n🐕  Mejor digestión y menos alergias\n\nImportante: como tiene mucha agua, tu perro necesita comer MÁS gramos que con croquetas para obtener la misma energía. Por eso el % es más alto (6-8% del peso)."
                    })}
                    className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {/* Porcentajes explícitos */}
              <div className="flex items-center justify-between text-sm font-bold">
                <span className="text-primary-600 dark:text-primary-400">🦴 Croquetas {100 - mixtaBarfProp}%</span>
                <span className="text-accent-600 dark:text-accent-400">{mixtaBarfProp}% Natural 🥩</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={mixtaBarfProp}
                onChange={(e) => setMixtaBarfProp(Number(e.target.value))}
                className="w-full accent-zinc-400" />
              {mixtaBarfProp > 0 && mixtaBarfProp < 100 && (
                <p className="text-[10px] text-zinc-500 text-center pt-1">
                  🦴 {croquetasGrams}g croquetas + 🥩 {barfGrams}g natural
                </p>
              )}
            </div>
          )}

          {/* Distribución BARF (solo si BARF o mixta con BARF > 0) */}
          {(dietType === "barf" || (dietType === "mixta" && mixtaBarfProp > 0)) && (
            <div className="card-soft rounded-[1.25rem] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Beef className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Distribución Natural</span>
                <button
                  onClick={() => setInfoModal({
                    open: true, icon: "🍖",
                    title: "¿Cómo se compone un plato BARF?",
                    example: "Proporciones ideales para un plato balanceado",
                    body: "Un plato de comida natural balanceado se divide así:\n\n🔴  50% Carne magra\nMúsculo de res, pollo, pavo, cerdo o pescado. Es la base principal de proteína.\n\n🟠  20% Huesos carnosos blandos\nCuellos de pollo, alas, carcasas de pavo. NUNCA huesos cocidos (se astillan).\n\n🟣  10% Vísceras\n5% hígado (obligatorio) + 5% otras vísceras como riñón, bazo o corazón.\n\n🟢  20% Vegetales y frutas\nZanahoria, calabaza, espinaca, manzana (sin semillas), arándanos. Siempre triturados para que el perro los digiera.\n\n⚠️  Consultá con tu veterinario antes de cambiar la dieta de tu perro."
                  })}
                  className="w-4 h-4 rounded-full bg-accent-500/20 text-accent-600 flex items-center justify-center hover:bg-accent-500/30 transition-colors"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>
              {[
                { label: "Carne", pct: 50, color: "bg-red-500" },
                { label: "Hueso carnoso", pct: 20, color: "bg-orange-500" },
                { label: "Vísceras", pct: 10, color: "bg-purple-500" },
                { label: "Vegetales", pct: 20, color: "bg-green-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1">{item.label}</span>
                  <span className="text-xs font-mono text-zinc-500">{item.pct}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Info etapa de vida */}
          <div className="text-center">
            <p className="text-[10px] text-zinc-400">
              {lifeStage === "cachorro" ? "Cachorro" : lifeStage === "adolescente" ? "Adolescente" : "Adulto"} · {BREED_SIZE_LABELS[tamano] ?? tamano ?? "Tamaño auto-detectado"}
            </p>
          </div>

          <button onClick={handleCreate}
            className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3.5 text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
            <PawPrint className="w-4 h-4" /> Crear Perro
          </button>
        </>
      )}

      {/* ═══ INFO MODAL ═══ */}
      {infoModal.open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInfoModal({ ...infoModal, open: false })} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-[2rem] sm:rounded-[1.5rem] px-5 pt-6 pb-8 max-w-md w-full shadow-2xl border border-zinc-100 dark:border-zinc-800 space-y-4 overflow-hidden animate-slide-up">
            {/* Fondo decorativo */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-accent-100/40 dark:from-accent-950/30 to-transparent pointer-events-none" />
            {/* Header */}
            <div className="relative flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent-100 dark:bg-accent-950/50 flex items-center justify-center text-2xl shrink-0">
                {infoModal.icon}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{infoModal.title}</h3>
                {infoModal.example && (
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{infoModal.example}</p>
                )}
              </div>
            </div>
            {/* Cuerpo */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">{infoModal.body}</p>
            {/* Botón */}
            <button
              onClick={() => setInfoModal({ ...infoModal, open: false })}
              className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-sm font-bold transition-all active:scale-[0.98]"
            >
              ¡Entendido!
            </button>
          </div>
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
