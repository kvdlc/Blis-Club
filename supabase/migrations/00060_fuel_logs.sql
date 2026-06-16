-- Fuel logs for Auto app (eco-score, cost tracking)
CREATE TABLE IF NOT EXISTS fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  odometro INTEGER NOT NULL,
  litros NUMERIC(8,3) NOT NULL,
  precio_por_galon NUMERIC(8,2) NOT NULL,
  tipo_combustible TEXT DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fuel logs"
  ON fuel_logs FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own fuel logs"
  ON fuel_logs FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own fuel logs"
  ON fuel_logs FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id, fecha DESC);
