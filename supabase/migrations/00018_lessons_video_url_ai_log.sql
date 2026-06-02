-- Migration: Add video_url to lessons table
-- Also create AI generations log table for audit

ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN lessons.video_url IS 'URL of explanatory video (YouTube, Vimeo, or direct MP4)';

-- Optional: log table for AI generation audit
CREATE TABLE IF NOT EXISTS ai_generations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gemini-2.5-pro',
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  tokens_input INT,
  tokens_output INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_gen_user ON ai_generations_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_gen_endpoint ON ai_generations_log(endpoint);
