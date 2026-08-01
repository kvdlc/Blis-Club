-- Frases de seducción del usuario (favoritas y propias)
CREATE TABLE IF NOT EXISTS spartan_seduction_phrases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, text)
);

ALTER TABLE spartan_seduction_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own" ON spartan_seduction_phrases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert own" ON spartan_seduction_phrases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own" ON spartan_seduction_phrases FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "delete own" ON spartan_seduction_phrases FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_seduction_phrases_user ON spartan_seduction_phrases(user_id);
