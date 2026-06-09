-- ============================================================
-- 47. AMPLIAR FEEDING_PCT PARA SOPORTAR AJUSTE MIXTA (100%)
-- ============================================================
-- NUMERIC(3,1) solo permite 0.0 a 99.9. Mixta necesita 100
ALTER TABLE dog_metabolic_profiles ALTER COLUMN feeding_pct TYPE NUMERIC(5,1);
