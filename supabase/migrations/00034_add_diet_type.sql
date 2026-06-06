-- 00034_add_diet_type.sql
-- Agrega tipo de dieta (BARF vs Croquetas) al perfil metabólico

ALTER TABLE dog_metabolic_profiles
  ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'croquetas' CHECK (diet_type IN ('barf', 'croquetas'));
