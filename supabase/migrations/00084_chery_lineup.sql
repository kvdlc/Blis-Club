-- ============================================================
-- Expandir marca Chery (Tiggo + Arrizo + QQ)
-- ============================================================

DO $$
DECLARE
  v_make UUID;
BEGIN
  SELECT id INTO v_make FROM vehicle_catalog_makes WHERE nombre = 'Chery';
  IF v_make IS NULL THEN RETURN; END IF;

  INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo) VALUES
    (v_make, 'Tiggo 2 Pro', 'tiggo-2-pro', 'suv'),
    (v_make, 'Tiggo 4 Pro', 'tiggo-4-pro', 'suv'),
    (v_make, 'Tiggo 7 Pro', 'tiggo-7-pro', 'suv'),
    (v_make, 'Tiggo 7 Pro Max', 'tiggo-7-pro-max', 'suv'),
    (v_make, 'Tiggo 8 Pro', 'tiggo-8-pro', 'suv'),
    (v_make, 'Tiggo 8 Pro Max', 'tiggo-8-pro-max', 'suv'),
    (v_make, 'Arrizo 5 Pro', 'arrizo-5-pro', 'auto'),
    (v_make, 'Arrizo 6 Pro', 'arrizo-6-pro', 'auto'),
    (v_make, 'Arrizo 8', 'arrizo-8', 'auto'),
    (v_make, 'QQ', 'qq', 'auto')
  ON CONFLICT (make_id, nombre) DO NOTHING;
END $$;

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-2-pro'), 2023, '1.5', 'gasolina', 15.0, 45, '5W-30', 4.0, 'Etilenglicol', 5.5, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-2-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-4-pro'), 2023, '1.5T', 'gasolina', 14.5, 55, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-4-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-7-pro'), 2023, '1.5T', 'gasolina', 14.0, 55, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-7-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-7-pro-max'), 2023, '1.5T', 'gasolina', 13.5, 55, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-7-pro-max'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-8-pro'), 2023, '2.0T', 'gasolina', 12.0, 60, '5W-30', 4.5, 'Etilenglicol', 7.0, 'DOT 4', 33, 32, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-8-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-8-pro-max'), 2023, '2.0T', 'gasolina', 11.5, 60, '5W-30', 4.5, 'Etilenglicol', 7.0, 'DOT 4', 33, 32, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-8-pro-max'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-5-pro'), 2023, '1.5', 'gasolina', 16.0, 50, '5W-30', 3.8, 'Etilenglicol', 5.5, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-5-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-6-pro'), 2023, '1.5T', 'gasolina', 15.5, 50, '5W-30', 3.8, 'Etilenglicol', 5.5, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-6-pro'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-8'), 2023, '1.6T', 'gasolina', 15.0, 55, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='arrizo-8'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='qq'), 2023, '1.0', 'gasolina', 18.0, 35, '5W-30', 3.5, 'Etilenglicol', 4.5, 'DOT 4', 30, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='qq'));
