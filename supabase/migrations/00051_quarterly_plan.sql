-- Create quarterly plan ($1.00/quarter) if it doesn't exist
INSERT INTO plans (name, price_cents, izipay_price_id, max_dogs, features, billing_interval, application_id)
SELECT 'Pro Trimestral', 100, 'izipay_pro_quarterly', 999,
  ARRAY['Perros ilimitados', 'Recetario completo (150 recetas)', 'Generador de menús', 'Reto Detox 14 días', 'Todas las etapas Academia', 'Gráficos avanzados', 'Soporte prioritario'],
  'quarter',
  (SELECT id FROM applications WHERE slug = 'guau' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE billing_interval = 'quarter');