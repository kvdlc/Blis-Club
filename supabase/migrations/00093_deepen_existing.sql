-- ============================================================
-- Profundizar marcas top: más variaciones de motor/combustible
-- ============================================================

INSERT INTO vehicle_catalog_specs (
  model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
  capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
  refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
  psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
)
SELECT m.id, v.año::int, v.motor, v.comb,
       NULLIF(v.rend, '')::numeric, NULLIF(v.tanque, '')::numeric,
       NULLIF(v.aceite, ''), NULLIF(v.acap, '')::numeric,
       'Etilenglicol', NULLIF(v.rcap, '')::numeric, 'DOT 4',
       NULLIF(v.psid, '')::int, NULLIF(v.psia, '')::int, NULLIF(v.psir, '')::int,
       NULLIF(v.oct, ''), false
FROM (VALUES
  -- Toyota (híbridos y diésel)
  ('corolla', '2023', '2.0 Hybrid', 'hibrido', '22', '43', '0W-16', '4.5', '5.5', '32', '30', '60', '90+ RON'),
  ('corolla-cross', '2023', '1.8 Hybrid', 'hibrido', '20', '43', '0W-16', '4.2', '5.5', '32', '30', '60', '90+ RON'),
  ('rav4', '2023', '2.5 Hybrid', 'hibrido', '18', '55', '0W-16', '4.7', '6.5', '32', '30', '60', '90+ RON'),
  ('hilux', '2023', '2.8 Diesel', 'diesel', '11.5', '80', '5W-30', '7.5', '10', '29', '29', '29', ''),
  ('fortuner', '2023', '2.8 Diesel', 'diesel', '11', '80', '5W-30', '7.0', '9.0', '29', '29', '29', ''),
  -- Hyundai
  ('creta', '2023', '1.6', 'gasolina', '14.5', '55', '5W-30', '4.0', '6.0', '33', '32', '60', '90+ RON'),
  ('tucson', '2023', '2.0 Diesel', 'diesel', '12', '62', '5W-30', '6.5', '7.0', '33', '32', '60', ''),
  ('santa-fe', '2023', '2.2 Diesel', 'diesel', '11.5', '71', '5W-30', '6.5', '8.0', '33', '32', '60', ''),
  -- Kia
  ('seltos', '2023', '1.6', 'gasolina', '14.5', '50', '5W-30', '4.0', '6.0', '33', '32', '60', '90+ RON'),
  ('sportage', '2023', '2.0 Diesel', 'diesel', '12', '62', '5W-30', '6.0', '7.0', '34', '33', '60', ''),
  -- Nissan
  ('kicks', '2023', '1.6 e-POWER', 'hibrido', '20', '41', '0W-20', '4.0', '5.5', '32', '30', '60', '90+ RON'),
  -- Suzuki
  ('swift', '2023', '1.4T Sport', 'gasolina', '15', '37', '0W-20', '3.5', '4.8', '32', '30', '60', '90+ RON'),
  ('vitara', '2023', '1.4T AWD', 'gasolina', '15', '47', '5W-30', '3.9', '5.8', '32', '30', '60', '90+ RON'),
  -- Chevrolet
  ('tracker', '2023', '1.2T AWD', 'gasolina', '15.5', '44', '5W-30', '4.0', '5.5', '32', '30', '60', '90+ RON'),
  -- Jeep
  ('compass', '2023', '2.0 Diesel', 'diesel', '12', '60', '5W-30', '5.0', '7.0', '33', '32', '60', ''),
  -- Mazda
  ('cx-5', '2023', '2.5 Turbo', 'gasolina', '11.5', '58', '0W-20', '4.5', '7.0', '33', '32', '60', '90+ RON'),
  -- Mitsubishi
  ('l200', '2023', '2.4 Diesel 4WD', 'diesel', '10.5', '75', '5W-30', '6.5', '9.0', '30', '30', '30', ''),
  -- Ford
  ('ranger', '2023', '2.0 Diesel 4WD', 'diesel', '11.5', '80', '5W-30', '6.0', '9.0', '30', '30', '30', ''),
  -- VW
  ('amarok', '2023', '3.0 V6 Diesel', 'diesel', '10', '80', '5W-40', '7.0', '10', '30', '30', '30', ''),
  -- Chery
  ('tiggo-8-pro', '2023', '2.0T AWD', 'gasolina', '11.5', '60', '5W-30', '4.5', '7.0', '33', '32', '60', '90+ RON')
) AS v(slug, año, motor, comb, rend, tanque, aceite, acap, rcap, psid, psia, psir, oct)
JOIN vehicle_catalog_models m ON m.slug = v.slug
WHERE NOT EXISTS (SELECT 1 FROM vehicle_catalog_specs s WHERE s.model_id = m.id AND s.motor_nombre = v.motor);
