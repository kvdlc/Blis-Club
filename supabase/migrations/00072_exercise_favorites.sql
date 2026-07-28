-- Ejercicios favoritos del usuario (los que puede hacer en su gym)
CREATE TABLE IF NOT EXISTS spartan_exercise_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES spartan_exercise_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE spartan_exercise_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON spartan_exercise_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON spartan_exercise_favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON spartan_exercise_favorites FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_favorites_user ON spartan_exercise_favorites(user_id);

-- Configuración por defecto de cada ejercicio para un usuario
CREATE TABLE IF NOT EXISTS spartan_exercise_configs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES spartan_exercise_library(id) ON DELETE CASCADE,
  default_sets INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  default_weight_kg NUMERIC(6,1),
  default_rest_seconds INTEGER DEFAULT 60,
  machine_name TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE spartan_exercise_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own configs"
  ON spartan_exercise_configs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own configs"
  ON spartan_exercise_configs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own configs"
  ON spartan_exercise_configs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own configs"
  ON spartan_exercise_configs FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_configs_user ON spartan_exercise_configs(user_id);

-- Agregar columna exercise_library_id a los ejercicios de rutina
ALTER TABLE spartan_workout_exercises ADD COLUMN IF NOT EXISTS exercise_library_id UUID REFERENCES spartan_exercise_library(id) ON DELETE SET NULL;

-- Agregar registro de pesos por serie en las sesiones
ALTER TABLE spartan_workout_sessions ADD COLUMN IF NOT EXISTS series_data JSONB DEFAULT '[]';
