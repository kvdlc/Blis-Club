-- ============================================================
-- 44. PLAN TYPES Y EXPIRACION
-- ============================================================

-- 1. Agregar plan_type a subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'temporal';
-- Valores: 'temporal', 'premium', 'permanente'

-- 2. Agregar expires_at para planes temporales
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 4. Actualizar suscripciones existentes
UPDATE subscriptions
SET plan_type = 'premium'
WHERE status = 'active' AND plan_type = 'temporal'
  AND current_period_end IS NOT NULL;

-- 5. Actualizar leads: is_lead = false por defecto, solo true si expiró
UPDATE profiles
SET is_lead = false
WHERE is_lead IS NULL;

-- 6. Si un usuario tiene suscripción activa temporal, setear expires_at si está vacío
UPDATE subscriptions
SET expires_at = created_at + INTERVAL '60 days'
WHERE plan_type = 'temporal' AND expires_at IS NULL;
