-- Travel journal for Auto app
CREATE TABLE IF NOT EXISTS travel_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  ruta TEXT,
  distancia_km NUMERIC(8,1),
  peajes JSONB DEFAULT '[]',
  fotos TEXT[] DEFAULT '{}',
  notas TEXT,
  costo_total NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE travel_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal"
  ON travel_journal FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own journal"
  ON travel_journal FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own journal"
  ON travel_journal FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_journal_vehicle ON travel_journal(vehicle_id, fecha DESC);
