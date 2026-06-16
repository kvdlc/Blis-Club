-- Vehicles table for Auto app
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  año INTEGER NOT NULL,
  placa TEXT NOT NULL,
  kilometraje INTEGER DEFAULT 0,
  foto_url TEXT,
  color TEXT,
  vin TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'en venta', 'robado', 'vendido')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users only see their own vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (owner_id = auth.uid());

-- Public profile: anyone can view vehicles marked for sale
CREATE POLICY "Anyone can view vehicles for sale"
  ON vehicles FOR SELECT
  USING (estado = 'en venta');
