-- Vehicle contacts directory (mechanics, towers, shops)
CREATE TABLE IF NOT EXISTS vehicle_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('mecanico', 'electromecanico', 'grua', 'tienda_repuestos', 'aseguradora', 'otro')),
  telefono TEXT,
  whatsapp TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON vehicle_contacts FOR SELECT
  USING (vehicle_id IS NULL OR vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert own contacts"
  ON vehicle_contacts FOR INSERT
  WITH CHECK (vehicle_id IS NULL OR vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update own contacts"
  ON vehicle_contacts FOR UPDATE
  USING (vehicle_id IS NULL OR vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete own contacts"
  ON vehicle_contacts FOR DELETE
  USING (vehicle_id IS NULL OR vehicle_id IN (SELECT id FROM vehicles WHERE owner_id = auth.uid()));

CREATE INDEX idx_contacts_vehicle ON vehicle_contacts(vehicle_id, tipo);
