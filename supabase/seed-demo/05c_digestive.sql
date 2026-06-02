DO $$
DECLARE
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_dog1_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'LUNA';

  INSERT INTO digestive_logs (dog_id, fecha, stool_type, notes) VALUES
  (v_dog1_id, v_today-0, 2, 'Normal'),
  (v_dog1_id, v_today-1, 3, 'Normal'),
  (v_dog1_id, v_today-2, 2, 'Heces firmes. Buena digestión.'),
  (v_dog1_id, v_today-3, 3, 'Normal'),
  (v_dog1_id, v_today-4, 2, 'Normal'),
  (v_dog1_id, v_today-5, 3, 'Un poco blandas.'),
  (v_dog1_id, v_today-6, 4, 'Posiblemente por premio nuevo.'),
  (v_dog1_id, v_today-7, 2, 'Volvió a la normalidad.');

  INSERT INTO digestive_logs (dog_id, fecha, stool_type, notes) VALUES
  (v_dog2_id, v_today-0, 2, 'Normal'),
  (v_dog2_id, v_today-1, 2, 'Normal'),
  (v_dog2_id, v_today-2, 3, 'Transición BARF va bien.'),
  (v_dog2_id, v_today-3, 2, 'Normal'),
  (v_dog2_id, v_today-4, 3, 'Normal'),
  (v_dog2_id, v_today-5, 2, 'Normal'),
  (v_dog2_id, v_today-6, 2, 'Normal'),
  (v_dog2_id, v_today-7, 2, 'Normal');

  RAISE NOTICE '05c OK — 16 digestive_logs';
END $$;
