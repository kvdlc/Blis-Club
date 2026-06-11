-- Create quarterly plan ($1.00/quarter) if it doesn't exist
INSERT INTO plans (name, price_cents, izipay_price_id, max_dogs, features, billing_interval)
SELECT 'Pro Trimestral', 100, 'izipay_pro_quarterly', 999,
  ARRAY['Perros ilimitados', 'Recetario completo (150 recetas)', 'Generador de menús', 'Reto Detox 14 días', 'Todas las etapas Academia', 'Gráficos avanzados', 'Soporte prioritario'],
  'quarter'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE billing_interval = 'quarter');

-- Update existing monthly plan to be archival/hidden if needed (no action needed,
-- the frontend uses billing_interval to find the right plan)