-- ============================================================
-- Más años por modelo (2021, 2022, 2024, 2025) — modelos top
-- Duplica la spec base de cada modelo en esos años
-- ============================================================

DO $$
DECLARE
  r RECORD;
  y INT;
  years INT[] := ARRAY[2021, 2022, 2024, 2025];
  top_slugs TEXT[] := ARRAY[
    'corolla', 'yaris', 'raize', 'corolla-cross', 'hilux', 'rav4', 'etios', 'agya', 'avanza', 'fortuner',
    'accent', 'creta', 'tucson', 'grand-i10', 'hb20', 'elantra', 'kona',
    'rio', 'sportage', 'picanto', 'soluto', 'seltos', 'stonic', 'cerato',
    'swift', 'vitara', 'baleno', 'ciaz', 'ertiga', 'jimny', 'fronx',
    'onix', 'tracker', 'captiva', 'sail', 'spark-gt', 'groove',
    'versa', 'sentra', 'march', 'kicks', 'np300',
    'gol', 'virtus', 't-cross', 'nivus', 'jetta', 'saveiro',
    'duster', 'sandero', 'logan', 'stepway', 'kwid', 'captur',
    'mazda2', 'mazda3', 'cx-30', 'cx-5',
    'city', 'civic', 'cr-v', 'hr-v', 'fit',
    '208', '2008', '3008',
    'corolla', 'hilux'
  ];
BEGIN
  FOREACH y IN ARRAY years LOOP
    FOR r IN
      SELECT s.model_id, s.motor_nombre, s.tipo_combustible, s.rendimiento_km_l,
             s.capacidad_tanque_l, s.aceite_viscosidad, s.aceite_capacidad_l,
             s.refrigerante_tipo, s.refrigerante_capacidad_l, s.freno_tipo,
             s.psi_delante, s.psi_atras, s.psi_repuesto, s.octanaje_sugerido,
             s.bateria_kwh, s.autonomia_km
      FROM vehicle_catalog_specs s
      JOIN vehicle_catalog_models mo ON mo.id = s.model_id
      WHERE mo.slug = ANY(top_slugs) AND s.año = 2023
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM vehicle_catalog_specs
        WHERE model_id = r.model_id AND año = y AND motor_nombre = r.motor_nombre
      ) THEN
        INSERT INTO vehicle_catalog_specs (
          model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
          capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
          refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
          psi_delante, psi_atras, psi_repuesto, octanaje_sugerido,
          bateria_kwh, autonomia_km, verified
        ) VALUES (
          r.model_id, y, r.motor_nombre, r.tipo_combustible, r.rendimiento_km_l,
          r.capacidad_tanque_l, r.aceite_viscosidad, r.aceite_capacidad_l,
          r.refrigerante_tipo, r.refrigerante_capacidad_l, r.freno_tipo,
          r.psi_delante, r.psi_atras, r.psi_repuesto, r.octanaje_sugerido,
          r.bateria_kwh, r.autonomia_km, false
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
