-- ============================================================
-- 08 — DETOX + SHOPPING LIST
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

  -- DETOX MAX: completado (14 días)
  INSERT INTO detox_progress (dog_id, day_number, completed, completed_at)
  SELECT v_dog1_id, gs, true, (v_today - 14 + gs)::timestamptz
  FROM generate_series(1, 14) AS gs;

  -- DETOX LUNA: 3 días iniciados
  INSERT INTO detox_progress (dog_id, day_number, completed, completed_at)
  SELECT v_dog2_id, gs, true, (v_today - 3 + gs)::timestamptz
  FROM generate_series(1, 3) AS gs;

  RAISE NOTICE '08a OK — detox MAX=14, LUNA=3';

  -- LISTA DE COMPRAS
  INSERT INTO shopping_list (user_id, ingredient_name, quantity_g, checked, week_start) VALUES
  (v_uid, 'Pollo muslo con hueso',    2000, false, date_trunc('week', v_today)::date),
  (v_uid, 'Corazón de res',           1000, false, date_trunc('week', v_today)::date),
  (v_uid, 'Hígado de pollo',           500, false, date_trunc('week', v_today)::date),
  (v_uid, 'Zanahoria',                 800, true,  date_trunc('week', v_today)::date),
  (v_uid, 'Espinaca',                  600, false, date_trunc('week', v_today)::date),
  (v_uid, 'Aceite de salmón',          100, false, date_trunc('week', v_today)::date),
  (v_uid, 'Arándanos',                 300, true,  date_trunc('week', v_today)::date),
  (v_uid, 'Calabaza',                 1000, false, date_trunc('week', v_today)::date),
  (v_uid, 'Yogur natural sin azúcar',  500, false, date_trunc('week', v_today)::date),
  (v_uid, 'Pechuga de pavo molida',   1500, false, date_trunc('week', v_today)::date);

  RAISE NOTICE '08b OK — 10 items shopping list';
END $$;
