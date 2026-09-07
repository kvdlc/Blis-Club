-- Preferencias de moneda y unidad de combustible por usuario
-- (se derivan del país si están vacías; ver lib/countries.ts)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fuel_unit TEXT CHECK (fuel_unit IN ('galon', 'litro'));
