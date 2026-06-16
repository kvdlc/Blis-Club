-- Badges for Auto app
CREATE TABLE IF NOT EXISTS auto_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

ALTER TABLE auto_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON auto_badges FOR SELECT
  USING (user_id = auth.uid());
