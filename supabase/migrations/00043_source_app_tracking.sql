-- ============================================================
-- 43. SOURCE APP - Rastrear origen de registro de usuarios
-- ============================================================

-- Agregar columna source_app para saber desde qué landing/app se registró
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS source_app TEXT DEFAULT NULL;

-- Índice para filtrar por app de origen
CREATE INDEX IF NOT EXISTS idx_profiles_source_app ON profiles(source_app);

-- Actualizar usuarios existentes basados en sus suscripciones
UPDATE profiles
SET source_app = 'guau'
WHERE source_app IS NULL
  AND id IN (
    SELECT DISTINCT s.user_id 
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    JOIN applications a ON p.application_id = a.id
    WHERE a.slug = 'guau'
  );
