-- ============================================================
-- Parte A: Guantera + Perfil + Upgrades (columnas nuevas)
-- ============================================================

-- 1. Seguro Obligatorio (migrar soat → seguro_obligatorio + actualizar CHECK)
ALTER TABLE vehicle_documents DROP CONSTRAINT IF EXISTS vehicle_documents_tipo_check;
UPDATE vehicle_documents SET tipo='seguro_obligatorio' WHERE tipo='soat';
ALTER TABLE vehicle_documents ADD CONSTRAINT vehicle_documents_tipo_check
  CHECK (tipo IN ('seguro_obligatorio','revision_tecnica','poliza_seguro','matricula','licencia_conducir'));

-- 2. País del teléfono del contacto
ALTER TABLE vehicle_contacts ADD COLUMN IF NOT EXISTS pais_telefono TEXT;

-- 3. ADN del vehículo: marcas + batería + unidad de tanque
ALTER TABLE vehicle_specs
  ADD COLUMN IF NOT EXISTS refrigerante_marca TEXT,
  ADD COLUMN IF NOT EXISTS freno_marca TEXT,
  ADD COLUMN IF NOT EXISTS aceite_marca TEXT,
  ADD COLUMN IF NOT EXISTS bateria_marca TEXT,
  ADD COLUMN IF NOT EXISTS bateria_mantenimiento_fecha DATE,
  ADD COLUMN IF NOT EXISTS tanque_unidad TEXT DEFAULT 'gal';

-- 4. Upgrades: fecha de compra (fecha), mantenimiento, vencimiento, ciclo
ALTER TABLE vehicle_upgrades ADD COLUMN IF NOT EXISTS fecha_mantenimiento DATE;
ALTER TABLE vehicle_upgrades ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE vehicle_upgrades ADD COLUMN IF NOT EXISTS ciclo TEXT CHECK (ciclo IN ('tiempo','km') OR ciclo IS NULL);
ALTER TABLE vehicle_upgrades ADD COLUMN IF NOT EXISTS duracion_km INTEGER;
