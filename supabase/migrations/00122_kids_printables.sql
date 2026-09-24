-- ============================================================================
-- 122. KIDS CLUB - Biblioteca de imprimibles (PDF) + portadas de categorias
-- ============================================================================

-- 1. Portada por categoria (reemplaza el uso de emojis)
ALTER TABLE kids_categories ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Bucket: permitir PDF en kids-assets
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
WHERE id = 'kids-assets';

-- 3. Imprimibles (recursos en PDF para descargar e imprimir)
CREATE TABLE IF NOT EXISTS kids_printables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  pages INT DEFAULT 1,
  age_min INT DEFAULT 3,
  age_max INT DEFAULT 10,
  difficulty TEXT DEFAULT 'facil' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  is_free BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  downloads_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kids_printables_category ON kids_printables (category_slug, is_published);
CREATE INDEX IF NOT EXISTS idx_kids_printables_user ON kids_printables (user_id);

ALTER TABLE kids_printables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kids_printables_read" ON kids_printables;
CREATE POLICY "kids_printables_read" ON kids_printables FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "kids_printables_insert" ON kids_printables;
CREATE POLICY "kids_printables_insert" ON kids_printables FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "kids_printables_update" ON kids_printables;
CREATE POLICY "kids_printables_update" ON kids_printables FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "kids_printables_delete" ON kids_printables;
CREATE POLICY "kids_printables_delete" ON kids_printables FOR DELETE
  USING (user_id = auth.uid());

-- 4. Seed de imprimibles (contenido inventado; las portadas se generan luego)
INSERT INTO kids_printables
  (category_slug, title, description, pages, age_min, age_max, difficulty, sort_order, tags, data)
SELECT * FROM (VALUES
  ('crucigrama', 'Crucigrama de transportes', 'Imprime y completa el crucigrama de medios de transporte.', 1, 6, 9, 'facil', 1,
    ARRAY['transportes', 'palabras']::TEXT[],
    '{"words":[{"answer":"AUTO","clue":"Tiene cuatro ruedas y corre por la calle"},{"answer":"TREN","clue":"Viaja sobre rieles"},{"answer":"AVION","clue":"Vuela por el cielo"},{"answer":"BARCO","clue":"Navega por el mar"},{"answer":"BICI","clue":"Tiene dos ruedas y pedales"}]}'::jsonb),
  ('sopa_letras', 'Sopa de letras: frutas', 'Encuentra las frutas escondidas e imprímela.', 1, 6, 10, 'facil', 2,
    ARRAY['frutas', 'letras']::TEXT[],
    '{"words":["MANZANA","PLATANO","FRESA","SANDIA","NARANJA","UVA"],"size":12}'::jsonb),
  ('laberinto', 'Laberinto del tesoro', 'Ayuda al dragón a llegar al cofre del tesoro.', 1, 5, 9, 'medio', 3,
    ARRAY['laberinto', 'tesoro']::TEXT[],
    '{"cols":14,"rows":14,"seed":21}'::jsonb),
  ('unir_puntos', 'Unir puntos: estrella de mar', 'Une los números en orden y descubre la figura.', 1, 4, 8, 'facil', 4,
    ARRAY['numeros', 'mar']::TEXT[],
    '{"shape":"fish","count":10}'::jsonb),
  ('colorear', 'Lamina para colorear: gatito', 'Imprime y colorea un gatito juguetón.', 1, 3, 8, 'facil', 5,
    ARRAY['colorear', 'animales']::TEXT[],
    '{}'::jsonb),
  ('cuento', 'Cuento: la nube viajera', 'Un cuento corto ilustrado para leer en familia.', 4, 4, 8, 'facil', 6,
    ARRAY['cuento', 'lectura']::TEXT[],
    '{"pages":[{"text":"Habia una vez una nube pequena que queria conocer el mundo.","prompt":"a cute smiling cloud floating in a bright blue sky, children illustration"},{"text":"La nube viajo sobre montanas, rios y ciudades llenas de colores.","prompt":"a cute cloud flying over green mountains and a river, children illustration"},{"text":"Conocio a un pajarito y juntos jugaron a hacer figuras en el cielo.","prompt":"a cute cloud and a little bird playing in the sky, children illustration"},{"text":"Al final del dia, la nube volvio feliz a su hogar. Fin.","prompt":"a cute cloud at sunset over a cozy house, children illustration"}]}'::jsonb)
) AS seed(category_slug, title, description, pages, age_min, age_max, difficulty, sort_order, tags, data)
WHERE NOT EXISTS (
  SELECT 1 FROM kids_printables k
  WHERE k.title = seed.title AND k.user_id IS NULL
);
