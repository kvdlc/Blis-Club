-- ============================================================
-- Correcciones de specs que los usuarios hicieron vs catálogo
-- (para aprendizaje: si se repite, el admin la promueve al catálogo)
-- ============================================================
CREATE TABLE IF NOT EXISTS spec_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  catalog_spec_id UUID REFERENCES vehicle_catalog_specs(id) ON DELETE CASCADE,
  campo TEXT NOT NULL,
  valor_catalogo TEXT,
  valor_usuario TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spec_corrections ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias correcciones (por vehicle_id vía owner)
CREATE POLICY "Users can view own corrections"
  ON spec_corrections FOR SELECT
  USING (vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

-- Solo admins insertan/actualizan (se hace desde lógica server/client con service role)
