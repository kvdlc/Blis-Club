-- ============================================================
-- Batch 4: Marcas de motos (makes + models)
-- ============================================================

INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Bajaj', 'bajaj', 'India'),
  ('KTM', 'ktm', 'Austria'),
  ('Kawasaki', 'kawasaki', 'Japón'),
  ('TVS', 'tvs', 'India'),
  ('Royal Enfield', 'royal-enfield', 'India'),
  ('Haojue', 'haojue', 'China')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('bajaj', 'Boxer 100', 'boxer-100', 'moto'),
  ('bajaj', 'Discover 125', 'discover-125', 'moto'),
  ('bajaj', 'Pulsar NS200', 'pulsar-ns200', 'moto'),
  ('bajaj', 'Dominar 400', 'dominar-400', 'moto'),
  ('ktm', 'Duke 200', 'duke-200', 'moto'),
  ('ktm', 'Duke 390', 'duke-390', 'moto'),
  ('ktm', 'Adventure 390', 'adventure-390', 'moto'),
  ('kawasaki', 'Ninja 400', 'ninja-400', 'moto'),
  ('kawasaki', 'Versys 300', 'versys-300', 'moto'),
  ('kawasaki', 'KLX 300', 'klx-300', 'moto'),
  ('tvs', 'Raider 125', 'raider-125', 'moto'),
  ('tvs', 'Apache 160', 'apache-160', 'moto'),
  ('royal-enfield', 'Classic 350', 'classic-350', 'moto'),
  ('royal-enfield', 'Himalayan', 'himalayan', 'moto'),
  ('haojue', 'DK 150', 'dk-150', 'moto'),
  ('haojue', 'NS 150', 'ns-150', 'moto')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
