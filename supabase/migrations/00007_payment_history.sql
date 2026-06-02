-- ============================================================
-- 07. HISTORIAL DE COBROS
-- ============================================================

-- Nueva tabla: historial de pagos de suscripción
CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES plans(id),
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'succeeded', -- 'succeeded', 'failed', 'refunded', 'pending', 'disputed'
  payment_method TEXT DEFAULT 'card', -- 'card', 'yape', 'plin', 'transfer', 'paypal'
  description TEXT,
  izipay_transaction_id TEXT,
  receipt_url TEXT,
  refunded_amount_cents INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users ven sus pagos" ON subscription_payments;
CREATE POLICY "Users ven sus pagos" ON subscription_payments FOR SELECT USING (auth.uid() = user_id);

-- Índice útil para consultas
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_created ON subscription_payments(user_id, created_at DESC);
