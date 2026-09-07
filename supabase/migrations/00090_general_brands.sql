-- ============================================================
-- Batch 3: Marcas generales (makes + models)
-- ============================================================

INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Fiat', 'fiat', 'Italia'),
  ('Opel', 'opel', 'Alemania'),
  ('Seat', 'seat', 'España'),
  ('Skoda', 'skoda', 'República Checa'),
  ('Daihatsu', 'daihatsu', 'Japón'),
  ('Isuzu', 'isuzu', 'Japón'),
  ('SsangYong', 'ssangyong', 'Corea del Sur'),
  ('RAM', 'ram', 'EE.UU.'),
  ('Dodge', 'dodge', 'EE.UU.'),
  ('GMC', 'gmc', 'EE.UU.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('fiat', 'Argo', 'argo', 'auto'),
  ('fiat', 'Cronos', 'cronos', 'auto'),
  ('fiat', 'Mobi', 'mobi', 'auto'),
  ('fiat', 'Strada', 'strada', 'pickup'),
  ('fiat', 'Toro', 'toro', 'pickup'),
  ('opel', 'Corsa', 'corsa', 'auto'),
  ('opel', 'Mokka', 'mokka', 'suv'),
  ('opel', 'Crossland', 'crossland', 'suv'),
  ('seat', 'Ibiza', 'ibiza', 'auto'),
  ('seat', 'León', 'leon', 'auto'),
  ('seat', 'Ateca', 'ateca', 'suv'),
  ('seat', 'Arona', 'arona', 'suv'),
  ('skoda', 'Fabia', 'fabia', 'auto'),
  ('skoda', 'Octavia', 'octavia', 'auto'),
  ('skoda', 'Kamiq', 'kamiq', 'suv'),
  ('skoda', 'Kodiaq', 'kodiaq', 'suv'),
  ('daihatsu', 'Terios', 'terios', 'suv'),
  ('daihatsu', 'Sigra', 'sigra', 'auto'),
  ('isuzu', 'D-Max', 'd-max', 'pickup'),
  ('isuzu', 'MU-X', 'mu-x', 'suv'),
  ('ssangyong', 'Tivoli', 'tivoli', 'suv'),
  ('ssangyong', 'Korando', 'korando', 'suv'),
  ('ssangyong', 'Rexton', 'rexton', 'suv'),
  ('ram', '1500', 'ram-1500', 'pickup'),
  ('ram', '2500', 'ram-2500', 'pickup'),
  ('dodge', 'Journey', 'journey', 'suv'),
  ('dodge', 'Durango', 'durango', 'suv'),
  ('gmc', 'Sierra', 'sierra', 'pickup')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
