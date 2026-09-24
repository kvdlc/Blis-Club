-- ============================================================================
-- 121. KIDS CLUB - Biblioteca creativa para ninos
-- Ebooks y actividades: colorear, crucigramas, laberintos, sopa de letras,
-- unir puntos/trazos y cuentos. Contenido oficial + generado con IA.
-- ============================================================================

-- 1. Registrar la aplicacion en el ecosistema Blis Club
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM applications WHERE slug = 'kids') THEN
    INSERT INTO applications (name, slug, description, is_active, theme_color, icon_url)
    VALUES (
      'Kids Club',
      'kids',
      'Biblioteca creativa para ninos: colorear, crucigramas, laberintos, sopa de letras, unir puntos y cuentos.',
      true,
      '#F59E0B',
      '/icons/kids.png'
    );
  END IF;
END $$;

-- 2. Configuracion de la app
INSERT INTO app_settings (application_id, enabled_features)
SELECT id, ARRAY['kids']
FROM applications
WHERE slug = 'kids'
  AND NOT EXISTS (
    SELECT 1 FROM app_settings s WHERE s.application_id = applications.id
  );

-- 3. Categorias (tipos de contenido)
CREATE TABLE IF NOT EXISTS kids_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  color TEXT DEFAULT '#F59E0B',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Actividades / ebooks
CREATE TABLE IF NOT EXISTS kids_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  age_min INT DEFAULT 3,
  age_max INT DEFAULT 10,
  difficulty TEXT DEFAULT 'facil' CHECK (difficulty IN ('facil', 'medio', 'dificil')),
  is_free BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  is_ai_generated BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  data JSONB DEFAULT '{}'::jsonb,
  likes_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Paginas (libros multi-pagina: cuentos, libros de colorear)
CREATE TABLE IF NOT EXISTS kids_activity_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES kids_activities(id) ON DELETE CASCADE,
  page_number INT NOT NULL DEFAULT 1,
  image_url TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Perfiles de ninos (varios por cuenta de adulto)
CREATE TABLE IF NOT EXISTS kids_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '🐻',
  birth_year INT,
  color TEXT DEFAULT '#F59E0B',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Favoritos
CREATE TABLE IF NOT EXISTS kids_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES kids_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, activity_id)
);

-- 8. Progreso y estrellas
CREATE TABLE IF NOT EXISTS kids_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES kids_profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES kids_activities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  score INT DEFAULT 0,
  stars INT DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, activity_id)
);

-- 9. Indices
CREATE INDEX IF NOT EXISTS idx_kids_activities_category ON kids_activities (category_slug, is_published);
CREATE INDEX IF NOT EXISTS idx_kids_activities_user ON kids_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_kids_pages_activity ON kids_activity_pages (activity_id, page_number);
CREATE INDEX IF NOT EXISTS idx_kids_profiles_user ON kids_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_kids_favorites_user ON kids_favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_kids_progress_user ON kids_progress (user_id, activity_id);

-- 10. RLS
ALTER TABLE kids_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_activity_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids_progress ENABLE ROW LEVEL SECURITY;

-- Categorias: lectura publica
DROP POLICY IF EXISTS "kids_categories_read" ON kids_categories;
CREATE POLICY "kids_categories_read" ON kids_categories FOR SELECT USING (true);

-- Actividades: ver publicadas o las propias
DROP POLICY IF EXISTS "kids_activities_read" ON kids_activities;
CREATE POLICY "kids_activities_read" ON kids_activities FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "kids_activities_insert" ON kids_activities;
CREATE POLICY "kids_activities_insert" ON kids_activities FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "kids_activities_update" ON kids_activities;
CREATE POLICY "kids_activities_update" ON kids_activities FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "kids_activities_delete" ON kids_activities;
CREATE POLICY "kids_activities_delete" ON kids_activities FOR DELETE
  USING (user_id = auth.uid());

-- Paginas: visibles si la actividad es visible; escritura solo del dueno
DROP POLICY IF EXISTS "kids_pages_read" ON kids_activity_pages;
CREATE POLICY "kids_pages_read" ON kids_activity_pages FOR SELECT
  USING (
    activity_id IN (
      SELECT id FROM kids_activities WHERE is_published = true OR user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "kids_pages_write" ON kids_activity_pages;
CREATE POLICY "kids_pages_write" ON kids_activity_pages FOR ALL
  USING (activity_id IN (SELECT id FROM kids_activities WHERE user_id = auth.uid()))
  WITH CHECK (activity_id IN (SELECT id FROM kids_activities WHERE user_id = auth.uid()));

-- Perfiles de ninos: solo el dueno
DROP POLICY IF EXISTS "kids_profiles_all" ON kids_profiles;
CREATE POLICY "kids_profiles_all" ON kids_profiles FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Favoritos: solo el dueno
DROP POLICY IF EXISTS "kids_favorites_all" ON kids_favorites;
CREATE POLICY "kids_favorites_all" ON kids_favorites FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Progreso: solo el dueno
DROP POLICY IF EXISTS "kids_progress_all" ON kids_progress;
CREATE POLICY "kids_progress_all" ON kids_progress FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 11. Bucket de storage (publico) para portadas, laminas y recursos generados
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('kids-assets', 'kids-assets', true, 20971520,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "kids_assets_read" ON storage.objects;
CREATE POLICY "kids_assets_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'kids-assets');

DROP POLICY IF EXISTS "kids_assets_insert" ON storage.objects;
CREATE POLICY "kids_assets_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kids-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "kids_assets_update" ON storage.objects;
CREATE POLICY "kids_assets_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'kids-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "kids_assets_delete" ON storage.objects;
CREATE POLICY "kids_assets_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'kids-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 12. Seed de categorias
INSERT INTO kids_categories (slug, name, emoji, description, color, sort_order) VALUES
  ('colorear',     'Colorear',        '🖍️', 'Laminas y dibujos para pintar con muchos colores.',   '#EF4444', 1),
  ('crucigrama',   'Crucigramas',     '✏️', 'Crucigramas sencillos para aprender palabras nuevas.', '#3B82F6', 2),
  ('laberinto',    'Laberintos',      '🧩', 'Encuentra el camino y ayuda al personaje a llegar.',   '#10B981', 3),
  ('sopa_letras',  'Sopa de letras',  '🔤', 'Busca y encierra todas las palabras escondidas.',      '#8B5CF6', 4),
  ('unir_puntos',  'Unir puntos',     '🔢', 'Une los numeros en orden y descubre la figura.',      '#F59E0B', 5),
  ('cuento',       'Cuentos',         '📖', 'Pequeñas historias ilustradas para leer y escuchar.',  '#EC4899', 6)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      emoji = EXCLUDED.emoji,
      description = EXCLUDED.description,
      color = EXCLUDED.color,
      sort_order = EXCLUDED.sort_order;

-- 13. Seed de actividades de ejemplo (sin imagen, datos jugables en JSONB)
INSERT INTO kids_activities
  (category_slug, title, description, age_min, age_max, difficulty, is_free, is_published, tags, data)
SELECT * FROM (VALUES
  ('crucigrama', 'Animales de la granja', 'Descubre 4 animales de la granja.', 5, 8, 'facil', true, true,
    ARRAY['animales', 'granja']::TEXT[],
    '{"words":[{"answer":"VACA","clue":"Da leche y dice muuu"},{"answer":"PATO","clue":"Nada en el estanque y dice cuac"},{"answer":"GATO","clue":"Ronronea y caza ratones"},{"answer":"PERRO","clue":"El mejor amigo del hombre, dice guau"}]}'::jsonb),
  ('sopa_letras', 'Frutas divertidas', 'Encuentra 5 frutas en la sopa de letras.', 5, 9, 'facil', true, true,
    ARRAY['frutas', 'comida']::TEXT[],
    '{"words":["MANGO","PERA","UVA","KIWI","MORA"],"size":10}'::jsonb),
  ('laberinto', 'Ayuda al conejo', 'Guia al conejo hasta las zanahorias.', 4, 8, 'facil', true, true,
    ARRAY['animales', 'laberinto']::TEXT[],
    '{"cols":12,"rows":12,"seed":7}'::jsonb),
  ('unir_puntos', 'La estrella marina', 'Une los puntos del 1 al 12 y descubre la figura.', 4, 7, 'facil', true, true,
    ARRAY['formas', 'numeros']::TEXT[],
    '{"shape":"star","count":12}'::jsonb),
  ('unir_puntos', 'El cohete espacial', 'Une los puntos y viaja al espacio.', 5, 8, 'medio', true, true,
    ARRAY['espacio', 'numeros']::TEXT[],
    '{"shape":"rocket","count":16}'::jsonb),
  ('colorear', 'Estrella feliz', 'Pinta esta estrella con tus colores favoritos.', 3, 8, 'facil', true, true,
    ARRAY['formas', 'colorear']::TEXT[],
    '{"template":"star","regions":5}'::jsonb),
  ('colorear', 'Pecesito del mar', 'Colorea este pez y su burbuja.', 3, 8, 'facil', true, true,
    ARRAY['animales', 'mar']::TEXT[],
    '{"template":"fish","regions":6}'::jsonb),
  ('colorear', 'Casita del bosque', 'Pinta la casita y el sol.', 4, 8, 'facil', true, true,
    ARRAY['casa', 'colorear']::TEXT[],
    '{"template":"house","regions":6}'::jsonb),
  ('cuento', 'Tito el gatito viajero', 'Lee la historia de Tito y sus aventuras.', 4, 8, 'facil', true, true,
    ARRAY['animales', 'lectura']::TEXT[],
    '{"pages":[{"text":"Habia una vez un gatito llamado Tito que vivia en una casa azul.","emoji":"🐱"},{"text":"Un dia Tito decidio viajar y conocio a una mariposa muy simpatica.","emoji":"🦋"},{"text":"Juntos encontraron un jardin lleno de flores de colores.","emoji":"🌻"},{"text":"Tito volvio a casa feliz y conto todo lo que habia visto. Fin.","emoji":"🏡"}]}'::jsonb)
) AS seed(category_slug, title, description, age_min, age_max, difficulty, is_free, is_published, tags, data)
WHERE NOT EXISTS (
  SELECT 1 FROM kids_activities k
  WHERE k.title = seed.title AND k.user_id IS NULL
);

-- 14. Planes de Kids Club
INSERT INTO plans (name, price_cents, izipay_price_id, max_dogs, features, billing_interval,
                   application_id, landing_visible, landing_order, description, badge,
                   original_price_cents, landing_slug, cta_text)
SELECT
  'Kids Club Pro Trimestral',
  1990,
  'izipay_kids_quarterly',
  999,
  ARRAY[
    'Todas las laminas para colorear',
    'Crucigramas, laberintos y sopas de letras',
    'Cuentos ilustrados con lectura en voz alta',
    'Crea tus propios recursos con IA',
    'Sin anuncios y descargas ilimitadas'
  ],
  'quarter',
  (SELECT id FROM applications WHERE slug = 'kids' LIMIT 1),
  true,
  1,
  'Acceso completo a toda la biblioteca creativa para ninos',
  'Ahorra 60%',
  4990,
  'kids-web',
  'Suscribirme ahora'
WHERE NOT EXISTS (
  SELECT 1 FROM plans p
  WHERE p.landing_slug = 'kids-web'
);
