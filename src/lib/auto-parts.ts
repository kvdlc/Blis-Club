/* ═══════════════════════ Catálogo de repuestos y accesorios ═══════════════════════
 * Define productos comunes con su vida útil típica (por km o por meses), la categoría
 * contable que alimenta las gráficas y, opcionalmente, qué campos del ADN del vehículo
 * se pueden sincronizar al comprar el producto (ej. comprar llantas → actualizar PSI).
 */

export type LifeSpec = {
  tipo: "km" | "tiempo";
  km?: number;      // duración típica en km
  meses?: number;   // duración típica en meses
};

/** Campo del ADN (vehicle_specs) que se puede sincronizar al comprar el producto. */
export interface AdnSyncField {
  key: string;          // columna de vehicle_specs
  label: string;        // etiqueta amigable
  kind: "text" | "number" | "date";
  help?: string;
}

export interface PartProduct {
  value: string;
  label: string;
  emoji: string;
  categoria: "estetico" | "tecnologico" | "performance" | "seguridad" | "confort" | "otro";
  tipoMantenimiento: "preventivo" | "correctivo";
  vida: LifeSpec | null; // null = sin vida útil sugerida (accesorio)
  descripcion?: string;
  adn?: AdnSyncField[]; // campos que se sincronizan con el ADN del vehículo
}

export const PART_PRODUCTS: PartProduct[] = [
  // 🛞 Rodado / suspensión
  { value: "llantas", label: "Llantas", emoji: "🛞", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 40000 }, descripcion: "Juego de neumáticos", adn: [
    { key: "llanta_ancho", label: "Ancho de llanta (mm)", kind: "number", help: "Primer número en 205/55 R16 (costado de la llanta)" },
    { key: "llanta_perfil", label: "Perfil", kind: "number", help: "Segundo número en 205/55 R16" },
    { key: "llanta_rin", label: "Rin (pulgadas)", kind: "number", help: "Tras la R en 205/55 R16" },
    { key: "presion_neumaticos_delante", label: "Presión delantera (PSI)", kind: "number", help: "Sticker en la puerta del conductor" },
    { key: "presion_neumaticos_atras", label: "Presión trasera (PSI)", kind: "number", help: "Sticker en la puerta del conductor" },
    { key: "presion_neumaticos_repuesto", label: "Presión repuesto (PSI)", kind: "number", help: "Sticker o llanta de repuesto" },
  ] },
  { value: "amortiguadores", label: "Amortiguadores", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 80000 }, descripcion: "Suspensión" },
  { value: "rotulas", label: "Rótulas y terminales", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 60000 } },
  { value: "bujes", label: "Bujes de suspensión", emoji: "🔩", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 80000 } },

  // 🛑 Frenos
  { value: "pastillas_freno", label: "Pastillas de freno", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 40000 }, descripcion: "Delanteras o traseras", adn: [
    { key: "freno_marca", label: "Marca de frenos", kind: "text", help: "Ej: Bosch, Brembo (va al ADN)" },
    { key: "tipo_freno", label: "Tipo de líquido de frenos", kind: "text", help: "DOT 3 / DOT 4 (va al ADN)" },
  ] },
  { value: "discos_freno", label: "Discos de freno", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },
  { value: "liquido_frenos", label: "Líquido de frenos", emoji: "🧪", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 24 }, descripcion: "DOT 3/4" },
  { value: "tambores", label: "Tambores / zapatas", emoji: "🛑", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 60000 } },

  // 🛢️ Motor / lubricación
  { value: "filtro_aceite", label: "Filtro de aceite", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 10000 } },
  { value: "aceite_motor", label: "Aceite de motor", emoji: "🛢️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "km", km: 10000 }, descripcion: "Incluye filtro", adn: [
    { key: "tipo_aceite", label: "Tipo de aceite", kind: "text", help: "Sintético / Semisintético / Mineral (va al ADN)" },
    { key: "viscosidad_aceite", label: "Viscosidad", kind: "text", help: "Ej: 5W-30 (va al ADN)" },
    { key: "aceite_marca", label: "Marca de aceite", kind: "text", help: "Va al ADN del vehículo" },
  ] },
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
  { value: "refrigerante", label: "Refrigerante", emoji: "🌡️", categoria: "performance", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 24 }, adn: [
    { key: "refrigerante_marca", label: "Marca de refrigerante", kind: "text", help: "Va al ADN del vehículo" },
    { key: "tipo_refrigerante", label: "Tipo de refrigerante", kind: "text", help: "Ej: Etilenglicol (va al ADN)" },
  ] },
  { value: "bomba_agua", label: "Bomba de agua", emoji: "💧", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 90000 } },
  { value: "sensor_oxigeno", label: "Sensor de oxígeno", emoji: "🔍", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 100000 } },
  { value: "mangueras", label: "Mangueras", emoji: "🌀", categoria: "performance", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 80000 } },

  // 🔋 Eléctrico
  { value: "bateria", label: "Batería", emoji: "🔋", categoria: "seguridad", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 36 }, descripcion: "Batería principal", adn: [
    { key: "bateria_marca", label: "Marca / referencia de batería", kind: "text", help: "Ej: BOSCH S4 (va al ADN)" },
    { key: "bateria_mantenimiento_fecha", label: "Fecha del próximo mantenimiento", kind: "date", help: "Se sugiere +36 meses desde la compra (va al ADN)" },
  ] },
  { value: "alternador", label: "Alternador", emoji: "⚡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 150000 } },
  { value: "motor_arranque", label: "Motor de arranque", emoji: "⚡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "km", km: 150000 } },
  { value: "focos", label: "Focos / luces", emoji: "💡", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "luces_internas", label: "Luces internas / LED", emoji: "💡", categoria: "estetico", tipoMantenimiento: "correctivo", vida: null, descripcion: "Luces de cabina, ambiente" },
  { value: "bocina", label: "Bocina", emoji: "📯", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "fusibles", label: "Fusibles", emoji: "🔌", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },

  // 🔊 Audio / tecnología
  { value: "parlantes", label: "Parlantes / bocinas de sonido", emoji: "🔊", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null, descripcion: "Equipo de sonido" },
  { value: "estereo", label: "Estéreo / radio", emoji: "📻", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null },
  { value: "camara_reversa", label: "Cámara de retroceso", emoji: "📷", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null },
  { value: "sensores_parqueo", label: "Sensores de parqueo", emoji: "📡", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null },
  { value: "cargador_coche", label: "Cargador de coche / USB", emoji: "🔌", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null },
  { value: "navegador", label: "Navegador GPS", emoji: "🧭", categoria: "tecnologico", tipoMantenimiento: "correctivo", vida: null },

  // 🧰 Equipo y utilidades
  { value: "gata", label: "Gata hidráulica", emoji: "🛠️", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "kit_herramientas", label: "Kit de herramientas", emoji: "🧰", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "extintor", label: "Extintor", emoji: "🧯", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: { tipo: "tiempo", meses: 60 } },
  { value: "triangulos", label: "Triángulos de seguridad", emoji: "⚠️", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "botiquin", label: "Botiquín", emoji: "⛑️", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },

  // 🔧 Otros repuestos
  { value: "limpiabrisas", label: "Limpiaparabrisas", emoji: "💦", categoria: "confort", tipoMantenimiento: "preventivo", vida: { tipo: "tiempo", meses: 6 }, descripcion: "Escobillas" },
  { value: "parabrisas", label: "Parabrisas", emoji: "🪟", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "espejos", label: "Espejos", emoji: "🪞", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },
  { value: "retrovisor", label: "Retrovisor", emoji: "🪞", categoria: "seguridad", tipoMantenimiento: "correctivo", vida: null },

  // 🎨 Accesorios (sin vida útil)
  { value: "alfombras", label: "Alfombras / pisos", emoji: "🟫", categoria: "confort", tipoMantenimiento: "correctivo", vida: null, descripcion: "Pisos y alfombras" },
  { value: "forros_asientos", label: "Forros de asientos", emoji: "🪑", categoria: "confort", tipoMantenimiento: "correctivo", vida: null },
  { value: "accesorio", label: "Accesorio / mejora", emoji: "✨", categoria: "estetico", tipoMantenimiento: "correctivo", vida: null, descripcion: "Sonido, luces LED, llantas de aro, etc." },
];

export function partProduct(value: string): PartProduct | undefined {
  return PART_PRODUCTS.find((p) => p.value === value);
}

/** Busca productos por texto (nombre o descripción). */
export function searchProducts(q: string, limit = 12): PartProduct[] {
  const s = q.trim().toLowerCase();
  if (!s) return PART_PRODUCTS.slice(0, limit);
  return PART_PRODUCTS.filter(
    (p) => p.label.toLowerCase().includes(s) || (p.descripcion || "").toLowerCase().includes(s),
  ).slice(0, limit);
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
