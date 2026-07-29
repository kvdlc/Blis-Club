-- Plan de entrenamiento semanal del usuario
CREATE TABLE IF NOT EXISTS spartan_training_plan (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_type TEXT DEFAULT 'custom',
  custom_days TEXT[] DEFAULT '{}',
  target_sessions_per_week INTEGER DEFAULT 4,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_training_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own" ON spartan_training_plan FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert own" ON spartan_training_plan FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON spartan_training_plan FOR UPDATE USING (user_id = auth.uid());

-- Tamaño del contenedor de agua (tomatodo)
ALTER TABLE spartan_habits ADD COLUMN IF NOT EXISTS container_size NUMERIC(10,2);
ALTER TABLE spartan_habits ADD COLUMN IF NOT EXISTS container_label TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessions_user_started ON spartan_workout_sessions(user_id, started_at DESC);
