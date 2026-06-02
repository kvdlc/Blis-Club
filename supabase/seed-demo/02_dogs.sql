-- ============================================================
-- 02 — CREAR PERROS + PERFILES METABÓLICOS + HORARIOS COMIDA
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_dog1_id UUID;
  v_dog2_id UUID;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario demo@blis.club no encontrado.';
  END IF;

  -- PERROS
  INSERT INTO dogs (owner_id, nombre, raza, edad_meses, fecha_nacimiento, peso_kg, objetivo_principal, foto_url, breed_image_url)
  VALUES (v_uid, 'MAX', 'American Bully', 18, '2025-01-15', 32.5, 'Obediencia avanzada y control de reactividad',
    'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/demo/max.jpg',
    'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/demo/max.jpg')
  RETURNING id INTO v_dog1_id;

  INSERT INTO dogs (owner_id, nombre, raza, edad_meses, fecha_nacimiento, peso_kg, objetivo_principal, foto_url, breed_image_url)
  VALUES (v_uid, 'LUNA', 'Golden Retriever', 6, '2026-01-10', 18.2, 'Socialización y comandos básicos',
    'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/demo/luna.jpg',
    'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/demo/luna.jpg')
  RETURNING id INTO v_dog2_id;

  RAISE NOTICE '02a OK — MAX: %, LUNA: %', v_dog1_id, v_dog2_id;

  -- PERFILES METABÓLICOS
  INSERT INTO dog_metabolic_profiles (dog_id, activity_level, feeding_pct, custom_meat_pct, custom_bone_pct, custom_organ_pct, custom_veggie_pct, allergies, medical_conditions)
  VALUES (v_dog1_id, 'activo', 2.5, 50.00, 20.00, 10.00, 20.00, ARRAY['pollo'], ARRAY['dermatitis_atopica']);

  INSERT INTO dog_metabolic_profiles (dog_id, activity_level, feeding_pct, custom_meat_pct, custom_bone_pct, custom_organ_pct, custom_veggie_pct, allergies, medical_conditions)
  VALUES (v_dog2_id, 'moderado', 3.0, 50.00, 20.00, 10.00, 20.00, '{}', '{}');

  RAISE NOTICE '02b OK — Perfiles metabólicos';

  -- HORARIOS DE COMIDA
  INSERT INTO dog_meal_slots (dog_id, slot_index, label, time_of_day, active) VALUES
  (v_dog1_id, 0, 'Desayuno', '07:30', true),
  (v_dog1_id, 1, 'Almuerzo', '13:00', true),
  (v_dog1_id, 2, 'Cena',    '19:30', true),
  (v_dog2_id, 0, 'Desayuno', '08:00', true),
  (v_dog2_id, 1, 'Almuerzo', '13:30', true),
  (v_dog2_id, 2, 'Cena',    '20:00', true);

  RAISE NOTICE '02c OK — 6 horarios de comida';
END $$;
