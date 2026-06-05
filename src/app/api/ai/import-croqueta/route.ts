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

    const prompt = `Eres un asistente de nutrición canina. Formatea la siguiente información de producto para mostrarla en una app de mascotas.

REGLAS:
- Extrae SOLO lo que está presente en el texto.
- Si un dato no aparece en el texto, NO lo incluyas en el JSON (no null, no vacío).
- Para porcentajes, extrae SOLO el número (ej: "30% (mín.)" → 30).
- Si hay múltiples valores (ej: "30% / 28%"), usa el primero (30).
- Los ingredientes: separa por comas, limpia textos entre paréntesis.

DEVUELVE SOLO JSON. Sin markdown. Sin explicaciones.

ESTRUCTURA ESPERADA (incluye SOLO campos con datos):

{
  "title": "Nombre exacto del producto",
  "description": "Frase corta descriptiva del producto",
  "protein_type": "Ingrediente principal + % (ej: Pollo 30%)",
  "source_book": "Fabricante (dominio.com si hay web)",
  "breed_sizes": ["mediana", "grande"],
  "nutrition_summary": {
    "protein_g": 30,
    "fat_g": 15,
    "fiber_g": 3,
    "moisture_g": 10,
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
  "nutrition_description": "Resumen en lenguaje natural de por qué esta croqueta es buena",
  "ingredients_text": "Proteína de pollo, arroz, maíz, pulpa de remolacha, aceite de pescado",
  "benefits": ["Beneficio 1", "Beneficio 2"],
  "health_tags": ["tag1", "tag2"],
  "storage_instructions": "texto de almacenamiento"
}

Información del producto:
"""
${query}
"""`;

    const { text, json } = await generateStructuredContent(prompt);

    if (!json) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: text },
        { status: 502 }
      );
    }

    // Add missing fields with defaults for the form
    const j = json as any;
    const result = {
      official_name: j.title || null,
      title: j.title || null,
      description: j.description || null,
      category: "croquetas",
      difficulty: "facil",
      prep_time_min: 0,
      kcal_per_100g: null,
      protein_type: j.protein_type || null,
      is_therapeutic: false,
      is_detox: false,
      health_tags: j.health_tags || [],
      source_book: j.source_book || null,
      nutrition_facts: j.nutrition_summary || {},
      nutrition_description: j.nutrition_description || null,
      ingredients_text: j.ingredients_text || null,
      ingredients: j.ingredients_text 
        ? j.ingredients_text.split(",").map((name: string) => ({
            ingredient_name: name.trim(),
            quantity_per_serving_g: 0,
            ingredient_type: "croqueta",
            unit_type: "g",
            unit_weight_g: 1,
            display_unit: "g"
          }))
        : [],
      steps: [{ instruction: "Servir la cantidad recomendada según el peso del perro.", duration_min: 0 }],
      breed_sizes: j.breed_sizes || [],
      benefits: j.benefits || [],
      storage_instructions: j.storage_instructions || null,
    };

    return NextResponse.json({ success: true, data: result, raw: text });
  } catch (error) {
    console.error("[AI Import Croqueta] Error:", error);
    return NextResponse.json(
      { error: "Failed to import croqueta" },
      { status: 500 }
    );
  }
}
