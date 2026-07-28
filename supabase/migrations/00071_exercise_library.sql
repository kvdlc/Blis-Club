-- Bucket público para GIFs de ejercicios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exercise_gifs', 'exercise_gifs', true, 209715200, ARRAY['image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Política pública de lectura para los GIFs
CREATE POLICY "Public read exercise gifs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise_gifs');

-- Política de escritura solo con service_role (admin)
CREATE POLICY "Admin upload exercise gifs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'exercise_gifs' AND auth.role() = 'service_role');

-- ═══════════════════════════════════════════
-- Biblioteca de ejercicios (catálogo público)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT DEFAULT 'peso corporal',
  difficulty TEXT DEFAULT 'intermedio' CHECK (difficulty IN ('principiante', 'intermedio', 'avanzado')),
  gif_url TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla pública: todos los usuarios autenticados pueden leer
ALTER TABLE spartan_exercise_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exercise library"
  ON spartan_exercise_library FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE INDEX idx_exercise_library_muscle ON spartan_exercise_library(muscle_group, is_active);
CREATE INDEX idx_exercise_library_name ON spartan_exercise_library USING gin (to_tsvector('spanish', name));
