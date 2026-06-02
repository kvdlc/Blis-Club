-- ============================================================
-- 07 — COMIDAS PROGRAMADAS + NUTRITION LOGS
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_today DATE := CURRENT_DATE;
  v_recipe1_id UUID;
  v_recipe2_id UUID;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  SELECT id INTO v_dog1_id FROM dogs WHERE owner_id = v_uid AND nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs WHERE owner_id = v_uid AND nombre = 'LUNA';

  -- MAX: 14 días × 3 comidas
  INSERT INTO meal_schedule (dog_id, fecha, meal_slot_index, status, gramos)
  SELECT v_dog1_id, v_today - gs_day, gs_slot, 'fed',
    CASE gs_slot
      WHEN 0 THEN (ARRAY[550,520,500,530,510,540,500,550,520,510,530,500,540,520])[gs_day+1]
      WHEN 1 THEN (ARRAY[500,480,520,500,490,510,500,490,520,500,480,510,520,500])[gs_day+1]
      ELSE (ARRAY[450,470,460,480,450,470,460,450,480,470,460,450,470,480])[gs_day+1]
    END
  FROM generate_series(0,13) AS gs_day, generate_series(0,2) AS gs_slot;

  -- La cena de hoy pendiente
  UPDATE meal_schedule SET status = 'scheduled'
  WHERE dog_id = v_dog1_id AND fecha = v_today AND meal_slot_index = 2;

  -- LUNA: 7 días × 3 comidas
  INSERT INTO meal_schedule (dog_id, fecha, meal_slot_index, status, gramos)
  SELECT v_dog2_id, v_today - gs_day, gs_slot, 'fed',
    CASE gs_slot
      WHEN 0 THEN (ARRAY[380,350,400,370,390,360,380])[gs_day+1]
      WHEN 1 THEN (ARRAY[360,340,380,350,370,340,360])[gs_day+1]
      ELSE (ARRAY[340,320,350,330,340,330,350])[gs_day+1]
    END
  FROM generate_series(0,6) AS gs_day, generate_series(0,2) AS gs_slot;

  -- Almuerzo y cena de hoy pendientes
  UPDATE meal_schedule SET status = 'scheduled'
  WHERE dog_id = v_dog2_id AND fecha = v_today AND meal_slot_index IN (1,2);

  RAISE NOTICE '07a OK — ~105 meals';

  -- NUTRITION LOGS
  SELECT id INTO v_recipe1_id FROM nutrition_recipes WHERE title = 'Bowl BARF Clásico' LIMIT 1;
  SELECT id INTO v_recipe2_id FROM nutrition_recipes WHERE title = 'Helado de Hígado y Arándanos' LIMIT 1;

  IF v_recipe1_id IS NOT NULL THEN
    INSERT INTO nutrition_logs (dog_id, recipe_id, gramos_servidos, fecha) VALUES
    (v_dog1_id, v_recipe1_id, 500, v_today-5),
    (v_dog1_id, v_recipe1_id, 520, v_today-3),
    (v_dog2_id, v_recipe1_id, 350, v_today-4);
  END IF;

  IF v_recipe2_id IS NOT NULL THEN
    INSERT INTO nutrition_logs (dog_id, recipe_id, gramos_servidos, fecha) VALUES
    (v_dog1_id, v_recipe2_id, 150, v_today-2),
    (v_dog2_id, v_recipe2_id, 100, v_today-1);
  END IF;

  RAISE NOTICE '07b OK — 5 nutrition logs';
END $$;
