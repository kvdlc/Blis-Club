/**
 * Structured prompts for Gemini 2.5 Pro content generation.
 * Each prompt requests a specific JSON schema matching our DB tables.
 */

/* ─── Recipe Prompt ─── */
export function buildRecipePrompt(params: {
  prompt: string;
  category?: string;
  difficulty?: string;
}): string {
  return `
Eres un nutricionista experto en alimentación BARF y comida casera para perros.
Genera una receta completa basada en la siguiente solicitud del usuario:

Solicitud: "${params.prompt}"
${params.category ? `Categoría preferida: ${params.category}` : ""}
${params.difficulty ? `Dificultad preferida: ${params.difficulty}` : ""}

Responde ÚNICAMENTE con un objeto JSON válido que siga exactamente este schema:

{
  "title": "string (máx 100 chars, atractivo y descriptivo)",
  "description": "string (200-500 chars, explicación appetitosa y beneficios para el perro)",
  "category": "diario | snack | helado | pastel",
  "difficulty": "facil | medio | avanzado",
  "prep_time_min": "number (tiempo realista en minutos)",
  "kcal_per_100g": "number",
  "is_therapeutic": "boolean",
  "health_tags": "string[] (opciones válidas: sin_gluten, hipoalergenico, renal, digestivo, articular, peso_ideal, senior, cachorro, diabetico, dermatitis, inmunidad)",
  "source_book": "string | null",
  "image_url": "string | null (URL de placeholder o null)",
  "video_url": "string | null",
  "ingredients": [
    {
      "ingredient_name": "string",
      "quantity_per_serving_g": "number (gramos por porción para perro de ~20kg)",
      "ingredient_type": "proteina | hueso | viscera | vegetal | suplemento | otro",
      "unit_type": "string (unidad natural: pieza, media_pieza, taza, cucharada, cucharadita, ml, litro, g, kg)",
      "unit_weight_g": "number (cuántos gramos pesa 1 unidad de este ingrediente)",
      "display_unit": "string (nombre descriptivo: 'pechuga de pollo', 'zanahoria mediana', 'taza de arroz')"
    }
  ],
  "steps": [
    {
      "step_number": "number (1-based)",
      "instruction": "string (claro, conciso, accionable)",
      "duration_min": "number | null",
      "image_url": "string | null"
    }
  ],
  "nutrition_facts": {
    "protein_g": "number",
    "fat_g": "number",
    "carbs_g": "number",
    "fiber_g": "number",
    "moisture_g": "number",
    "ash_g": "number",
    "calcium_mg": "number",
    "phosphorus_mg": "number",
    "iron_mg": "number",
    "zinc_mg": "number",
    "vitamin_a_ui": "number",
    "vitamin_d_ui": "number",
    "vitamin_e_mg": "number",
    "omega3_g": "number",
    "omega6_g": "number"
  }
}

REGLAS IMPORTANTES:
- Todos los valores nutricionales deben ser realistas para una receta casera de perro.
- La proporción de ingredientes debe seguir principios BARF (70-80% carne/hueso/viscera, 20-30% vegetales/suplementos).
- Si la solicitud menciona una condición médica, incluir health_tags apropiados y ajustar ingredientes.
- El JSON debe estar completo, sin campos omitidos.
- Responde SOLO con el JSON, sin texto adicional.
`;
}

/* ─── Lesson Prompt ─── */
export function buildLessonPrompt(params: {
  prompt: string;
  type: string;
  moduleTitle: string;
}): string {
  const typeInstructions: Record<string, string> = {
    theory: `
Genera una lección de teoría sobre entrenamiento canino.
El content_json debe tener este schema exacto:
{
  "cards": [
    { "title": "string", "body": "string (2-4 párrafos máximo)", "image": "string | null" }
  ],
  "check": {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correct": "number (0-based index)"
  }
}
Include at least 2-4 cards. Each card should teach one concept.`,
    quiz: `
Genera un cuestionario de entrenamiento canino.
El content_json debe tener este schema exacto:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correct_index": "number (0-based)"
    }
  ]
}
Include 3-5 questions.`,
    practice_timer: `
Genera una práctica con temporizador.
El content_json debe tener este schema exacto:
{
  "duration_seconds": "number (entre 30 y 300)",
  "exercise_name": "string",
  "instructions": "string (pasos claros)",
  "materials": ["string"]
}`,
    minigame_reflejos: `
Genera un minijuego de reflejos.
El content_json debe tener este schema exacto:
{
  "timings": [
    { "label": "string (nombre del nivel)", "seconds": "number" }
  ]
}
Include 3 levels with increasing difficulty.`,
    minigame_diccionario: `
Genera un minijuego de vocabulario de adiestramiento.
El content_json debe tener este schema exacto:
{
  "pairs": [
    { "word": "string (término de adiestramiento)", "definition": "string (significado simple)" }
  ]
}
Include 5-8 word-definition pairs relevant to dog training.`,
  };

  const typeInstruction =
    typeInstructions[params.type] || typeInstructions.theory;

  return `
Eres un adiestrador profesional de perros con 15 años de experiencia.
El módulo se llama: "${params.moduleTitle}".
El tipo de lección es: "${params.type}".

El usuario solicita esta lección:
"${params.prompt}"

${typeInstruction}

REGLAS IMPORTANTES:
- El JSON debe estar completo y válido.
- No uses campos que no están en el schema.
- El contenido debe ser específico para perros, no genérico.
- Responde SOLO con el JSON, sin texto adicional.
`;
}
