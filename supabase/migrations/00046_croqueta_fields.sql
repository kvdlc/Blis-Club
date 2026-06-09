-- ============================================================
-- 46. AGREGAR CAMPOS DE CROQUETAS A NUTRITION_RECIPES
-- ============================================================

-- 1. ingredients_text: lista de ingredientes (texto largo)
ALTER TABLE nutrition_recipes ADD COLUMN IF NOT EXISTS ingredients_text TEXT;

-- 2. nutrition_description: descripción nutricional en lenguaje natural
ALTER TABLE nutrition_recipes ADD COLUMN IF NOT EXISTS nutrition_description TEXT;
