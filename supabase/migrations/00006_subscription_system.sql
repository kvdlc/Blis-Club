-- ============================================================
-- 06. SISTEMA DE SUSCRIPCION Y REFERIDOS
-- ============================================================

-- 1. Agregar billing_interval a plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'month';

-- 2. Nueva tabla: tokens de tarjeta (para cobros recurrentes futuros)
CREATE TABLE IF NOT EXISTS payment_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  card_token TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_expiry TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users ven sus tokens" ON payment_tokens;
CREATE POLICY "Users ven sus tokens" ON payment_tokens FOR SELECT USING (auth.uid() = user_id);

-- 3. Nueva tabla: referidos
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES profiles(id),
  referred_user_id UUID REFERENCES profiles(id),
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_type TEXT DEFAULT 'time',
  reward_granted BOOLEAN DEFAULT false,
  cash_reward_usd INT DEFAULT 0,
  months_rewarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users ven sus referidos" ON referrals;
CREATE POLICY "Users ven sus referidos" ON referrals FOR SELECT USING (auth.uid() = referrer_user_id);

-- 4. Nueva tabla: billetera de recompensas
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_cash_usd INT DEFAULT 0,
  total_months_free INT DEFAULT 0,
  available_cash_usd INT DEFAULT 0,
  default_reward_mode TEXT DEFAULT 'time',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users ven su billetera" ON user_rewards;
CREATE POLICY "Users ven su billetera" ON user_rewards FOR SELECT USING (auth.uid() = user_id);

-- 5. Nueva tabla: solicitudes de retiro
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_usd INT NOT NULL,
  method TEXT NOT NULL,
  account_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users ven sus retiros" ON withdrawal_requests;
CREATE POLICY "Users ven sus retiros" ON withdrawal_requests FOR SELECT USING (auth.uid() = user_id);
