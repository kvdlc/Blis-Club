-- ============================================================
-- Seed: 20 modelos LATAM + variaciones (datos de referencia)
-- Idempotente: solo siembra si el catálogo está vacío
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM vehicle_catalog_makes LIMIT 1) THEN
    RETURN;
  END IF;

  -- Marcas
  INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
    ('Toyota', 'toyota', 'Japón'),
    ('Hyundai', 'hyundai', 'Corea del Sur'),
    ('Kia', 'kia', 'Corea del Sur'),
    ('Suzuki', 'suzuki', 'Japón'),
    ('Chevrolet', 'chevrolet', 'EE.UU.'),
    ('Nissan', 'nissan', 'Japón'),
    ('Chery', 'chery', 'China'),
    ('Shineray', 'shineray', 'China'),
    ('Jeep', 'jeep', 'EE.UU.'),
    ('Ford', 'ford', 'EE.UU.'),
    ('Honda', 'honda', 'Japón'),
    ('Yamaha', 'yamaha', 'Japón');

  -- Modelos
  INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo) VALUES
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Toyota'), 'Corolla', 'corolla', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Toyota'), 'Yaris', 'yaris', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Toyota'), 'Raize', 'raize', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Hyundai'), 'Accent', 'accent', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Kia'), 'Rio', 'rio', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Suzuki'), 'Swift', 'swift', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Chevrolet'), 'Onix', 'onix', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Nissan'), 'Versa', 'versa', 'auto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Hyundai'), 'Creta', 'creta', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Kia'), 'Sportage', 'sportage', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Toyota'), 'Corolla Cross', 'corolla-cross', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Chery'), 'Tiggo 4', 'tiggo-4', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Shineray'), 'SWM G01', 'swm-g01', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Suzuki'), 'Vitara', 'vitara', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Jeep'), 'Renegade', 'renegade', 'suv'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Toyota'), 'Hilux', 'hilux', 'pickup'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Nissan'), 'Frontier', 'frontier', 'pickup'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Ford'), 'Ranger', 'ranger', 'pickup'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Honda'), 'Wave 110', 'wave-110', 'moto'),
    ((SELECT id FROM vehicle_catalog_makes WHERE nombre='Yamaha'), 'FZ 2.5', 'fz-25', 'moto');

  -- Especificaciones (capacidad tanque en litros; rendimiento ref en km/L)
  INSERT INTO vehicle_catalog_specs (
    model_id, año, motor_nombre, tipo_combustible, rendimiento_km_l,
    capacidad_tanque_l, aceite_viscosidad, aceite_capacidad_l,
    refrigerante_tipo, refrigerante_capacidad_l, freno_tipo,
    psi_delante, psi_atras, psi_repuesto, octanaje_sugerido, verified
  ) VALUES
    ((SELECT id FROM vehicle_catalog_models WHERE slug='corolla'), 2023, '1.8 CVT', 'gasolina', 16.5, 50, '0W-20', 4.2, 'Toyota SLLC', 6.2, 'DOT 3', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='yaris'), 2023, '1.5', 'gasolina', 17.5, 42, '0W-20', 4.0, 'Toyota SLLC', 5.4, 'DOT 3', 33, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='raize'), 2023, '1.0T', 'gasolina', 18.0, 36, '0W-16', 3.3, 'Toyota SLLC', 5.0, 'DOT 3', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='accent'), 2022, '1.6', 'gasolina', 16.0, 45, '5W-30', 3.8, 'Etilenglicol', 5.8, 'DOT 3', 33, 32, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='rio'), 2022, '1.4', 'gasolina', 16.5, 45, '5W-30', 3.6, 'Etilenglicol', 5.5, 'DOT 3', 33, 32, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='swift'), 2023, '1.2', 'gasolina', 18.5, 37, '0W-16', 3.1, 'Suzuki LLC', 4.8, 'DOT 4', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='onix'), 2023, '1.0T', 'gasolina', 17.0, 44, '5W-30', 4.0, 'Dex-Cool', 5.5, 'DOT 4', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='versa'), 2023, '1.6', 'gasolina', 17.0, 41, '5W-30', 3.9, 'Nissan LLC', 5.2, 'DOT 3', 33, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='creta'), 2023, '2.0', 'gasolina', 14.5, 55, '5W-30', 4.5, 'Etilenglicol', 6.0, 'DOT 3', 33, 32, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='sportage'), 2023, '2.0', 'gasolina', 14.0, 62, '5W-30', 4.8, 'Etilenglicol', 7.0, 'DOT 4', 34, 33, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='corolla-cross'), 2023, '1.8', 'gasolina', 15.5, 47, '0W-20', 4.2, 'Toyota SLLC', 6.0, 'DOT 3', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='tiggo-4'), 2023, '1.5', 'gasolina', 15.0, 51, '5W-30', 4.0, 'Etilenglicol', 6.0, 'DOT 4', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='swm-g01'), 2022, '1.5T', 'gasolina', 13.5, 58, '5W-30', 4.0, 'Etilenglicol', 6.5, 'DOT 4', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='vitara'), 2023, '1.4T', 'gasolina', 15.5, 47, '5W-30', 3.9, 'Suzuki LLC', 5.8, 'DOT 4', 32, 30, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='renegade'), 2023, '1.8', 'gasolina', 13.0, 60, '5W-30', 4.3, 'Mopar OAT', 6.5, 'DOT 4', 35, 35, 60, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='hilux'), 2023, '2.4 Diesel', 'diesel', 12.5, 80, '5W-30', 7.5, 'Toyota SLLC', 10.0, 'DOT 4', 29, 29, 29, NULL, false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='hilux'), 2023, '2.7 Gasolina', 'gasolina', 10.5, 80, '5W-30', 5.8, 'Toyota SLLC', 9.0, 'DOT 4', 29, 29, 29, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='frontier'), 2023, '2.3 Diesel', 'diesel', 12.0, 73, '5W-30', 6.5, 'Nissan LLC', 8.5, 'DOT 4', 30, 30, 30, NULL, false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='ranger'), 2023, '2.0 Diesel', 'diesel', 12.0, 80, '5W-30', 6.0, 'Motorcraft', 9.0, 'DOT 4', 30, 30, 30, NULL, false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='wave-110'), 2023, '110cc', 'gasolina', 45.0, 3.7, '10W-30', 0.8, 'Etilenglicol', 0.9, 'DOT 4', 33, 33, 36, '90+ RON', false),
    ((SELECT id FROM vehicle_catalog_models WHERE slug='fz-25'), 2023, '150cc', 'gasolina', 40.0, 13.0, '10W-40', 1.0, 'Etilenglicol', 1.3, 'DOT 4', 29, 33, 33, '90+ RON', false);

END $$;
