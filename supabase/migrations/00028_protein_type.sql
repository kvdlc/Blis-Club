-- ============================================================
-- Dog Blis Club - Migración 00028: Tipo de Proteína en Recetas
-- ============================================================

ALTER TABLE nutrition_recipes 
ADD COLUMN IF NOT EXISTS protein_type TEXT;

-- Crear índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_protein_type ON nutrition_recipes(protein_type);
