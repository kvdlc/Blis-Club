-- ============================================================
-- 05 — LOGS DIARIOS + DIGESTIVOS
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  SELECT id INTO v_dog1_id FROM dogs WHERE owner_id = v_uid AND nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs WHERE owner_id = v_uid AND nombre = 'LUNA';

  -- LOGS DIARIOS MAX (30 días)
  INSERT INTO daily_logs (dog_id, fecha, nivel_estres, notas_conducta, comida_gramos)
  SELECT v_dog1_id, v_today - gs,
    (ARRAY[2,1,3,2,1,3,2])[1+(gs%7)],
    CASE WHEN gs%5=0 THEN 'Día excelente. Respondió bien a todos los comandos. Ánimo: feliz.'
         WHEN gs%7=3 THEN 'Un poco reactivo con otros perros en el parque. Ánimo: alerta.'
         ELSE 'Día normal. Ánimo: tranquilo.' END,
    (ARRAY[550,520,500,530,510,540,500])[1+(gs%7)]
  FROM generate_series(0, 29) AS gs;

  RAISE NOTICE '05a OK — 30 daily_logs MAX';

  -- LOGS DIARIOS LUNA (15 días)
  INSERT INTO daily_logs (dog_id, fecha, nivel_estres, notas_conducta, comida_gramos)
  SELECT v_dog2_id, v_today - gs,
    (ARRAY[1,2,1,2,1,2,1])[1+(gs%7)],
    CASE WHEN gs%3=0 THEN 'Aprendiendo rápido "sentado". Ánimo: juguetón.'
         ELSE 'Muy juguetona. Buena socialización. Ánimo: feliz.' END,
    (ARRAY[380,350,400,370,390,360,380])[1+(gs%7)]
  FROM generate_series(0, 14) AS gs;

  RAISE NOTICE '05b OK — 15 daily_logs LUNA';

  -- DIGESTIVOS MAX (8)
  INSERT INTO digestive_logs (dog_id, fecha, stool_type, notes)
  SELECT v_dog1_id, v_today - gs, (ARRAY[2,3,2,3,2,3,4])[1+(gs%7)],
    CASE WHEN gs%5=0 THEN 'Heces firmes. Buena digestión.'
         WHEN gs%7=4 THEN 'Un poco blandas.'
         ELSE 'Normal' END
  FROM generate_series(0, 7) AS gs;

  -- DIGESTIVOS LUNA (8)
  INSERT INTO digestive_logs (dog_id, fecha, stool_type, notes)
  SELECT v_dog2_id, v_today - gs, (ARRAY[2,2,3,2,3,2,2])[1+(gs%7)],
    CASE WHEN gs%4=0 THEN 'Transición BARF va bien.' ELSE 'Normal' END
  FROM generate_series(0, 7) AS gs;

  RAISE NOTICE '05c OK — 16 digestive_logs';
END $$;
