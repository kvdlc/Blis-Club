export const BREED_SIZE_LABELS: Record<string, string> = {
  miniatura: "Miniatura (< 5kg)",
  pequena: "Pequeña (5-10kg)",
  mediana: "Mediana (10-25kg)",
  grande: "Grande (25-45kg)",
  gigante: "Gigante (> 45kg)",
};

export const BREED_SIZE_ORDER = ["miniatura", "pequena", "mediana", "grande", "gigante"];

/* ─── Mapa razas → tamaño ─── */
const RAZA_TO_SIZE: Record<string, string> = {
  /* Miniatura */
  chihuahua: "miniatura",
  "yorkshire terrier": "miniatura",
  "pinscher miniatura": "miniatura",
  affenpinscher: "miniatura",
  "bichón frisé": "miniatura",
  maltés: "miniatura",
  pekinés: "miniatura",
  pomerania: "miniatura",
  "shih tzu": "miniatura",
  "west highland terrier": "miniatura",

  /* Pequeña */
  beagle: "pequena",
  "boston terrier": "pequena",
  "bulldog francés": "pequena",
  "cavalier king charles": "pequena",
  "cocker spaniel": "pequena",
  corgi: "pequena",
  "jack russell terrier": "pequena",
  "lhasa apso": "pequena",
  pug: "pequena",
  "schnauzer miniatura": "pequena",
  "shiba inu": "pequena",
  caniche: "pequena",
  poodle: "pequena",
  basenji: "pequena",
  "schnauzer": "pequena",

  /* Mediana */
  "american pitbull": "mediana",
  "american staffordshire": "mediana",
  "american bully": "mediana",
  "border collie": "mediana",
  boxer: "mediana",
  "bulldog inglés": "mediana",
  "bull terrier": "mediana",
  "chow chow": "mediana",
  collie: "mediana",
  dálmata: "mediana",
  "pastor australiano": "mediana",
  "pastor belga": "mediana",
  sharpei: "mediana",
  "perro crestado": "mediana",
  "ridgeback": "mediana",

  /* Grande */
  "pastor alemán": "grande",
  "golden retriever": "grande",
  "labrador retriever": "grande",
  husky: "grande",
  doberman: "grande",
  rottweiler: "grande",
  akita: "grande",
  "alaskan malamute": "grande",
  pointer: "grande",
  "setter irlandés": "grande",
  weimaraner: "grande",
  samoyedo: "grande",
  greyhound: "grande",

  /* Gigante */
  "gran danés": "gigante",
  "boyero de berna": "gigante",
  "dogo argentino": "gigante",
  "dogo de burdeos": "gigante",
  mastín: "gigante",
  "san bernardo": "gigante",
  terranova: "gigante",
};

/* ─── Pesos referenciales por talla adulta ─── */
const SIZE_WEIGHT_RANGES: Record<string, [number, number]> = {
  miniatura: [0, 5],
  pequena: [5, 10],
  mediana: [10, 25],
  grande: [25, 45],
  gigante: [45, Infinity],
};

/**
 * Sugiere el tamaño de raza basado en el nombre de la raza.
 * Si no encuentra la raza, retorna null.
 */
export function sugerirTamanoPorRaza(raza: string): string | null {
  const key = raza.toLowerCase().trim();
  if (RAZA_TO_SIZE[key]) return RAZA_TO_SIZE[key];

  // Substring matching for compound breeds
  for (const [breedKey, size] of Object.entries(RAZA_TO_SIZE)) {
    if (key.includes(breedKey) || breedKey.includes(key)) return size;
  }
  return null;
}

/**
 * Sugiere el tamaño basado en peso + edad.
 * Para cachorros (< 12 meses), estima el peso adulto dividiendo entre 0.6.
 */
export function sugerirTamanoPorPeso(pesoKg: number, edadMeses: number): string {
  const estimated = edadMeses < 12 ? pesoKg / 0.6 : pesoKg;
  for (const [size, [min, max]] of Object.entries(SIZE_WEIGHT_RANGES)) {
    if (estimated >= min && estimated < max) return size;
  }
  return "grande";
}

/**
 * Determina el mejor tamaño para un perro:
 * 1. Si ya tiene `tamano` guardado, usarlo.
 * 2. Si no, buscar por raza.
 * 3. Si no encuentra raza, estimar por peso+edad.
 */
export function determinarTamano(
  raza: string,
  pesoKg: number,
  edadMeses: number,
  tamanoGuardado?: string | null,
): string {
  if (tamanoGuardado && tamanoGuardado in BREED_SIZE_LABELS) return tamanoGuardado;
  return sugerirTamanoPorRaza(raza) ?? sugerirTamanoPorPeso(pesoKg, edadMeses);
}
