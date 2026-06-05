import { NextResponse } from "next/server";
import { generateStructuredContent, checkRateLimit, getRateLimitReset } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const endpoint = "ai/import-croqueta";
    if (!checkRateLimit(endpoint)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", retryAfter: getRateLimitReset(endpoint) },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const prompt = `Eres un asistente experto en nutrición canina. Parsea la información del producto abajo EXACTAMENTE como se indica.

REGLAS ESTRICTAS:
- NO inventes datos. Si algo no está en el texto, usa null o [] .
- Para porcentajes, extrae SOLO el número (ej: "30%" → 30, "15% (mín.)" → 15).
- Si hay "30% / 28%", usa 30 (el primero).

EJEMPLOS DE EXTRACCIÓN:

Ejemplo 1 - "Sabor Principal / Primer Ingrediente: Pollo (Proteína de pollo)" + "Proteína Cruda: 30%":
  protein_type → "Pollo 30%"

Ejemplo 2 - "Lista de Ingredientes: Proteína de pollo (ingrediente principal), arroz, maíz":
  ingredients → [
    {"ingredient_name": "Proteína de pollo", "quantity_per_serving_g": 0, "ingredient_type": "croqueta", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"},
    {"ingredient_name": "arroz", "quantity_per_serving_g": 0, "ingredient_type": "croqueta", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"},
    {"ingredient_name": "maíz", "quantity_per_serving_g": 0, "ingredient_type": "croqueta", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"}
  ]

Ejemplo 3 - "Tamaño de Raza: Medianas y Grandes":
  breed_sizes → ["mediana", "grande"]

Ejemplo 4 - "Fabricante: Pronaca" + "Página web: https://www.pronaca.com":
  source_book → "Pronaca (pronaca.com)"

Ejemplo 5 - "Beneficios Clave: 1. Óptimo desarrollo... 2. Refuerza sistema inmune...":
  benefits → ["Óptimo desarrollo inicial con niveles balanceados para músculos y huesos fuertes.", "Refuerza el sistema inmune mediante vitaminas, minerales y antioxidantes naturales."]

CAMPOS A EXTRAER:
1. official_name → campo "Nombre del Producto", copiar exacto
2. brand → campo "Fabricante"
3. description → "Tecnología o Fórmula Especial" o primera frase descriptiva
4. category → siempre "croquetas"
5. protein_type → ingrediente principal + % proteína (ej: "Pollo 30%")
6. kcal_per_100g → "Energía Metabolizable (Kcal/kg)" ÷ 10, o null
7. nutrition_facts → parsear % a números:
   protein_g, fat_g, fiber_g, moisture_g de los valores en % (ej: 30% → 30)
   calcium_mg, phosphorus_mg: si son %, multiplicar × 1000 (1% → 1000)
   carbs_g: calcular 100 - protein_g - fat_g - fiber_g - moisture_g - ash_g, o 0
   ash_g: si no está, usar 0
   omega3_g, omega6_g: extraer si hay números, si no 0
   El resto: 0
8. ingredients → array de objetos, uno por cada ítem en "Lista de Ingredientes", limpiando textos entre paréntesis
9. breed_sizes → mapear "Medianas y Grandes" → ["mediana","grande"]
10. benefits → array de strings de "Beneficios Clave"
11. health_tags → claims de salud cortos ("desarrollo muscular", "sistema inmune", etc.)
12. storage_instructions → "Indicaciones de Almacenamiento", o null
13. source_book → "brand (dominio.com)" si hay web

Información del producto:
"""
${query}
"""

Responde SOLO con JSON válido. Sin markdown. Sin explicaciones.

{
  "official_name": null,
  "brand": null,
  "description": null,
  "category": "croquetas",
  "difficulty": "facil",
  "prep_time_min": 0,
  "kcal_per_100g": null,
  "protein_type": null,
  "is_therapeutic": false,
  "is_detox": false,
  "health_tags": [],
  "source_book": null,
  "nutrition_facts": {
    "protein_g": 0,
    "fat_g": 0,
    "carbs_g": 0,
    "fiber_g": 0,
    "moisture_g": 0,
    "ash_g": 0,
    "calcium_mg": 0,
    "phosphorus_mg": 0,
    "iron_mg": 0,
    "zinc_mg": 0,
    "vitamin_a_ui": 0,
    "vitamin_d_ui": 0,
    "vitamin_e_mg": 0,
    "omega3_g": 0,
    "omega6_g": 0
  },
  "ingredients": [],
  "steps": [
    {"instruction": "Servir la cantidad recomendada según el peso del perro.", "duration_min": 0}
  ],
  "breed_sizes": [],
  "calories_per_kg": null,
  "benefits": [],
  "storage_instructions": null
}`;

    const { text, json } = await generateStructuredContent(prompt);

    if (!json) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: json, raw: text });
  } catch (error) {
    console.error("[AI Import Croqueta] Error:", error);
    return NextResponse.json(
      { error: "Failed to import croqueta" },
      { status: 500 }
    );
  }
}
