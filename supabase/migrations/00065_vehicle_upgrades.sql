-- Vehicle upgrades and accessories (estéticos, tecnológicos, performance)
CREATE TABLE IF NOT EXISTS vehicle_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('estetico', 'tecnologico', 'performance', 'seguridad', 'confort', 'otro')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  costo NUMERIC(10,2),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_upgrades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upgrades"
  ON vehicle_upgrades FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own upgrades"
  ON vehicle_upgrades FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own upgrades"
  ON vehicle_upgrades FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own upgrades"
  ON vehicle_upgrades FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_upgrades_vehicle ON vehicle_upgrades(vehicle_id, fecha DESC);
