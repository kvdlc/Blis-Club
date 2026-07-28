-- Ejercicios ocultos por el usuario (no tiene esa máquina en su gym)
CREATE TABLE IF NOT EXISTS spartan_exercise_hidden (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES spartan_exercise_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE spartan_exercise_hidden ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hidden"
  ON spartan_exercise_hidden FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own hidden"
  ON spartan_exercise_hidden FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own hidden"
  ON spartan_exercise_hidden FOR DELETE
  USING (user_id = auth.uid());
