/* ═══════════════════════ Catálogo de repuestos y accesorios ═══════════════════════
 * Define productos comunes con su vida útil típica (por km o por meses) y la categoría
 * contable que alimenta las gráficas. Al elegir un producto se precargan estos valores.
 */

export type LifeSpec = {
  tipo: "km" | "tiempo";
  km?: number;      // duración típica en km
  meses?: number;   // duración típica en meses
};

export interface PartProduct {
  value: string;
  label: string;
  emoji: string;
  categoria: "estetico" | "tecnologico" | "performance" | "seguridad" | "confort" | "otro";
  tipoMantenimiento: "preventivo" | "correctivo";
  vida: LifeSpec | null; // null = sin vida útil sugerida (accesorio)
  descripcion?: string;
}

export const PART_PRODUCTS: PartProduct[] = [
  // 🛞 Rodado / suspensión
  { value: "llantas", label: "Llantas", emoji: "🛞", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 40000 }, descripcion: "Juego de neumáticos" },
  { value: "amortiguadores", label: "Amortiguadores", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 80000 }, descripcion: "Suspensión" },
  { value: "rotulas", label: "Rótulas y terminales", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 60000 } },
  { value: "bujes", label: "Bujes de suspensión", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 80000 } },

  // 🛑 Frenos
  { value: "pastillas_freno", label: "Pastillas de freno", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 40000 }, descripcion: "Delanteras o traseras" },
  { value: "discos_freno", label: "Discos de freno", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },
  { value: "liquido_frenos", label: "Líquido de frenos", emoji: "🧪", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 24 }, descripcion: "DOT 3/4" },
  { value: "tambores", label: "Tambores / zapatas", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },

  // 🛢️ Motor / lubricación
  { value: "filtro_aceite", label: "Filtro de aceite", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 10000 } },
  { value: "aceite_motor", label: "Aceite de motor", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 10000 }, descripcion: "Incluye filtro" },
  { value: "filtro_aire", label: "Filtro de aire", emoji: "🌬️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 15000 } },
  { value: "filtro_combustible", label: "Filtro de combustible", emoji: "⛽", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 30000 } },
  { value: "filtro_cabina", label: "Filtro de cabina", emoji: "🌀", categoria: "confort", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 15000 }, descripcion: "Aire acondicionado" },
  { value: "bujias", label: "Bujías", emoji: "⚡", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 30000 } },
  { value: "bobinas", label: "Bobinas de encendido", emoji: "⚡", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 80000 } },
  { value: "correa_distribucion", label: "Correa de distribución", emoji: "⚙️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 90000 }, descripcion: "Incluye tensores y bomba" },
  { value: "correa_accesorios", label: "Correa de accesorios", emoji: "⚙️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },
  { value: "kit_embrague", label: "Kit de embrague", emoji: "🕹️", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 120000 } },
  { value: "aceite_caja", label: "Aceite de caja", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },
  { value: "aceite_direccion", label: "Aceite de dirección", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 24 } },
  { value: "refrigerante", label: "Refrigerante", emoji: "🌡️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 24 } },
  { value: "bomba_agua", label: "Bomba de agua", emoji: "💧", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 90000 } },
  { value: "sensor_oxigeno", label: "Sensor de oxígeno", emoji: "🔍", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 100000 } },
  { value: "mangueras", label: "Mangueras", emoji: "🌀", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 80000 } },

  // 🔋 Eléctrico
  { value: "bateria", label: "Batería", emoji: "🔋", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 36 }, descripcion: "Batería principal" },
  { value: "alternador", label: "Alternador", emoji: "⚡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 150000 } },
  { value: "motor_arranque", label: "Motor de arranque", emoji: "⚡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 150000 } },
  { value: "focos", label: "Focos / luces", emoji: "💡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "bocina", label: "Bocina", emoji: "📯", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "fusibles", label: "Fusibles", emoji: "🔌", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },

  // 🔧 Otros repuestos
  { value: "limpiabrisas", label: "Limpiaparabrisas", emoji: "💦", categoria: "confort", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 6 }, descripcion: "Escobillas" },
  { value: "parabrisas", label: "Parabrisas", emoji: "🪟", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "espejos", label: "Espejos", emoji: "🪞", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "retrovisor", label: "Retrovisor", emoji: "🪞", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },

  // 🎨 Accesorios (sin vida útil)
  { value: "accesorio", label: "Accesorio / mejora", emoji: "✨", categoria: "estetico", tipoMantenimiento: "correctivo", vida: null, descripcion: "Sonido, luces LED, llantas de aro, etc." },
];

export function partProduct(value: string): PartProduct | undefined {
  return PART_PRODUCTS.find((p) => p.value === value);
}

export const PART_CATEGORIA_LABEL: Record<string, string> = {
  estetico: "Estético",
  tecnologico: "Tecnológico",
  performance: "Performance",
  seguridad: "Seguridad",
  confort: "Confort",
  otro: "Otro",
};

export const PART_CATEGORIA_EMOJI: Record<string, string> = {
  estetico: "🎨",
  tecnologico: "📱",
  performance: "⚡",
  seguridad: "🛡️",
  confort: "🛋️",
  otro: "📌",
};
