-- ============================================================
-- 15 — PAGOS DE SUSCRIPCIÓN (9 usuarios, $10 cada uno)
-- ============================================================
DO $$
DECLARE
  v_plan_id UUID;
  v_today DATE := CURRENT_DATE;
  r RECORD;
BEGIN
  SELECT id INTO v_plan_id FROM plans WHERE name = 'Pro Mensual' LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'Plan Pro Mensual no encontrado';
  END IF;

  -- Insertar un pago para cada suscripción de los usuarios ficticios
  FOR r IN 
    SELECT s.id as sub_id, s.user_id 
    FROM subscriptions s 
    WHERE s.user_id IN (
      'a6909b92-0cc1-4eb4-ba15-85880eea38fe',
      'b972c492-6e7c-48b9-af9c-6f3bb9e4d882',
      'c6a15be2-5190-4f86-a076-b9e5b316e40f',
      'ca8567fd-4576-4822-9fe7-b4a2da551448',
      '1c03d605-1729-4ff5-a49c-19c8664d300c',
      'fc5ba12c-24cf-417d-9ad6-64706776108d',
      'a0b15107-5818-4242-b83a-269f1e978539',
      'd89cf549-8844-4f50-98b5-fed31c55c3d2',
      '27a2481c-436e-4cde-bc96-e8321df2c328'
    )
  LOOP
    INSERT INTO subscription_payments (user_id, subscription_id, plan_id, amount_cents, currency, status, payment_method, description)
    VALUES (r.user_id, r.sub_id, v_plan_id, 1000, 'PEN', 'completed', 'card', 'Pro Mensual — prueba de comisiones');
  END LOOP;

  RAISE NOTICE '15 OK — 9 pagos de $10 c/u insertados';
END $$;
