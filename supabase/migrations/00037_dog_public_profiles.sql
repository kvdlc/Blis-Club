-- ============================================================
-- 37. DOG PUBLIC PROFILES (perfil público / vitrina social)
-- ============================================================
CREATE TABLE dog_public_profiles (
  dog_id UUID PRIMARY KEY REFERENCES dogs(id) ON DELETE CASCADE,
  bio TEXT,
  city TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  sections_visible JSONB NOT NULL DEFAULT '{
    "badges": true,
    "gallery": true,
    "stats": true,
    "agility": true,
    "weight": true,
    "medical": true,
    "diet": true,
    "breeding": false,
    "contact": false
  }'::jsonb,
  gallery_photos TEXT[] DEFAULT '{}',
  breeding_active BOOLEAN NOT NULL DEFAULT false,
  breeding_inquiry_only BOOLEAN NOT NULL DEFAULT true,
  breeding_currency TEXT DEFAULT 'USD',
  breeding_amount TEXT,
  breeding_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dog_public_profiles ENABLE ROW LEVEL SECURITY;

-- El dueño ve su configuración (JOIN con dogs para verificar owner_id)
CREATE POLICY "Owner sees own dog public profile config"
  ON dog_public_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = dog_public_profiles.dog_id
        AND dogs.owner_id = auth.uid()
    )
  );

-- El dueño inserta configuración para su perro
CREATE POLICY "Owner inserts public profile config for own dog"
  ON dog_public_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = dog_public_profiles.dog_id
        AND dogs.owner_id = auth.uid()
    )
  );

-- El dueño actualiza su configuración
CREATE POLICY "Owner updates own dog public profile config"
  ON dog_public_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = dog_public_profiles.dog_id
        AND dogs.owner_id = auth.uid()
    )
  );

-- El dueño elimina configuración
CREATE POLICY "Owner deletes own dog public profile config"
  ON dog_public_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dogs
      WHERE dogs.id = dog_public_profiles.dog_id
        AND dogs.owner_id = auth.uid()
    )
  );
