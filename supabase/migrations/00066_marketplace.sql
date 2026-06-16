-- Marketplace listings for Auto app
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('repuestos', 'accesorios', 'servicios', 'cupones', 'autos_usados')),
  marca TEXT,
  modelo TEXT,
  estado_item TEXT DEFAULT 'usado' CHECK (estado_item IN ('nuevo', 'usado')),
  precio NUMERIC(10,2) NOT NULL,
  descripcion TEXT,
  fotos TEXT[] DEFAULT '{}',
  whatsapp TEXT NOT NULL,
  ciudad TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
  ON marketplace_listings FOR SELECT
  USING (activo = true);

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON marketplace_listings FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON marketplace_listings FOR DELETE
  USING (user_id = auth.uid());

-- Admin can manage all
CREATE POLICY "Admin full access"
  ON marketplace_listings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE INDEX idx_listings_categoria ON marketplace_listings(categoria, activo);
CREATE INDEX idx_listings_slug ON marketplace_listings(slug);
CREATE INDEX idx_listings_user ON marketplace_listings(user_id, activo);
