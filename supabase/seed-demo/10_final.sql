-- ============================================================
-- 10 — RETOS + NOTIFICACIONES + SUSCRIPCIÓN + RECOMPENSAS + REFERIDOS + USER APP
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_today DATE := CURRENT_DATE;
  v_plan_id UUID;
  v_sub_id UUID;
  v_ch1 UUID;
  v_ch2 UUID;
  v_ch3 UUID;
  v_ref_code TEXT;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';

  -- RETOS SEMANALES
  SELECT id INTO v_ch1 FROM weekly_challenges WHERE title = 'Junto en 5 días' LIMIT 1;
  SELECT id INTO v_ch2 FROM weekly_challenges WHERE title = 'Paseo sin tirones' LIMIT 1;
  SELECT id INTO v_ch3 FROM weekly_challenges WHERE title = 'Semana BARF' LIMIT 1;

  IF v_ch1 IS NOT NULL THEN
    INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at)
    VALUES (v_uid, v_ch1, true, (v_today-2)::timestamptz);
  END IF;
  IF v_ch2 IS NOT NULL THEN
    INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at)
    VALUES (v_uid, v_ch2, true, (v_today-1)::timestamptz);
  END IF;
  IF v_ch3 IS NOT NULL THEN
    INSERT INTO user_challenges (user_id, challenge_id, completed)
    VALUES (v_uid, v_ch3, false);
  END IF;

  RAISE NOTICE '10a OK — 3 retos (2 completados)';

  -- NOTIFICACIONES
  INSERT INTO notifications (user_id, mensaje, leida) VALUES
  (v_uid, '¡Bienvenido a Blis Club, Carlos! Configura el perfil de MAX para empezar.', true),
  (v_uid, '¡Felicidades! Completaste el reto "Junto en 5 días".', true),
  (v_uid, 'MAX tiene una vacuna de rabia pendiente para este mes.', false),
  (v_uid, '¡Nueva insignia desbloqueada: Maestro del Liderazgo!', false),
  (v_uid, 'LUNA necesita su segunda dosis de leptospirosis.', false),
  (v_uid, 'Tu racha de paseos es de 7 días. ¡Sigue así!', true),
  (v_uid, 'Nuevo reto disponible: Semana de Socialización.', false),
  (v_uid, 'Recordatorio: el tratamiento de dermatitis de MAX finalizó.', true);

  RAISE NOTICE '10b OK — 8 notificaciones';

  -- SUSCRIPCIÓN
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Pro Mensual' LIMIT 1;
  IF v_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    VALUES (v_uid, v_plan_id, 'active',
      date_trunc('month', v_today)::timestamptz,
      (date_trunc('month', v_today) + INTERVAL '1 month' - INTERVAL '1 second')::timestamptz)
    RETURNING id INTO v_sub_id;

    -- Payment token
    INSERT INTO payment_tokens (user_id, subscription_id, card_token, card_brand, card_last4, card_expiry, is_active)
    VALUES (v_uid, v_sub_id, 'tok_demo_visa_4242', 'Visa', '4242', '12/2028', true);

    -- Pago registrado
    INSERT INTO subscription_payments (user_id, subscription_id, plan_id, amount_cents, currency, status, payment_method, description)
    VALUES (v_uid, v_sub_id, v_plan_id, 1000, 'PEN', 'completed', 'card', 'Pro Mensual — Junio 2026');

    RAISE NOTICE '10c OK — Suscripción Pro Mensual activa';
  ELSE
    RAISE NOTICE '10c SKIP — Plan no encontrado (corre seed.sql primero)';
  END IF;

  -- RECOMPENSAS
  INSERT INTO user_rewards (user_id, total_cash_usd, total_months_free, available_cash_usd, default_reward_mode)
  VALUES (v_uid, 25, 0, 25, 'cash')
  ON CONFLICT (user_id) DO UPDATE SET total_cash_usd = 25, available_cash_usd = 25;

  RAISE NOTICE '10d OK — $25 en recompensas';

  -- REFERIDOS
  v_ref_code := 'CARLOS' || substring(v_uid::text, 1, 4);
  INSERT INTO referrals (referrer_user_id, referral_code, status, level, reward_granted, cash_reward_usd)
  VALUES (v_uid, v_ref_code, 'active', 1, false, 0);

  RAISE NOTICE '10e OK — Código referido: %', v_ref_code;

  -- USER APP
  UPDATE user_apps SET status = 'active', trial_ends_at = v_today + 60, current_period_end = v_today + 60
  WHERE user_id = v_uid AND app_slug = 'guau';

  IF NOT FOUND THEN
    INSERT INTO user_apps (user_id, app_slug, status, trial_ends_at, current_period_end)
    VALUES (v_uid, 'guau', 'active', v_today + 60, v_today + 60);
  END IF;

  RAISE NOTICE '10f OK — User app activo';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED DEMO COMPLETO — Todo listo.';
  RAISE NOTICE '========================================';
END $$;
