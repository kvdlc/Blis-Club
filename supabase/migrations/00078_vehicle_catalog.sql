-- ============================================================
-- Catálogo de Vehículos LATAM (datos de referencia públicos)
-- ============================================================

-- Marcas
CREATE TABLE IF NOT EXISTS vehicle_catalog_makes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  pais_origen TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modelos
CREATE TABLE IF NOT EXISTS vehicle_catalog_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make_id UUID NOT NULL REFERENCES vehicle_catalog_makes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL,
  tipo_vehiculo TEXT DEFAULT 'auto' CHECK (tipo_vehiculo IN ('auto', 'suv', 'pickup', 'moto')),
  UNIQUE(make_id, nombre)
);

-- Especificaciones por versión (año + motor + combustible)
CREATE TABLE IF NOT EXISTS vehicle_catalog_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES vehicle_catalog_models(id) ON DELETE CASCADE,
  año INTEGER,
  motor_nombre TEXT,
  tipo_combustible TEXT DEFAULT 'gasolina' CHECK (tipo_combustible IN ('gasolina', 'diesel', 'gas', 'electrico', 'hibrido')),
  rendimiento_km_l NUMERIC(6,2),           -- referencia; el real se calcula de fuel_logs
  capacidad_tanque_l NUMERIC(6,2),         -- canónico en litros
  aceite_viscosidad TEXT,
  aceite_capacidad_l NUMERIC(5,2),
  refrigerante_tipo TEXT,
  refrigerante_capacidad_l NUMERIC(5,2),
  freno_tipo TEXT,
  psi_delante INTEGER,
  psi_atras INTEGER,
  psi_repuesto INTEGER,
  octanaje_sugerido TEXT,
  fuente_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_catalog_models_make ON vehicle_catalog_models(make_id);
CREATE INDEX IF NOT EXISTS idx_catalog_specs_model ON vehicle_catalog_specs(model_id, año);

-- RLS: el catálogo es lectura pública (datos de referencia)
ALTER TABLE vehicle_catalog_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_catalog_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_catalog_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog makes are public" ON vehicle_catalog_makes FOR SELECT USING (true);
CREATE POLICY "Catalog models are public" ON vehicle_catalog_models FOR SELECT USING (true);
CREATE POLICY "Catalog specs are public" ON vehicle_catalog_specs FOR SELECT USING (true);

-- ============================================================
-- Columnas nuevas en vehicles (tipo de vehículo + versión del catálogo)
-- ============================================================
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tipo_vehiculo TEXT DEFAULT 'auto' CHECK (tipo_vehiculo IN ('auto', 'suv', 'pickup', 'moto'));
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS catalog_spec_id UUID REFERENCES vehicle_catalog_specs(id) ON DELETE SET NULL;
