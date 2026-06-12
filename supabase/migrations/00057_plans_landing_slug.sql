-- Enhanced plans table for multi-landing, pricing display, and payment gateway support
-- Replaces simple landing_visible/landing_order with landing_slug-based system

-- Add original price (for strikethrough display)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS original_price_cents INT;
-- Add landing slug (which landing page shows this plan, e.g. 'guau-web', 'guau-webg', 'cafecito')
ALTER TABLE plans ADD COLUMN IF NOT EXISTS landing_slug TEXT;
-- Add payment provider (e.g. 'izipay', 'stripe', 'paypal')
ALTER TABLE plans ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'izipay';
-- Add CTA button text (e.g. 'Suscribirme ahora', 'Empezar gratis')
ALTER TABLE plans ADD COLUMN IF NOT EXISTS cta_text TEXT;

-- Update existing quarterly plan with proper landing config
UPDATE plans
SET landing_visible = true,
    landing_order = 1,
    landing_slug = 'guau-web',
    original_price_cents = 4999,
    badge = 'Ahorra 80%',
    description = 'Acceso completo a nutrición, academia y tracker',
    cta_text = 'Suscribirme ahora'
WHERE billing_interval = 'quarter' AND application_id = (SELECT id FROM applications WHERE slug = 'guau' LIMIT 1);

-- Create index for landing queries
CREATE INDEX IF NOT EXISTS idx_plans_landing_slug ON plans(landing_slug) WHERE landing_visible = true;