DO $$
DECLARE
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_dog1_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'LUNA';

  -- PASEOS MAX (21)
  INSERT INTO walks (dog_id, start_time, duration_sec, traffic_light, pipi_count, popo_count, stool_rating, trigger_tags) VALUES
  (v_dog1_id, (v_today-0)  + TIME '07:30', 2100, 'green',  2,1,4, '{}'),
  (v_dog1_id, (v_today-1)  + TIME '07:30', 1800, 'green',  3,1,5, '{}'),
  (v_dog1_id, (v_today-2)  + TIME '07:30', 2400, 'yellow', 1,0,3, ARRAY['Motos','Ruidos fuertes']),
  (v_dog1_id, (v_today-3)  + TIME '07:30', 1500, 'green',  2,1,4, '{}'),
  (v_dog1_id, (v_today-4)  + TIME '07:30', 2000, 'green',  2,1,5, '{}'),
  (v_dog1_id, (v_today-5)  + TIME '07:30', 1700, 'yellow', 1,1,3, ARRAY['Otros perros']),
  (v_dog1_id, (v_today-6)  + TIME '07:30', 1900, 'green',  2,0,4, '{}'),
  (v_dog1_id, (v_today-7)  + TIME '07:30', 2100, 'green',  3,1,4, '{}'),
  (v_dog1_id, (v_today-8)  + TIME '07:30', 1800, 'green',  2,1,5, '{}'),
  (v_dog1_id, (v_today-9)  + TIME '07:30', 2400, 'yellow', 1,0,3, ARRAY['Motos','Ruidos fuertes']),
  (v_dog1_id, (v_today-10) + TIME '07:30', 1500, 'green',  2,1,4, '{}'),
  (v_dog1_id, (v_today-11) + TIME '07:30', 2000, 'green',  2,1,5, '{}'),
  (v_dog1_id, (v_today-12) + TIME '07:30', 1700, 'yellow', 1,1,3, ARRAY['Otros perros']),
  (v_dog1_id, (v_today-13) + TIME '07:30', 1900, 'green',  2,0,4, '{}'),
  (v_dog1_id, (v_today-14) + TIME '07:30', 2100, 'green',  3,1,5, '{}'),
  (v_dog1_id, (v_today-15) + TIME '07:30', 1800, 'green',  2,1,4, '{}'),
  (v_dog1_id, (v_today-16) + TIME '07:30', 2400, 'yellow', 1,0,3, ARRAY['Motos','Ruidos fuertes']),
  (v_dog1_id, (v_today-17) + TIME '07:30', 1500, 'green',  2,1,5, '{}'),
  (v_dog1_id, (v_today-18) + TIME '07:30', 2000, 'green',  2,1,4, '{}'),
  (v_dog1_id, (v_today-19) + TIME '07:30', 1700, 'yellow', 1,1,3, ARRAY['Otros perros']),
  (v_dog1_id, (v_today-20) + TIME '07:30', 1900, 'green',  2,0,5, '{}');

  RAISE NOTICE '06a OK — 21 paseos MAX';

  -- PASEOS LUNA (10)
  INSERT INTO walks (dog_id, start_time, duration_sec, traffic_light, pipi_count, popo_count, stool_rating, trigger_tags) VALUES
  (v_dog2_id, (v_today-0) + TIME '08:00', 1200, 'green', 2,1,4, '{}'),
  (v_dog2_id, (v_today-1) + TIME '08:00', 1500, 'green', 3,1,5, '{}'),
  (v_dog2_id, (v_today-2) + TIME '08:00', 900,  'green', 1,1,4, '{}'),
  (v_dog2_id, (v_today-3) + TIME '08:00', 1300, 'green', 2,0,5, '{}'),
  (v_dog2_id, (v_today-4) + TIME '08:00', 1100, 'green', 2,1,4, '{}'),
  (v_dog2_id, (v_today-5) + TIME '08:00', 1400, 'green', 1,1,5, '{}'),
  (v_dog2_id, (v_today-6) + TIME '08:00', 1000, 'green', 2,1,4, '{}'),
  (v_dog2_id, (v_today-7) + TIME '08:00', 1200, 'green', 3,0,5, '{}'),
  (v_dog2_id, (v_today-8) + TIME '08:00', 1500, 'green', 2,1,4, '{}'),
  (v_dog2_id, (v_today-9) + TIME '08:00', 900,  'green', 1,1,5, '{}');

  RAISE NOTICE '06b OK — 10 paseos LUNA';

  -- AGILIDAD (8)
  INSERT INTO agility_sessions (dog_id, fecha, activity_type, duration_min, circuit_time_seconds, notes) VALUES
  (v_dog1_id, v_today-20, 'Saltos',    15, 45, 'Buena técnica en saltos bajos'),
  (v_dog1_id, v_today-16, 'Túnel',     12, 52, 'Primera vez en túnel. Rápido aprendizaje.'),
  (v_dog1_id, v_today-12, 'Slalom',    18, 68, '5 postes consecutivos.'),
  (v_dog1_id, v_today-8,  'Saltos',    20, 35, 'Circuito 6 saltos sin errores'),
  (v_dog1_id, v_today-4,  'Combinado', 25, 85, 'Circuito completo. ¡Mejor tiempo!'),
  (v_dog1_id, v_today-1,  'Combinado', 22, 78, 'Nuevo récord personal'),
  (v_dog2_id, v_today-7,  'Saltos',    10, 60, 'Primera sesión. Muy entusiasmada.'),
  (v_dog2_id, v_today-3,  'Túnel',      8, 55, 'Sin miedo al túnel.');

  RAISE NOTICE '06c OK — 8 sesiones agilidad';
END $$;
