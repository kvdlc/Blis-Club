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

    const prompt = `You are a pet nutrition database assistant. The user provides product information for a commercial dog food (croqueta/kibble). Parse the provided information into the exact JSON structure below.

Do NOT search for additional data. Do NOT guess or fill missing values. Leave fields as null or empty if the info is not present in the text.

User's product information:
"""
${query}
"""

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):

{
  "official_name": "Exact official product name from the text, or null",
  "brand": "Brand name from the text, or null",
  "description": "One-sentence description of the product extracted from the text, or null",
  "category": "croquetas",
  "difficulty": "facil",
  "prep_time_min": 0,
  "kcal_per_100g": null,
  "protein_type": "Croqueta comercial",
  "is_therapeutic": false,
  "is_detox": false,
  "health_tags": [],
  "nutrition_facts": {
    "protein_g": null,
    "fat_g": null,
    "carbs_g": null,
    "fiber_g": null,
    "moisture_g": null,
    "ash_g": null,
    "calcium_mg": null,
    "phosphorus_mg": null,
    "iron_mg": null,
    "zinc_mg": null,
    "vitamin_a_ui": null,
    "vitamin_d_ui": null,
    "vitamin_e_mg": null,
    "omega3_g": null,
    "omega6_g": null
  },
  "ingredients": [
    {"ingredient_name": "Ingredient from the list", "quantity_per_serving_g": 0, "ingredient_type": "otro", "unit_type": "g", "unit_weight_g": 1, "display_unit": "g"}
  ],
  "steps": [
    {"instruction": "Servir la cantidad recomendada según el peso del perro.", "duration_min": 0}
  ],
  "breed_sizes": [],
  "calories_per_kg": null,
  "benefits": [],
  "storage_instructions": null
}

Important rules:
- Extract values EXACTLY as provided in the text. Do not invent or estimate.
- nutrition_facts: Extract from "Análisis Garantizado" or "Análisis Nutricional" sections. Convert percentages to grams per 100g (e.g., 26% protein = 26g). Leave null if not found.
- ingredients: Extract from "Lista de Ingredientes" section. Do not change the ingredient names.
- breed_sizes: Extract from "Tamaño de Raza" section if present. Valid values: "miniatura", "pequena", "mediana", "grande", "gigante".
- kcal_per_100g: If "Energía Metabolizable" is provided with a value like "3800 Kcal/kg", convert: 3800/10 = 380 kcal/100g.
- health_tags: Extract any health claims ("alta proteina", "bajo en grasa", etc.) as array.
- Respond ONLY with the JSON object.`;

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
