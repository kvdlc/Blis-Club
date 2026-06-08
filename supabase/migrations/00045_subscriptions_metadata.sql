-- ============================================================
-- 45. AGREGAR METADATA A SUBSCRIPTIONS + FIX PLAN_ID NULLABLE
-- ============================================================

-- 1. Agregar metadata JSONB a subscriptions (si no existe)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Permitir plan_id null (para suscripciones creadas sin plan específico, ej: admin panel)
ALTER TABLE subscriptions ALTER COLUMN plan_id DROP NOT NULL;
