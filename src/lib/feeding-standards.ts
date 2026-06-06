/**
 * Motor de estándares nutricionales caninos.
 * Basado en las 5 categorías de tamaño de la FCI y guías veterinarias estándar.
 */

export type BreedSize = "miniatura" | "pequena" | "mediana" | "grande" | "gigante";
export type LifeStage = "cachorro" | "adolescente" | "adulto";
export type DietType = "barf" | "croquetas";
export type ActivityLevel = "sedentario" | "moderado" | "activo" | "atletico";

export interface SizeCategory {
  size: BreedSize;
  label: string;
  peso_adulto_min: number;
  peso_adulto_max: number;
  madurez_meses: number;
}

export interface FeedingDefaults {
  diet_type: DietType;
  feeding_pct: number;
  daily_grams: number;
  daily_cups?: number;
  meal_frequency: number;
  activity_level: ActivityLevel;
  life_stage: LifeStage;
  size_category: SizeCategory;
  barf_split: { meat_pct: number; bone_pct: number; organ_pct: number; veggie_pct: number };
}

/* ═══════════════════════════════════════════════════════════════ */
/* 1. CATEGORÍAS DE TAMAÑO Y DESARROLLO ÓSEO                       */
/* ═══════════════════════════════════════════════════════════════ */

export const SIZE_CATEGORIES: SizeCategory[] = [
  { size: "miniatura", label: "Miniatura / Toy", peso_adulto_min: 0, peso_adulto_max: 5, madurez_meses: 10 },
  { size: "pequena",   label: "Pequeña",         peso_adulto_min: 5, peso_adulto_max: 10, madurez_meses: 12 },
  { size: "mediana",   label: "Mediana",         peso_adulto_min: 10, peso_adulto_max: 25, madurez_meses: 14 },
  { size: "grande",    label: "Grande",          peso_adulto_min: 25, peso_adulto_max: 45, madurez_meses: 18 },
  { size: "gigante",   label: "Gigante",         peso_adulto_min: 45, peso_adulto_max: Infinity, madurez_meses: 24 },
];

/* ═══════════════════════════════════════════════════════════════ */
/* 2. MAPA DE RAZAS → TAMAÑO (corregido con datos FCI/veterinarios) */
/* ═══════════════════════════════════════════════════════════════ */

const RAZA_TO_SIZE: Record<string, BreedSize> = {
  /* Miniatura */
  chihuahua: "miniatura", "yorkshire terrier": "miniatura", "pinscher miniatura": "miniatura",
  affenpinscher: "miniatura", "bichón frisé": "miniatura", maltés: "miniatura",
  pekinés: "miniatura", pomerania: "miniatura", "shih tzu": "miniatura",
  papillón: "miniatura", "grifón de bruselas": "miniatura", "crestado chino": "miniatura",
  "toy fox terrier": "miniatura", caniche: "miniatura", poodle: "miniatura",

  /* Pequeña */
  pug: "pequena", "bulldog francés": "pequena", "boston terrier": "pequena",
  dachshund: "pequena", teckel: "pequena", "jack russell terrier": "pequena",
  "schnauzer miniatura": "pequena", "cavalier king charles": "pequena",
  "west highland terrier": "pequena", "lhasa apso": "pequena",
  corgi: "pequena", beagle: "pequena", basenji: "pequena", schnauzer: "pequena",

  /* Mediana */
  "border collie": "mediana", "cocker spaniel": "mediana", "bulldog inglés": "mediana",
  "basset hound": "mediana", "bull terrier": "mediana", "schnauzer estándar": "mediana",
  "shiba inu": "mediana", whippet: "mediana", "springer spaniel": "mediana",
  "staffordshire bull terrier": "mediana", "american pitbull": "mediana",
  "american staffordshire": "mediana", "chow chow": "mediana", dálmata: "mediana",
  "american bully": "mediana", "pastor australiano": "mediana",
  sharpei: "mediana", ridgeback: "mediana", collie: "mediana",
  "pastor belga": "mediana", "perro crestado": "mediana",

  /* Grande */
  "dogo argentino": "grande", "pastor alemán": "grande", "golden retriever": "grande",
  "labrador retriever": "grande", boxer: "grande", dóberman: "grande", doberman: "grande",
  rottweiler: "grande", "husky siberiano": "grande", husky: "grande",
  "akita inu": "grande", akita: "grande", "braco alemán": "grande",
  "setter irlandés": "grande", "pastor belga malinois": "grande",
  weimaraner: "grande", "pastor blanco suizo": "grande",
  pointer: "grande", "alaskan malamute": "grande", samoyedo: "grande",
  greyhound: "grande",

  /* Gigante */
  "gran danés": "gigante", "mastín napolitano": "gigante", "san bernardo": "gigante",
  terranova: "gigante", "mastín inglés": "gigante", leonberger: "gigante",
  "dogo de burdeos": "gigante", "mastín tibetano": "gigante", "lobero irlandés": "gigante",
  bullmastiff: "gigante", "perro de montaña de los pirineos": "gigante",
  "pastor del cáucaso": "gigante", "boyero de berna": "gigante", mastín: "gigante",
};

/* ═══════════════════════════════════════════════════════════════ */
/* 3. PORCENTAJES DE ALIMENTACIÓN POR ETAPA DE VIDA                */
/* ═══════════════════════════════════════════════════════════════ */

/** BARF: % del peso corporal según etapa de vida */
export const BARF_PCT_BY_STAGE: Record<LifeStage, { min: number; max: number; default: number }> = {
  cachorro:    { min: 6, max: 8, default: 7 },
  adolescente: { min: 4, max: 5, default: 4.5 },
  adulto:      { min: 2, max: 3, default: 2.5 },
};

/**
 * Croquetas: gramos diarios estimados según peso adulto y etapa.
 * Valores basados en tablas de alimentos premium para cachorros de raza grande.
 * Retorna un rango [min, max] en gramos.
 */
export function kibbleGramsRange(
  peso_actual_kg: number,
  lifeStage: LifeStage,
  sizeCategory: SizeCategory,
): { min: number; max: number } {
  // La densidad calórica de croquetas premium es ~350-420 kcal/100g
  // Perros adultos necesitan ~30-40 kcal/kg de peso ideal
  // Cachorros necesitan ~2-3x eso según etapa
  const kcalPerKg: Record<LifeStage, number> = {
    cachorro: 80,
    adolescente: 55,
    adulto: 35,
  };
  const dailyKcal = peso_actual_kg * kcalPerKg[lifeStage];
  const kcalPer100g = 380; // promedio croquetas premium
  const grams = (dailyKcal / kcalPer100g) * 100;
  return { min: Math.round(grams * 0.85), max: Math.round(grams * 1.15) };
}

/* ═══════════════════════════════════════════════════════════════ */
/* 4. FRECUENCIA DE COMIDAS POR ETAPA                               */
/* ═══════════════════════════════════════════════════════════════ */

export const MEAL_FREQUENCY: Record<LifeStage, { min: number; max: number; recommended: number }> = {
  cachorro:    { min: 3, max: 4, recommended: 3 },
  adolescente: { min: 2, max: 3, recommended: 3 },
  adulto:      { min: 1, max: 2, recommended: 2 },
};

/* ═══════════════════════════════════════════════════════════════ */
/* 5. MULTIPLICADOR POR ACTIVIDAD                                   */
/* ═══════════════════════════════════════════════════════════════ */

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentario: 0.85,
  moderado: 1.0,
  activo: 1.2,
  atletico: 1.3,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentario: "Sedentario (departamento, poca actividad)",
  moderado: "Moderado (paseos diarios, juego regular)",
  activo: "Activo (ejercicio intenso, trabajo ligero)",
  atletico: "Atlético (deporte, pastoreo, trabajo pesado)",
};

/* ═══════════════════════════════════════════════════════════════ */
/* 6. DISTRIBUCIÓN BARF POR DEFECTO                                 */
/* ═══════════════════════════════════════════════════════════════ */

export const DEFAULT_BARF_SPLIT = {
  meat_pct: 50,
  bone_pct: 20,
  organ_pct: 10,
  veggie_pct: 20,
};

/* ═══════════════════════════════════════════════════════════════ */
/* 7. FUNCIONES DEL MOTOR                                           */
/* ═══════════════════════════════════════════════════════════════ */

export function getSizeCategory(size: BreedSize): SizeCategory {
  return SIZE_CATEGORIES.find((c) => c.size === size) ?? SIZE_CATEGORIES[3]; // default grande
}

export function sugerirTamanoPorRazaEstricta(raza: string): BreedSize | null {
  const key = raza.toLowerCase().trim();
  if (RAZA_TO_SIZE[key]) return RAZA_TO_SIZE[key];
  for (const [breedKey, size] of Object.entries(RAZA_TO_SIZE)) {
    if (key.includes(breedKey) || breedKey.includes(key)) return size;
  }
  return null;
}

export function estimarTamanoPorPesoAdulto(pesoKg: number, edadMeses: number): BreedSize {
  // Estimar peso adulto: cachorros < 12 meses
  let estimado = pesoKg;
  if (edadMeses < 12) {
    // Distintos ratios según el punto de crecimiento
    if (edadMeses <= 4) estimado = pesoKg / 0.35;
    else if (edadMeses <= 6) estimado = pesoKg / 0.50;
    else if (edadMeses <= 9) estimado = pesoKg / 0.65;
    else estimado = pesoKg / 0.80;
  }
  for (const cat of SIZE_CATEGORIES) {
    if (estimado >= cat.peso_adulto_min && estimado < cat.peso_adulto_max) return cat.size;
  }
  return "gigante";
}

export function determinarTamanoYEtapa(
  raza: string,
  pesoKg: number,
  edadMeses: number,
  tamanoGuardado?: string | null,
): { sizeCategory: SizeCategory; lifeStage: LifeStage } {
  // Determinar tamaño
  let sizeKey: BreedSize;
  if (tamanoGuardado && SIZE_CATEGORIES.some((c) => c.size === tamanoGuardado)) {
    sizeKey = tamanoGuardado as BreedSize;
  } else {
    sizeKey = sugerirTamanoPorRazaEstricta(raza) ?? estimarTamanoPorPesoAdulto(pesoKg, edadMeses);
  }
  const sizeCategory = getSizeCategory(sizeKey);

  // Determinar etapa de vida según madurez de la categoría
  const madurez = sizeCategory.madurez_meses;
  let lifeStage: LifeStage;
  if (edadMeses <= madurez * 0.35) {
    lifeStage = "cachorro";
  } else if (edadMeses < madurez) {
    lifeStage = "adolescente";
  } else {
    lifeStage = "adulto";
  }

  return { sizeCategory, lifeStage };
}

export function sugerirActividadPorRaza(raza: string): ActivityLevel {
  const baja = /bulldog|mastín|san bernardo|basset|pug|shar pei|chow chow|pekines/i;
  const alta = /border collie|pastor|malinois|husky|labrador|golden|dálmata|weimaraner|pointer|setter|jack russell|whippet|greyhound/i;
  const key = raza.toLowerCase();
  if (alta.test(key)) return "activo";
  if (baja.test(key)) return "sedentario";
  return "moderado";
}

/**
 * Función principal: calcula todos los defaults de alimentación para un perro.
 */
export function getFeedingDefaults(params: {
  raza: string;
  peso_kg: number;
  edad_meses: number;
  tamano_guardado?: string | null;
  diet_type_override?: DietType;
  activity_override?: ActivityLevel;
}): FeedingDefaults {
  const { sizeCategory, lifeStage } = determinarTamanoYEtapa(
    params.raza, params.peso_kg, params.edad_meses, params.tamano_guardado,
  );

  const barfPct = BARF_PCT_BY_STAGE[lifeStage];
  const dietType: DietType = params.diet_type_override ?? "croquetas";
  const activity: ActivityLevel = params.activity_override ?? sugerirActividadPorRaza(params.raza);
  const mealFreq = MEAL_FREQUENCY[lifeStage];

  let feedingPct: number;
  let dailyGrams: number;
  let dailyCups: number | undefined;

  if (dietType === "barf") {
    feedingPct = barfPct.default;
    dailyGrams = Math.round(params.peso_kg * 1000 * (feedingPct / 100) * ACTIVITY_MULTIPLIER[activity]);
  } else {
    const kibble = kibbleGramsRange(params.peso_kg, lifeStage, sizeCategory);
    dailyGrams = Math.round(((kibble.min + kibble.max) / 2) * ACTIVITY_MULTIPLIER[activity]);
    feedingPct = Math.round((dailyGrams / (params.peso_kg * 1000)) * 100 * 10) / 10;
    dailyCups = Math.round((dailyGrams / 110) * 10) / 10; // ~110g por taza
  }

  return {
    diet_type: dietType,
    feeding_pct: feedingPct,
    daily_grams: dailyGrams,
    daily_cups: dailyCups,
    meal_frequency: mealFreq.recommended,
    activity_level: activity,
    life_stage: lifeStage,
    size_category: sizeCategory,
    barf_split: { ...DEFAULT_BARF_SPLIT },
  };
}

/**
 * Calcula los gramos diarios actualizados usando el motor.
 * Usa el peso del último registro de peso si existe, sino el peso del perfil.
 */
export function calcularRacionDiaria(params: {
  peso_kg: number;
  feeding_pct: number;
  diet_type: DietType;
  activity_level: ActivityLevel;
}): { total_grams: number; total_kcal: number } {
  const multiplier = ACTIVITY_MULTIPLIER[params.activity_level];
  const totalGrams = Math.round(params.peso_kg * 1000 * (params.feeding_pct / 100) * multiplier);

  // kcal estimadas: BARF ~1.5-2.0 kcal/g, croquetas ~3.5-4.0 kcal/g
  const kcalPerGram = params.diet_type === "croquetas" ? 3.8 : 1.8;
  const totalKcal = Math.round(totalGrams * kcalPerGram);

  return { total_grams: totalGrams, total_kcal: totalKcal };
}

/**
 * Devuelve slots de comida sugeridos según frecuencia y etapa.
 */
export function sugerirMealSlots(lifeStage: LifeStage): { label: string; time: string }[] {
  const freq = MEAL_FREQUENCY[lifeStage];
  if (freq.recommended === 4) {
    return [
      { label: "Desayuno", time: "07:00" },
      { label: "Almuerzo", time: "12:00" },
      { label: "Merienda", time: "17:00" },
      { label: "Cena", time: "21:00" },
    ];
  }
  if (freq.recommended === 3) {
    return [
      { label: "Desayuno", time: "08:00" },
      { label: "Almuerzo", time: "13:00" },
      { label: "Cena", time: "19:00" },
    ];
  }
  // 2 comidas (adulto)
  return [
    { label: "Mañana", time: "08:00" },
    { label: "Tarde/Noche", time: "19:00" },
  ];
}
