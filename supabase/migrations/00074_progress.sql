-- Columnas para seguimiento post-entreno
ALTER TABLE spartan_workout_sessions ADD COLUMN IF NOT EXISTS gym_occupancy TEXT;
ALTER TABLE spartan_workout_sessions ADD COLUMN IF NOT EXISTS body_weight_kg NUMERIC(5,1);

-- Fotos de progreso semanal
CREATE TABLE IF NOT EXISTS spartan_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  weight_kg NUMERIC(5,1),
  week_start DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spartan_progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON spartan_progress_photos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own photos"
  ON spartan_progress_photos FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own photos"
  ON spartan_progress_photos FOR DELETE
  USING (user_id = auth.uid());

CREATE INDEX idx_progress_photos_user ON spartan_progress_photos(user_id, week_start DESC);
