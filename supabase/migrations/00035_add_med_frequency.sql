-- 00035_add_med_frequency.sql
-- Agrega frecuencia de administración: diario, cada 2 días, semanal

ALTER TABLE dog_medications
  ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'every_other_day', 'weekly'));
