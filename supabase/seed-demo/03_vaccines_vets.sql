-- ============================================================
-- 03 — VETERINARIOS + VACUNAS + VISITAS
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
  v_dog1_id UUID;
  v_dog2_id UUID;
  v_vet1_id UUID;
  v_vet2_id UUID;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  SELECT id INTO v_dog1_id FROM dogs WHERE owner_id = v_uid AND nombre = 'MAX';
  SELECT id INTO v_dog2_id FROM dogs WHERE owner_id = v_uid AND nombre = 'LUNA';

  -- VETS
  INSERT INTO trusted_vets (user_id, name, clinic_name, phone, address, specialty, notes, avg_rating, total_visits)
  VALUES (v_uid, 'Dra. María Fernández', 'Clínica Veterinaria San Roque', '+51999111222',
    'Av. Benavides 1234, Miraflores, Lima', 'Dermatología canina', 'Excelente con MAX para su dermatitis', 5.0, 4)
  RETURNING id INTO v_vet1_id;

  INSERT INTO trusted_vets (user_id, name, clinic_name, phone, address, specialty, notes, avg_rating, total_visits)
  VALUES (v_uid, 'Dr. Carlos Ramírez', 'PetCare 24h', '+51999333444',
    'Jr. Las Flores 567, Surco, Lima', 'Medicina general y emergencias', 'Disponible 24h para urgencias', 4.5, 1)
  RETURNING id INTO v_vet2_id;

  RAISE NOTICE '03a OK — Vets: %, %', v_vet1_id, v_vet2_id;

  -- VACUNAS MAX (18)
  INSERT INTO dog_vaccines (dog_id, vaccine_name, vaccine_group, dose_number, date_administered, next_due_date, brand, cost_usd, vet_id, notes) VALUES
  (v_dog1_id,'hepatitis','core',1,'2025-02-20',NULL,'Vanguard Plus',15,v_vet1_id,'DHPP 1/3'),
  (v_dog1_id,'hepatitis','core',2,'2025-03-20',NULL,'Vanguard Plus',15,v_vet1_id,'DHPP 2/3'),
  (v_dog1_id,'hepatitis','core',3,'2025-04-17','2026-04-17','Vanguard Plus',15,v_vet1_id,'Refuerzo anual'),
  (v_dog1_id,'moquillo','core',1,'2025-02-20',NULL,'Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog1_id,'moquillo','core',2,'2025-03-20',NULL,'Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog1_id,'moquillo','core',3,'2025-04-17','2026-04-17','Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog1_id,'parvovirus','core',1,'2025-02-20',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog1_id,'parvovirus','core',2,'2025-03-20',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog1_id,'parvovirus','core',3,'2025-04-17','2026-04-17','Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog1_id,'leptospirosis','core',1,'2025-03-20',NULL,'Nobivac Lepto',12,v_vet1_id,NULL),
  (v_dog1_id,'leptospirosis','core',2,'2025-04-17','2025-10-17','Nobivac Lepto',12,v_vet1_id,'Semestral'),
  (v_dog1_id,'rabia','core',1,'2025-05-01','2026-05-01','Rabisin',10,v_vet1_id,'Anual'),
  (v_dog1_id,'coronavirus','optional',1,'2025-02-20',NULL,'Duramune',10,v_vet1_id,NULL),
  (v_dog1_id,'coronavirus','optional',2,'2025-03-20',NULL,'Duramune',10,v_vet1_id,NULL),
  (v_dog1_id,'tos-perrera','optional',1,'2025-04-17','2025-10-17','Nobivac KC',14,v_vet1_id,'Intranasal'),
  (v_dog1_id,'giardia','optional',1,'2025-03-20',NULL,'GiardiaVax',18,v_vet1_id,NULL),
  (v_dog1_id,'giardia','optional',2,'2025-04-10',NULL,'GiardiaVax',18,v_vet1_id,NULL),
  (v_dog1_id,'lyme','optional',1,'2025-05-10','2026-05-10','LymeVax',22,v_vet1_id,'Anual');

  RAISE NOTICE '03b OK — 18 vacunas MAX';

  -- VACUNAS LUNA (12)
  INSERT INTO dog_vaccines (dog_id, vaccine_name, vaccine_group, dose_number, date_administered, next_due_date, brand, cost_usd, vet_id, notes) VALUES
  (v_dog2_id,'hepatitis','core',1,'2026-02-10',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'hepatitis','core',2,'2026-03-10',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'hepatitis','core',3,'2026-04-07',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'moquillo','core',1,'2026-02-10',NULL,'Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog2_id,'moquillo','core',2,'2026-03-10',NULL,'Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog2_id,'moquillo','core',3,'2026-04-07',NULL,'Nobivac DHPPi',18,v_vet1_id,NULL),
  (v_dog2_id,'parvovirus','core',1,'2026-02-10',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'parvovirus','core',2,'2026-03-10',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'parvovirus','core',3,'2026-04-07',NULL,'Vanguard Plus',15,v_vet1_id,NULL),
  (v_dog2_id,'leptospirosis','core',1,'2026-03-10',NULL,'Nobivac Lepto',12,v_vet1_id,NULL),
  (v_dog2_id,'coronavirus','optional',1,'2026-02-10',NULL,'Duramune',10,v_vet1_id,NULL),
  (v_dog2_id,'coronavirus','optional',2,'2026-03-10',NULL,'Duramune',10,v_vet1_id,NULL);

  RAISE NOTICE '03c OK — 12 vacunas LUNA';

  -- VISITAS AL VET (11)
  INSERT INTO dog_vet_visits (dog_id, fecha, motivo, diagnostico, vet_name, vet_id, peso_kg, vet_rating, notas) VALUES
  (v_dog1_id,'2025-02-20','Primera consulta cachorro','Cachorro sano. Inicio esquema vacunación.','Dra. María Fernández',v_vet1_id,5.8,5,NULL),
  (v_dog1_id,'2025-03-20','Segunda ronda vacunas','Todo en orden.','Dra. María Fernández',v_vet1_id,10.2,5,'Un poco ansioso'),
  (v_dog1_id,'2025-04-17','Vacunas + revisión general','Leve irritación en piel. Posible dermatitis.','Dra. María Fernández',v_vet1_id,15.5,5,'Iniciar observación de alergias'),
  (v_dog1_id,'2025-06-10','Control dermatitis','Dermatitis atópica confirmada. Cambio de dieta.','Dra. María Fernández',v_vet1_id,20.1,5,'Eliminar pollo de la dieta'),
  (v_dog1_id,'2025-09-15','Control semestral','Peso ideal. Piel mejorando con dieta sin pollo.','Dra. María Fernández',v_vet1_id,28.0,5,'Continuar dieta actual'),
  (v_dog1_id,'2026-01-20','Lesión pata trasera','Esguince leve. Reposo 1 semana.','Dr. Carlos Ramírez',v_vet2_id,32.0,4,'Consulta de emergencia'),
  (v_dog1_id,'2026-04-15','Control anual + vacunas','Excelente estado general.','Dra. María Fernández',v_vet1_id,32.5,5,'Próximo control 6 meses'),
  (v_dog2_id,'2026-02-10','Primera consulta cachorro','Cachorro sano.','Dra. María Fernández',v_vet1_id,5.2,5,'Peso adecuado'),
  (v_dog2_id,'2026-03-10','Segunda ronda vacunas','Todo en orden.','Dra. María Fernández',v_vet1_id,8.5,5,NULL),
  (v_dog2_id,'2026-04-07','Tercera ronda + desparasitación','Creciendo muy bien.','Dra. María Fernández',v_vet1_id,12.8,5,'Desparasitación oral'),
  (v_dog2_id,'2026-05-15','Control de peso','Peso ideal.','Dra. María Fernández',v_vet1_id,18.2,5,NULL);

  RAISE NOTICE '03d OK — 11 visitas al vet';
END $$;
