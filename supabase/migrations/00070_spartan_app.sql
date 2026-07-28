-- Insertar la aplicacion "Spartan" en el ecosistema Blis Club
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM applications WHERE slug = 'Spartan') THEN
    INSERT INTO applications (name, slug, description, is_active, theme_color, icon_url)
    VALUES ('Spartan', 'Spartan', 'App de crecimiento personal para hombres: hábitos, gimnasio, motivación y disciplina.', true, '#dc2626', '/icons/spartan.png');
  END IF;
END $$;

-- ═══════════════════════════════════════════
-- Recursos de motivación (libros, videos, películas)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_motivation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('book', 'video', 'movie')),
  category TEXT NOT NULL DEFAULT 'motivacion' CHECK (category IN ('motivacion', 'seduccion', 'negocios', 'disciplina', 'otro')),
  author TEXT,
  url TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_motivation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own motivation items"
  ON spartan_motivation_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own motivation items"
  ON spartan_motivation_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own motivation items"
  ON spartan_motivation_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own motivation items"
  ON spartan_motivation_items FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_motivation_user ON spartan_motivation_items(user_id, type, completed);

-- ═══════════════════════════════════════════
-- Rutinas de gimnasio
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_workout_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_workout_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON spartan_workout_routines FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own routines"
  ON spartan_workout_routines FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own routines"
  ON spartan_workout_routines FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own routines"
  ON spartan_workout_routines FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_routines_user ON spartan_workout_routines(user_id, is_active);

-- ═══════════════════════════════════════════
-- Ejercicios dentro de cada rutina
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES spartan_workout_routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  weight_kg NUMERIC(6,1),
  rest_seconds INTEGER DEFAULT 60,
  sort_order INTEGER DEFAULT 0,
  gif_url TEXT,
  machine_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_workout_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercises"
  ON spartan_workout_exercises FOR SELECT
  USING (routine_id IN (SELECT id FROM spartan_workout_routines WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own exercises"
  ON spartan_workout_exercises FOR INSERT
  WITH CHECK (routine_id IN (SELECT id FROM spartan_workout_routines WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own exercises"
  ON spartan_workout_exercises FOR UPDATE
  USING (routine_id IN (SELECT id FROM spartan_workout_routines WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own exercises"
  ON spartan_workout_exercises FOR DELETE
  USING (routine_id IN (SELECT id FROM spartan_workout_routines WHERE user_id = auth.uid()));

CREATE INDEX idx_exercises_routine ON spartan_workout_exercises(routine_id, sort_order);

-- ═══════════════════════════════════════════
-- Sesiones de entrenamiento completadas
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES spartan_workout_routines(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  photo_url TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON spartan_workout_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON spartan_workout_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON spartan_workout_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON spartan_workout_sessions FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_sessions_user ON spartan_workout_sessions(user_id, started_at DESC);

-- ═══════════════════════════════════════════
-- Mediciones corporales y fotos de progreso
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_workout_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,1),
  body_fat_pct NUMERIC(4,1),
  chest_cm NUMERIC(5,1),
  waist_cm NUMERIC(5,1),
  arms_cm NUMERIC(5,1),
  legs_cm NUMERIC(5,1),
  photo_url TEXT,
  notes TEXT,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_workout_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own measurements"
  ON spartan_workout_measurements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own measurements"
  ON spartan_workout_measurements FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own measurements"
  ON spartan_workout_measurements FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own measurements"
  ON spartan_workout_measurements FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_measurements_user ON spartan_workout_measurements(user_id, measured_at DESC);

-- ═══════════════════════════════════════════
-- Definiciones de hábitos
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'check' CHECK (type IN ('check', 'counter', 'currency_income', 'currency_expense', 'measure')),
  unit TEXT,
  target_value NUMERIC(10,2),
  color TEXT DEFAULT '#dc2626',
  icon TEXT DEFAULT 'CheckSquare',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON spartan_habits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own habits"
  ON spartan_habits FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits"
  ON spartan_habits FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habits"
  ON spartan_habits FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_habits_user ON spartan_habits(user_id, is_active, sort_order);

-- ═══════════════════════════════════════════
-- Registros diarios de hábitos
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS spartan_habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES spartan_habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC(10,2),
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

ALTER TABLE spartan_habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON spartan_habit_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entries"
  ON spartan_habit_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
  ON spartan_habit_entries FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own entries"
  ON spartan_habit_entries FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_entries_user_date ON spartan_habit_entries(user_id, date DESC);
CREATE INDEX idx_entries_habit ON spartan_habit_entries(habit_id, date DESC);

-- ═══════════════════════════════════════════
-- Bucket para fotos de Spartan
-- ═══════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('spartan_photos', 'spartan_photos', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Users can view own spartan photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'spartan_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own spartan photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'spartan_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own spartan photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'spartan_photos' AND auth.uid()::text = (storage.foldername(name))[1]);
