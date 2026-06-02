-- ============================================================
-- 04 — PESO + MEDICAMENTOS + MEDICATION LOGS
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_med1_id UUID;
  v_med2_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  SELECT id INTO v_dog1_id FROM dogs WHERE owner_id = v_uid AND nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs WHERE owner_id = v_uid AND nombre = 'LUNA';

  -- PESO MAX (10)
  INSERT INTO dog_weight_history (dog_id, peso_kg, fecha, notas) VALUES
  (v_dog1_id,4.5,'2025-02-01','Primera pesada en casa'),
  (v_dog1_id,5.8,'2025-02-20','Consulta veterinaria'),
  (v_dog1_id,10.2,'2025-03-20','+4.4 kg en 1 mes'),
  (v_dog1_id,15.5,'2025-04-17','Creciendo muy rápido'),
  (v_dog1_id,20.1,'2025-06-10','Control dermatológico'),
  (v_dog1_id,24.3,'2025-08-01','Pesaje en casa'),
  (v_dog1_id,28.0,'2025-09-15','Control semestral'),
  (v_dog1_id,30.5,'2025-11-20','Pesaje en casa'),
  (v_dog1_id,32.0,'2026-01-20','Consulta emergencia'),
  (v_dog1_id,32.5,'2026-04-15','Control anual');

  -- PESO LUNA (6)
  INSERT INTO dog_weight_history (dog_id, peso_kg, fecha, notas) VALUES
  (v_dog2_id,3.8,'2026-01-20','Primera pesada en casa'),
  (v_dog2_id,5.2,'2026-02-10','1ra consulta'),
  (v_dog2_id,8.5,'2026-03-10','2da consulta'),
  (v_dog2_id,12.8,'2026-04-07','3ra consulta'),
  (v_dog2_id,15.0,'2026-05-01','Pesaje en casa'),
  (v_dog2_id,18.2,'2026-05-15','Control de peso');

  RAISE NOTICE '04a OK — 16 pesos históricos';

  -- MEDICAMENTOS MAX (5)
  INSERT INTO dog_medications (dog_id, medication_name, dosage, start_date, end_date, doses_per_day, dose_hours, status, notes) VALUES
  (v_dog1_id,'Drontal Plus','1 comprimido','2025-04-17','2025-04-17',1,ARRAY['08:00:00'::TIME],'completed','Desparasitación'),
  (v_dog1_id,'Advocate 10-25kg','1 pipeta','2025-08-01','2025-09-01',1,ARRAY['09:00:00'::TIME],'completed','Antipulgas'),
  (v_dog1_id,'Advocate 25-40kg','1 pipeta','2026-05-01','2026-06-01',1,ARRAY['09:00:00'::TIME],'active','Antipulgas actual'),
  (v_dog1_id,'Apoquel','16mg c/12h','2025-06-15','2025-07-15',2,ARRAY['08:00:00'::TIME,'20:00:00'::TIME],'completed','Dermatitis'),
  (v_dog1_id,'Omega-3','2 cápsulas','2025-07-01',NULL,1,ARRAY['08:00:00'::TIME],'active','Suplemento continuo piel');

  SELECT id INTO v_med1_id FROM dog_medications WHERE dog_id = v_dog1_id AND status = 'active' ORDER BY start_date DESC LIMIT 1;

  -- MEDICAMENTOS LUNA (3)
  INSERT INTO dog_medications (dog_id, medication_name, dosage, start_date, end_date, doses_per_day, dose_hours, status, notes) VALUES
  (v_dog2_id,'Drontal Plus','1/2 comprimido','2026-04-07','2026-04-07',1,ARRAY['08:00:00'::TIME],'completed','Desparasitación'),
  (v_dog2_id,'Advocate 4-10kg','1 pipeta','2026-03-01','2026-04-01',1,ARRAY['09:00:00'::TIME],'completed','Antipulgas'),
  (v_dog2_id,'Advocate 10-25kg','1 pipeta','2026-05-01','2026-06-01',1,ARRAY['09:00:00'::TIME],'active','Antipulgas actual');

  SELECT id INTO v_med2_id FROM dog_medications WHERE dog_id = v_dog2_id AND status = 'active' ORDER BY start_date DESC LIMIT 1;

  RAISE NOTICE '04b OK — Medicamentos: MAX=5, LUNA=3';

  -- LOGS DE MEDICAMENTOS (8 días cada uno)
  INSERT INTO dog_medication_logs (medication_id, scheduled_time, taken, taken_at)
  SELECT v_med1_id, (v_today - gs || 'T08:00:00')::timestamptz, true, (v_today - gs || 'T08:05:00')::timestamptz
  FROM generate_series(0, 7) AS gs;

  INSERT INTO dog_medication_logs (medication_id, scheduled_time, taken, taken_at)
  SELECT v_med2_id, (v_today - gs || 'T09:00:00')::timestamptz, true, (v_today - gs || 'T09:03:00')::timestamptz
  FROM generate_series(0, 7) AS gs;

  RAISE NOTICE '04c OK — 16 medication logs';
END $$;
