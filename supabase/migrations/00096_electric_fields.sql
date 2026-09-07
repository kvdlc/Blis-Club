-- ============================================================
-- Campos eléctricos (batería kWh + autonomía km) + Tesla
-- ============================================================

ALTER TABLE vehicle_catalog_specs ADD COLUMN IF NOT EXISTS bateria_kwh NUMERIC(6,1);
ALTER TABLE vehicle_catalog_specs ADD COLUMN IF NOT EXISTS autonomia_km INTEGER;

-- Tesla
INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES ('Tesla', 'tesla', 'EE.UU.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  ('tesla', 'Model 3', 'tesla-model-3', 'auto'),
  ('tesla', 'Model Y', 'tesla-model-y', 'suv'),
  ('tesla', 'Model S', 'tesla-model-s', 'auto'),
  ('tesla', 'Model X', 'tesla-model-x', 'suv')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible,
  aceite_viscosidad, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido,
  bateria_kwh, autonomia_km, verified
)
SELECT m.id, v.año::int, v.motor, v.comb,
       NULLIF(v.aceite, ''), 'DOT 4',
       NULLIF(v.psid, '')::int, NULLIF(v.psia, '')::int, NULLIF(v.psir, '')::int, NULLIF(v.oct, ''),
       NULLIF(v.bat, '')::numeric, NULLIF(v.auto, '')::int, false
FROM (VALUES
  ('tesla-model-3', '2023', 'Eléctrico RWD', 'electrico', '', '42', '42', '60', '', '60', '450'),
  ('tesla-model-y', '2023', 'Eléctrico', 'electrico', '', '42', '42', '60', '', '60', '430'),
  ('tesla-model-s', '2023', 'Eléctrico Plaid', 'electrico', '', '42', '42', '60', '', '100', '600'),
  ('tesla-model-x', '2023', 'Eléctrico', 'electrico', '', '42', '42', '60', '', '100', '540')
) AS v(slug, año, motor, comb, aceite, psid, psia, psir, oct, bat, auto)
JOIN vehicle_catalog_models m ON m.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs s WHERE s.model_id = m.id AND s.motor_nombre = v.motor);

-- Actualizar datos de batería para BYD
UPDATE vehicle_catalog_specs s SET bateria_kwh = 60, autonomia_km = 427
  WHERE s.model_id = (SELECT id FROM vehicle_catalog_models WHERE slug = 'dolphin') AND s.tipo_combustible = 'electrico';
UPDATE vehicle_catalog_specs s SET bateria_kwh = 82, autonomia_km = 520
  WHERE s.model_id = (SELECT id FROM vehicle_catalog_models WHERE slug = 'seal') AND s.tipo_combustible = 'electrico';
UPDATE vehicle_catalog_specs s SET bateria_kwh = 60, autonomia_km = 420
  WHERE s.model_id = (SELECT id FROM vehicle_catalog_models WHERE slug = 'yuan-plus') AND s.tipo_combustible = 'electrico';
UPDATE vehicle_catalog_specs s SET bateria_kwh = 18.3, autonomia_km = 110
  WHERE s.model_id = (SELECT id FROM vehicle_catalog_models WHERE slug = 'song-plus') AND s.tipo_combustible = 'hibrido';

-- Seres
UPDATE vehicle_catalog_specs s SET bateria_kwh = 53.6, autonomia_km = 401
  WHERE s.model_id = (SELECT id FROM vehicle_catalog_models WHERE slug = 'seres-3') AND s.tipo_combustible = 'electrico';
