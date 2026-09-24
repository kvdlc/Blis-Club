// Clasificación de contenido para separar Interactivos / Juegos / Imprimibles.
export type KidsSection = "interactivo" | "juego" | "imprimible";

export function activitySection(a: { category_slug?: string; data?: any }): KidsSection {
  const s = a?.data?.section;
  if (s === "interactivo" || s === "juego" || s === "imprimible") return s;
  const cat = a?.category_slug ?? "";
  if (a?.data?.book) {
    if (cat === "colorear" || cat === "cuento") return "interactivo";
    if (a?.data?.artistly) return "imprimible";
    return "juego";
  }
  if (cat === "colorear" || cat === "cuento") return "interactivo";
  return "juego";
}
