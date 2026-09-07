-- ============================================================
-- Expandir marca Shineray (SWM + utilitarios) + tipo "furgoneta"
-- ============================================================

-- 1. Añadir 'furgoneta' al enum de tipo_vehiculo
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_tipo_vehiculo_check;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_tipo_vehiculo_check
  CHECK (tipo_vehiculo IN ('auto', 'suv', 'pickup', 'moto', 'furgoneta'));

ALTER TABLE vehicle_catalog_models DROP CONSTRAINT IF EXISTS vehicle_catalog_models_tipo_vehiculo_check;
ALTER TABLE vehicle_catalog_models ADD CONSTRAINT vehicle_catalog_models_tipo_vehiculo_check
  CHECK (tipo_vehiculo IN ('auto', 'suv', 'pickup', 'moto', 'furgoneta'));

-- 2. Modelos Shineray
DO $$
DECLARE
  v_make UUID;
BEGIN
  SELECT id INTO v_make FROM vehicle_catalog_makes WHERE nombre = 'Shineray';
  IF v_make IS NULL THEN RETURN; END IF;

  INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo) VALUES
    (v_make, 'SWM G01F', 'swm-g01f', 'suv'),
    (v_make, 'SWM G03', 'swm-g03', 'suv'),
    (v_make, 'SWM G03F', 'swm-g03f', 'suv'),
    (v_make, 'SWM G05', 'swm-g05', 'suv'),
    (v_make, 'X30', 'x30', 'furgoneta'),
    (v_make, 'X30 Plus', 'x30-plus', 'furgoneta'),
    (v_make, 'T30', 't30', 'furgoneta'),
    (v_make, 'Lucky', 'lucky', 'auto')
  ON CONFLICT (make_id, nombre) DO NOTHING;
END $$;

-- 3. Especificaciones (referencia; verified=false)
INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g01f'), 2023, '1.5T', 'gasolina', 13.0, 58, '5W-30', 4.0, 'Etilenglicol', 6.5, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g01f'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g03'), 2023, '1.5T', 'gasolina', 13.5, 55, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g03'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g03f'), 2023, '1.5', 'gasolina', 14.0, 55, '5W-30', 3.8, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g03f'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g05'), 2023, '1.5T', 'gasolina', 12.5, 60, '5W-30', 4.2, 'Etilenglicol', 7.0, 'DOT 4', 32, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='swm-g05'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='x30'), 2023, '1.3', 'gasolina', 15.0, 45, '10W-40', 3.5, 'Etilenglicol', 5.0, 'DOT 4', 35, 35, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='x30'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='x30-plus'), 2023, '1.5', 'gasolina', 14.0, 45, '10W-40', 3.8, 'Etilenglicol', 5.0, 'DOT 4', 35, 35, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='x30-plus'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='t30'), 2023, '1.3', 'gasolina', 14.5, 45, '10W-40', 3.5, 'Etilenglicol', 5.0, 'DOT 4', 35, 35, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='t30'));

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT (SELECT id FROM vehicle_catalog_models WHERE slug='lucky'), 2023, '1.0', 'gasolina', 16.0, 40, '5W-30', 3.5, 'Etilenglicol', 4.5, 'DOT 4', 30, 30, 60, '90+ RON', false
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs WHERE model_id = (SELECT id FROM vehicle_catalog_models WHERE slug='lucky'));
