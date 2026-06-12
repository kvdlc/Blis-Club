-- Add landing visibility and ordering to plans table
-- Allows backend control of which plans appear on landing pages and in what order

ALTER TABLE plans ADD COLUMN IF NOT EXISTS landing_visible BOOLEAN DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS landing_order INT DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS badge TEXT;

-- Make quarterly plan visible on landing with order 1
UPDATE plans SET landing_visible = true, landing_order = 1 WHERE billing_interval = 'quarter';