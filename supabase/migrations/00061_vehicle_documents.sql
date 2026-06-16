-- Vehicle documents (SOAT, revision tecnica, poliza, matricula, licencia)
CREATE TABLE IF NOT EXISTS vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('soat', 'revision_tecnica', 'poliza_seguro', 'matricula', 'licencia_conducir')),
  fecha_emision DATE,
  fecha_vencimiento DATE NOT NULL,
  imagen_url TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON vehicle_documents FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own documents"
  ON vehicle_documents FOR INSERT
  WITH CHECK (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own documents"
  ON vehicle_documents FOR UPDATE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own documents"
  ON vehicle_documents FOR DELETE
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_vehicle_docs_vehicle ON vehicle_documents(vehicle_id, fecha_vencimiento);
