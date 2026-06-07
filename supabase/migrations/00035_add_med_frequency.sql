-- 00035_add_med_frequency.sql
-- Agrega frecuencia de administración: número de días entre dosis

ALTER TABLE dog_medications
  ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1 CHECK (interval_days >= 1);
