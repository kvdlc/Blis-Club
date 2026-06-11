ALTER TABLE payment_tokens ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_payment_tokens_user_active ON payment_tokens(user_id, is_active) WHERE is_active = true;