/**
 * Motor de estándares nutricionales caninos.
 * Basado en las 5 categorías de tamaño de la FCI y guías veterinarias estándar.
 */

export type BreedSize = "miniatura" | "pequena" | "mediana" | "grande" | "gigante";
export type LifeStage = "cachorro" | "adolescente" | "adulto";
export type DietType = "barf" | "croquetas" | "mixta";
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
  barf_pct: number;
  croquetas_pct: number;
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
/* 2. PORCENTAJES DE ALIMENTACIÓN POR DIETA Y ETAPA               */
/* ═══════════════════════════════════════════════════════════════ */

/** BARF: % del peso corporal según etapa de vida */
export const BARF_PCT_BY_STAGE: Record<LifeStage, { min: number; max: number; default: number }> = {
  cachorro:    { min: 6, max: 8, default: 7 },
  adolescente: { min: 4, max: 5, default: 4.5 },
  adulto:      { min: 2, max: 3, default: 2.5 },
};

/** Croquetas: % del peso corporal según etapa de vida.
 *  Las croquetas son ~3x más densas en calorías que BARF,
 *  por eso el % es mucho menor. Basado en tablas reales de fabricantes.
 */
export const CROQUETAS_PCT_BY_STAGE: Record<LifeStage, { min: number; max: number; default: number }> = {
  cachorro:    { min: 2, max: 2.5, default: 2.2 },
  adolescente: { min: 1.8, max: 2.2, default: 2 },
  adulto:      { min: 1.5, max: 2, default: 1.8 },
};

/** Mixta: % de ajuste global (70%-130%). 100% = ración estándar mixta. */
export const MIXTA_AJUSTE_RANGE = { min: 70, max: 130, default: 100 };

/* ═══════════════════════════════════════════════════════════════ */
/* 3. FRECUENCIA DE COMIDAS POR ETAPA                              */
/* ═══════════════════════════════════════════════════════════════ */

export const MEAL_FREQUENCY: Record<LifeStage, { min: number; max: number; recommended: number }> = {
  cachorro:    { min: 3, max: 4, recommended: 3 },
  adolescente: { min: 2, max: 3, recommended: 3 },
  adulto:      { min: 1, max: 2, recommended: 2 },
};

/* ═══════════════════════════════════════════════════════════════ */
/* 4. MULTIPLICADOR POR ACTIVIDAD                                 */
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
/* 5. DISTRIBUCIÓN BARF POR DEFECTO                               */
/* ═══════════════════════════════════════════════════════════════ */

export const DEFAULT_BARF_SPLIT = {
  meat_pct: 50,
  bone_pct: 20,
  organ_pct: 10,
  veggie_pct: 20,
};

/* ═══════════════════════════════════════════════════════════════ */
/* 6. FUNCIONES DEL MOTOR                                          */
/* ═══════════════════════════════════════════════════════════════ */

export function getSizeCategory(size: BreedSize): SizeCategory {
  return SIZE_CATEGORIES.find((c) => c.size === size) ?? SIZE_CATEGORIES[3]; // default grande
}

export function determinarTamanoYEtapa(
  raza: string,
  pesoKg: number,
  edadMeses: number,
  tamanoGuardado?: string | null,
): { sizeCategory: SizeCategory; lifeStage: LifeStage } {
  // Usar sugerirTamanoPorRaza del módulo breed-sizes cuando sea posible
  // Aquí usamos estimación por peso como fallback
  let sizeKey: BreedSize;
  if (tamanoGuardado && SIZE_CATEGORIES.some((c) => c.size === tamanoGuardado)) {
    sizeKey = tamanoGuardado as BreedSize;
  } else {
    sizeKey = estimarTamanoPorPesoAdulto(pesoKg, edadMeses);
  }
  const sizeCategory = getSizeCategory(sizeKey);

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

export function estimarTamanoPorPesoAdulto(pesoKg: number, edadMeses: number): BreedSize {
  let estimado = pesoKg;
  if (edadMeses < 12) {
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

  const dietType: DietType = params.diet_type_override ?? "croquetas";
  const activity: ActivityLevel = params.activity_override ?? sugerirActividadPorRaza(params.raza);
  const mealFreq = MEAL_FREQUENCY[lifeStage];
  const multiplier = ACTIVITY_MULTIPLIER[activity];

  let feedingPct: number;
  let barfPct: number;
  let croquetasPct: number;
  let dailyGrams: number;
  let dailyCups: number | undefined;

  if (dietType === "barf") {
    const barfPctInfo = BARF_PCT_BY_STAGE[lifeStage];
    feedingPct = barfPctInfo.default;
    barfPct = feedingPct;
    croquetasPct = 0;
    dailyGrams = Math.round(params.peso_kg * 1000 * (feedingPct / 100) * multiplier);
  } else if (dietType === "croquetas") {
    const croqPctInfo = CROQUETAS_PCT_BY_STAGE[lifeStage];
    feedingPct = croqPctInfo.default;
    barfPct = 0;
    croquetasPct = feedingPct;
    dailyGrams = Math.round(params.peso_kg * 1000 * (feedingPct / 100) * multiplier);
    dailyCups = Math.round((dailyGrams / 110) * 10) / 10; // ~110g por taza
  } else {
    // Mixta: feeding_pct = 100 representa "ajuste global al 100%" (estándar)
    // barf_pct y croquetas_pct son los % del peso corporal estándar para cada tipo
    feedingPct = 100; // ajuste global default 100%
    const barfPctStd = BARF_PCT_BY_STAGE[lifeStage].default;
    const croqPctStd = CROQUETAS_PCT_BY_STAGE[lifeStage].default;
    barfPct = barfPctStd * 0.5; // proporción 50/50 por defecto
    croquetasPct = croqPctStd * 0.5;
    const barfGrams = Math.round(params.peso_kg * 1000 * (barfPct / 100) * multiplier);
    const croqGrams = Math.round(params.peso_kg * 1000 * (croquetasPct / 100) * multiplier);
    dailyGrams = barfGrams + croqGrams;
    dailyCups = Math.round((croqGrams / 110) * 10) / 10;
  }

  return {
    diet_type: dietType,
    feeding_pct: feedingPct,
    barf_pct: barfPct,
    croquetas_pct: croquetasPct,
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

  // kcal estimadas: BARF ~1.8 kcal/g, croquetas ~3.8 kcal/g
  const kcalPerGram = params.diet_type === "croquetas" ? 3.8 : 1.8;
  const totalKcal = Math.round(totalGrams * kcalPerGram);

  return { total_grams: totalGrams, total_kcal: totalKcal };
}

/**
 * Calcula gramos separados para dieta mixta.
 * Lógica correcta: calcula cada dieta al 100% con su % estándar de etapa,
 * luego aplica la proporción elegida por el usuario.
 * El ajuste global (0.7-1.3) permite subir/bajar la ración total.
 */
export function calcularRacionMixta(params: {
  peso_kg: number;
  life_stage: LifeStage;
  proporcion_barf: number; // 0-100
  activity_level: ActivityLevel;
  ajuste_global?: number; // default 1.0 (multiplicador)
}): { barf_grams: number; croquetas_grams: number; total_kcal: number } {
  const multiplier = ACTIVITY_MULTIPLIER[params.activity_level];
  const ajuste = params.ajuste_global ?? 1.0;

  // Gramos si fuera 100% BARF (usando % estándar BARF para la etapa)
  const barfPctStd = BARF_PCT_BY_STAGE[params.life_stage].default;
  const barfGrams100 = params.peso_kg * 1000 * (barfPctStd / 100) * multiplier;

  // Gramos si fuera 100% Croquetas (usando % estándar croquetas para la etapa)
  const croqPctStd = CROQUETAS_PCT_BY_STAGE[params.life_stage].default;
  const croqGrams100 = params.peso_kg * 1000 * (croqPctStd / 100) * multiplier;

  // Aplicar proporción del usuario + ajuste global
  const barfGrams = Math.round(barfGrams100 * (params.proporcion_barf / 100) * ajuste);
  const croqGrams = Math.round(croqGrams100 * ((100 - params.proporcion_barf) / 100) * ajuste);

  const totalKcal = Math.round(barfGrams * 1.8 + croqGrams * 3.8);
  return { barf_grams: barfGrams, croquetas_grams: croqGrams, total_kcal: totalKcal };
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
