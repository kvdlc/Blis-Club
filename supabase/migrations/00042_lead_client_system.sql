-- ============================================================
-- 42. SISTEMA DE LEADS / CLIENTES
-- Agrega is_lead a profiles para distinguir registros de pago
-- ============================================================

-- 1. Agregar columna is_lead
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_lead BOOLEAN DEFAULT true;

-- 2. Índice para filtrar rápido
CREATE INDEX IF NOT EXISTS idx_profiles_is_lead ON profiles(is_lead);

-- 3. Marcar usuarios existentes con suscripción activa como clientes
UPDATE profiles
SET is_lead = false
WHERE id IN (
  SELECT DISTINCT user_id FROM subscriptions WHERE status = 'active'
);

-- 4. Actualizar RLS para que leads vean su propio perfil
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON profiles;
CREATE POLICY "Usuarios ven su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios actualizan su propio perfil" ON profiles;
CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
