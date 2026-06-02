-- ============================================================
-- 09 — ACADEMIA + INSIGNIAS + RACHAS
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_today DATE := CURRENT_DATE;
  v_module1_id UUID;
  v_badge1_id UUID;
  v_badge2_id UUID;
  v_badge3_id UUID;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';

  -- PROGRESO ACADÉMICO (8 lecciones módulo 1)
  SELECT m.id INTO v_module1_id
  FROM modules m JOIN stages s ON s.id = m.stage_id
  WHERE s.title = 'Nivel Novato' AND m.title = 'Psicología del Liderazgo';

  IF v_module1_id IS NOT NULL THEN
    INSERT INTO user_progress (user_id, lesson_id, completed, score, completed_at)
    SELECT v_uid, id, true,
      CASE WHEN "order" % 3 = 0 THEN 100 ELSE 85 END,
      (v_today - (8 - "order"))::timestamptz + TIME '18:00:00'
    FROM lessons WHERE module_id = v_module1_id;
    RAISE NOTICE '09a OK — Progreso académico en 8 lecciones';
  ELSE
    RAISE NOTICE '09a SKIP — Módulo no encontrado (corre seed.sql primero)';
  END IF;

  -- INSIGNIAS
  SELECT id INTO v_badge1_id FROM badges WHERE name = 'Guía Consistente' LIMIT 1;
  SELECT id INTO v_badge2_id FROM badges WHERE name = 'Semana Verde' LIMIT 1;
  SELECT id INTO v_badge3_id FROM badges WHERE name = 'Maestro del Liderazgo' LIMIT 1;

  IF v_badge1_id IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (v_uid, v_badge1_id, (v_today-10)::timestamptz);
  END IF;
  IF v_badge2_id IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (v_uid, v_badge2_id, (v_today-3)::timestamptz);
  END IF;
  IF v_badge3_id IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (v_uid, v_badge3_id, (v_today-1)::timestamptz);
  END IF;

  RAISE NOTICE '09b OK — 3 insignias';

  -- RACHAS
  INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date) VALUES
  (v_uid, 'walks',     7,  14, v_today),
  (v_uid, 'daily_log', 5,  10, v_today),
  (v_uid, 'academy',   3,   5, v_today);

  RAISE NOTICE '09c OK — 3 rachas';
END $$;
