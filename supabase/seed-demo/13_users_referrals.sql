-- ============================================================
-- 13 — ÁRBOL DE REFERIDOS (3 niveles)
-- ============================================================
-- Estructura:
--   demo (raíz)
--   ├── demo1 (L1) → demo4 (L2) → demo7 (L3)
--   ├── demo1 (L1) → demo5 (L2) → demo8 (L3)
--   ├── demo2 (L1) → demo6 (L2)
--   ├── demo3 (L1)
--   └── demo9 (L1)
-- ============================================================
DO $$
BEGIN
  -- Limpiar referidos existentes de los usuarios ficticios (por si acaso)
  DELETE FROM referrals WHERE referred_user_id IN (
    'a6909b92-0cc1-4eb4-ba15-85880eea38fe',
    'b972c492-6e7c-48b9-af9c-6f3bb9e4d882',
    'c6a15be2-5190-4f86-a076-b9e5b316e40f',
    'ca8567fd-4576-4822-9fe7-b4a2da551448',
    '1c03d605-1729-4ff5-a49c-19c8664d300c',
    'fc5ba12c-24cf-417d-9ad6-64706776108d',
    'a0b15107-5818-4242-b83a-269f1e978539',
    'd89cf549-8844-4f50-98b5-fed31c55c3d2',
    '27a2481c-436e-4cde-bc96-e8321df2c328'
  );

  -- NIVEL 1: Referidos directos de demo@blis.club
  INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, level) VALUES
  ('1830d1ed-ef20-4f27-82ad-2a49744124f9', 'a6909b92-0cc1-4eb4-ba15-85880eea38fe', 'A6909B', 'pending', 1),
  ('1830d1ed-ef20-4f27-82ad-2a49744124f9', 'b972c492-6e7c-48b9-af9c-6f3bb9e4d882', 'B972C4', 'pending', 1),
  ('1830d1ed-ef20-4f27-82ad-2a49744124f9', 'c6a15be2-5190-4f86-a076-b9e5b316e40f', 'C6A15B', 'pending', 1),
  ('1830d1ed-ef20-4f27-82ad-2a49744124f9', '27a2481c-436e-4cde-bc96-e8321df2c328', '27A248', 'pending', 1);

  -- NIVEL 2: Referidos de demo1 y demo2
  INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, level) VALUES
  ('a6909b92-0cc1-4eb4-ba15-85880eea38fe', 'ca8567fd-4576-4822-9fe7-b4a2da551448', 'CA8567', 'pending', 2),
  ('a6909b92-0cc1-4eb4-ba15-85880eea38fe', '1c03d605-1729-4ff5-a49c-19c8664d300c', '1C03D6', 'pending', 2),
  ('b972c492-6e7c-48b9-af9c-6f3bb9e4d882', 'fc5ba12c-24cf-417d-9ad6-64706776108d', 'FC5BA1', 'pending', 2);

  -- NIVEL 3: Referidos de demo4 y demo5
  INSERT INTO referrals (referrer_user_id, referred_user_id, referral_code, status, level) VALUES
  ('ca8567fd-4576-4822-9fe7-b4a2da551448', 'a0b15107-5818-4242-b83a-269f1e978539', 'A0B151', 'pending', 3),
  ('1c03d605-1729-4ff5-a49c-19c8664d300c', 'd89cf549-8844-4f50-98b5-fed31c55c3d2', 'D89CF5', 'pending', 3);

  RAISE NOTICE '13 OK — Arbol de referidos: L1=4, L2=3, L3=2';
END $$;
