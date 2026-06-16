-- Maintenance logs (preventivo, correctivo, lavado, otros)
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('preventivo', 'correctivo', 'lavado', 'inspeccion', 'otro')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  odometro INTEGER,
  costo NUMERIC(10,2),
  taller TEXT,
  factura_url TEXT,
  garantia BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own maintenance logs"
  ON maintenance_logs FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own maintenance logs"
  ON maintenance_logs FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own maintenance logs"
  ON maintenance_logs FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own maintenance logs"
  ON maintenance_logs FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id, fecha DESC);
