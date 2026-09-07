-- ============================================================
-- Batch 5: Marcas restantes (premium europeo, indias, motos)
-- ============================================================

INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Land Rover', 'land-rover', 'Reino Unido'),
  ('Jaguar', 'jaguar', 'Reino Unido'),
  ('Alfa Romeo', 'alfa-romeo', 'Italia'),
  ('Mini', 'mini', 'Reino Unido'),
  ('Tata', 'tata', 'India'),
  ('Mahindra', 'mahindra', 'India'),
  ('Cadillac', 'cadillac', 'EE.UU.'),
  ('Genesis', 'genesis', 'Corea del Sur'),
  ('Lynk & Co', 'lynk-co', 'China'),
  ('Hero', 'hero', 'India'),
  ('Vespa', 'vespa', 'Italia'),
  ('Aprilia', 'aprilia', 'Italia'),
  ('Ducati', 'ducati', 'Italia'),
  ('Triumph', 'triumph', 'Reino Unido'),
  ('Benelli', 'benelli', 'Italia')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('land-rover', 'Defender', 'defender', 'suv'),
  ('land-rover', 'Range Rover', 'range-rover', 'suv'),
  ('land-rover', 'Range Rover Evoque', 'range-rover-evoque', 'suv'),
  ('land-rover', 'Discovery', 'discovery', 'suv'),
  ('jaguar', 'F-Pace', 'f-pace', 'suv'),
  ('jaguar', 'E-Pace', 'e-pace', 'suv'),
  ('jaguar', 'XF', 'xf', 'auto'),
  ('jaguar', 'XE', 'xe', 'auto'),
  ('alfa-romeo', 'Giulia', 'giulia', 'auto'),
  ('alfa-romeo', 'Stelvio', 'stelvio', 'suv'),
  ('alfa-romeo', 'Tonale', 'tonale', 'suv'),
  ('mini', 'Cooper', 'mini-cooper', 'auto'),
  ('mini', 'Countryman', 'countryman', 'suv'),
  ('tata', 'Nexon', 'nexon', 'suv'),
  ('tata', 'Tiago', 'tiago', 'auto'),
  ('tata', 'Harrier', 'harrier', 'suv'),
  ('mahindra', 'XUV300', 'xuv300', 'suv'),
  ('mahindra', 'Scorpio', 'scorpio', 'suv'),
  ('mahindra', 'Thar', 'thar', 'suv'),
  ('cadillac', 'Escalade', 'escalade', 'suv'),
  ('cadillac', 'XT5', 'xt5', 'suv'),
  ('genesis', 'GV70', 'gv70', 'suv'),
  ('genesis', 'GV80', 'gv80', 'suv'),
  ('genesis', 'G80', 'genesis-g80', 'auto'),
  ('lynk-co', '01', 'lynk-co-01', 'suv'),
  ('lynk-co', '03', 'lynk-co-03', 'auto'),
  ('lynk-co', '05', 'lynk-co-05', 'suv'),
  ('hero', 'Splendor Plus', 'splendor-plus', 'moto'),
  ('hero', 'Hunk 150', 'hunk-150', 'moto'),
  ('hero', 'XPulse 200', 'xpulse-200', 'moto'),
  ('vespa', 'GTS 300', 'gts-300', 'moto'),
  ('vespa', 'Primavera 150', 'primavera-150', 'moto'),
  ('aprilia', 'RS 660', 'rs-660', 'moto'),
  ('aprilia', 'Tuono 660', 'tuono-660', 'moto'),
  ('aprilia', 'SR 160', 'sr-160', 'moto'),
  ('ducati', 'Monster', 'monster', 'moto'),
  ('ducati', 'Scrambler', 'scrambler', 'moto'),
  ('ducati', 'Multistrada V2', 'multistrada-v2', 'moto'),
  ('triumph', 'Street Triple', 'street-triple', 'moto'),
  ('triumph', 'Tiger 900', 'tiger-900', 'moto'),
  ('triumph', 'Bonneville T100', 'bonneville-t100', 'moto'),
  ('benelli', 'TNT 300', 'tnt-300', 'moto'),
  ('benelli', 'TRK 502', 'trk-502', 'moto'),
  ('benelli', 'Leoncino 500', 'leoncino-500', 'moto'),
  -- Suzuki motos (make ya existe)
  ('suzuki', 'GSX-R150', 'gsx-r150', 'moto'),
  ('suzuki', 'V-Strom 250', 'v-strom-250', 'moto'),
  ('suzuki', 'DR 650', 'dr-650', 'moto'),
  -- Honda motos (make ya existe)
  ('honda', 'CB 190', 'cb-190', 'moto'),
  ('honda', 'XR 190', 'xr-190', 'moto'),
  ('honda', 'GLH 150', 'glh-150', 'moto')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
