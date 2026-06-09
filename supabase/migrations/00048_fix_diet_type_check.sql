-- ============================================================
-- 48. ARREGLAR CHECK CONSTRAINT DE DIET_TYPE PARA INCLUIR MIXTA
-- ============================================================

-- La constraint actual en producción solo permite 'barf' y 'croquetas'
-- La recreamos para incluir 'mixta'
ALTER TABLE dog_metabolic_profiles DROP CONSTRAINT IF EXISTS dog_metabolic_profiles_diet_type_check;
ALTER TABLE dog_metabolic_profiles ADD CONSTRAINT dog_metabolic_profiles_diet_type_check CHECK (diet_type IN ('barf', 'croquetas', 'mixta'));
