-- ============================================================
-- Batch 2: Marcas premium (makes + models)
-- ============================================================

INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Audi', 'audi', 'Alemania'),
  ('BMW', 'bmw', 'Alemania'),
  ('Mercedes-Benz', 'mercedes-benz', 'Alemania'),
  ('Volvo', 'volvo', 'Suecia'),
  ('Lexus', 'lexus', 'Japón'),
  ('Porsche', 'porsche', 'Alemania')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('audi', 'A3', 'audi-a3', 'auto'),
  ('audi', 'A4', 'audi-a4', 'auto'),
  ('audi', 'Q3', 'audi-q3', 'suv'),
  ('audi', 'Q5', 'audi-q5', 'suv'),
  ('audi', 'Q7', 'audi-q7', 'suv'),
  ('bmw', 'Serie 3', 'serie-3', 'auto'),
  ('bmw', 'Serie 5', 'serie-5', 'auto'),
  ('bmw', 'X1', 'bmw-x1', 'suv'),
  ('bmw', 'X3', 'bmw-x3', 'suv'),
  ('bmw', 'X5', 'bmw-x5', 'suv'),
  ('mercedes-benz', 'Clase A', 'clase-a', 'auto'),
  ('mercedes-benz', 'Clase C', 'clase-c', 'auto'),
  ('mercedes-benz', 'GLA', 'gla', 'suv'),
  ('mercedes-benz', 'GLC', 'glc', 'suv'),
  ('mercedes-benz', 'GLE', 'gle', 'suv'),
  ('volvo', 'XC40', 'xc40', 'suv'),
  ('volvo', 'XC60', 'xc60', 'suv'),
  ('volvo', 'XC90', 'xc90', 'suv'),
  ('lexus', 'UX', 'lexus-ux', 'suv'),
  ('lexus', 'NX', 'lexus-nx', 'suv'),
  ('lexus', 'RX', 'lexus-rx', 'suv'),
  ('lexus', 'ES', 'lexus-es', 'auto'),
  ('porsche', 'Macan', 'macan', 'suv'),
  ('porsche', 'Cayenne', 'cayenne', 'suv'),
  ('porsche', '911', 'porsche-911', 'auto')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
