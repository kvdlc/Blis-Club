-- ============================================================
-- Batch 1: Marcas chinas (makes + models)
-- ============================================================

INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Changan', 'changan', 'China'),
  ('Jetour', 'jetour', 'China'),
  ('Kaiyi', 'kaiyi', 'China'),
  ('GAC', 'gac', 'China'),
  ('Dongfeng', 'dongfeng', 'China'),
  ('FAW', 'faw', 'China'),
  ('BAIC', 'baic', 'China'),
  ('Maxus', 'maxus', 'China'),
  ('Seres', 'seres', 'China')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('changan', 'Alsvin', 'alsvin', 'auto'),
  ('changan', 'CS35 Plus', 'cs35-plus', 'suv'),
  ('changan', 'CS55 Plus', 'cs55-plus', 'suv'),
  ('changan', 'CS75 Plus', 'cs75-plus', 'suv'),
  ('changan', 'Hunter', 'changan-hunter', 'pickup'),
  ('jetour', 'X70', 'jetour-x70', 'suv'),
  ('jetour', 'X90', 'jetour-x90', 'suv'),
  ('jetour', 'Dashing', 'dashing', 'suv'),
  ('kaiyi', 'X3', 'kaiyi-x3', 'suv'),
  ('kaiyi', 'X7', 'kaiyi-x7', 'suv'),
  ('kaiyi', 'E5', 'kaiyi-e5', 'auto'),
  ('gac', 'GS3', 'gs3', 'suv'),
  ('gac', 'GS4', 'gs4', 'suv'),
  ('gac', 'Emkoo', 'emkoo', 'suv'),
  ('dongfeng', 'Glory 500', 'glory-500', 'suv'),
  ('dongfeng', 'Rich 6', 'rich-6', 'pickup'),
  ('dongfeng', 'Huge', 'dongfeng-huge', 'auto'),
  ('faw', 'Bestune T77', 'bestune-t77', 'suv'),
  ('faw', 'Bestune T55', 'bestune-t55', 'suv'),
  ('baic', 'X35', 'baic-x35', 'suv'),
  ('baic', 'BJ40', 'bj40', 'suv'),
  ('maxus', 'T60', 'maxus-t60', 'pickup'),
  ('maxus', 'D60', 'maxus-d60', 'suv'),
  ('seres', 'Seres 3', 'seres-3', 'auto')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
