-- ============================================================
-- SEED DEMO DATA — Crea perro THOR con datos completos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- No borra datos de MAX ni REX
-- ============================================================

DO $$
DECLARE
  v_uid UUID := '8a05e4b7-374c-4e1e-a00e-3cb80a25d8df';
  v_did UUID;
  v_today DATE := CURRENT_DATE;
  v_plan_id UUID;
  v_med_id UUID;
BEGIN

-- ═══════════════════ CREAR PERRO DEMO ═══════════════════
INSERT INTO dogs (owner_id, nombre, raza, edad_meses, fecha_nacimiento, peso_kg, objetivo_principal, foto_url, breed_image_url)
VALUES (
  v_uid, 'THOR', 'American Bully', 6, '2026-01-01', 22.5, 'Obediencia básica',
  'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/8a05e4b7-374c-4e1e-a00e-3cb80a25d8df/1780161891330-kdxbqg.jpg',
  'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/dog-photos/8a05e4b7-374c-4e1e-a00e-3cb80a25d8df/1780161891330-kdxbqg.jpg'
)
RETURNING id INTO v_did;
RAISE NOTICE 'Perro THOR creado: %', v_did;

-- ═══════════════════ PERFIL METABÓLICO ═══════════════════
INSERT INTO dog_metabolic_profiles (dog_id, activity_level, feeding_pct, allergies, medical_conditions)
VALUES (v_did, 'activo', 2.5, '{}', '{}')
ON CONFLICT (dog_id) DO UPDATE SET activity_level = 'activo', feeding_pct = 2.5;

-- ═══════════════════ VACUNAS (18 dosis) ═══════════════════
INSERT INTO dog_vaccines (dog_id, vaccine_name, vaccine_group, dose_number, date_administered, brand, cost_usd, notes, created_at) VALUES
(v_did, 'hepatitis', 'core', 1, '2026-02-26', 'Vanguard Plus', 15, 'Primera dosis DHPP', NOW()),
(v_did, 'hepatitis', 'core', 2, '2026-03-26', 'Vanguard Plus', 15, 'Segunda dosis', NOW()),
(v_did, 'hepatitis', 'core', 3, '2026-04-23', 'Vanguard Plus', 15, 'Tercera dosis', NOW()),
(v_did, 'moquillo', 'core', 1, '2026-02-26', 'Nobivac DHPPi', 18, NULL, NOW()),
(v_did, 'moquillo', 'core', 2, '2026-03-26', 'Nobivac DHPPi', 18, NULL, NOW()),
(v_did, 'moquillo', 'core', 3, '2026-04-23', 'Nobivac DHPPi', 18, NULL, NOW()),
(v_did, 'parvovirus', 'core', 1, '2026-02-26', 'Vanguard Plus', 15, 'Combinada DHPP', NOW()),
(v_did, 'parvovirus', 'core', 2, '2026-03-26', 'Vanguard Plus', 15, NULL, NOW()),
(v_did, 'parvovirus', 'core', 3, '2026-04-23', 'Vanguard Plus', 15, NULL, NOW()),
(v_did, 'leptospirosis', 'core', 1, '2026-03-26', 'Nobivac Lepto', 12, NULL, NOW()),
(v_did, 'leptospirosis', 'core', 2, '2026-04-23', 'Nobivac Lepto', 12, NULL, NOW()),
(v_did, 'rabia', 'core', 1, NULL, NULL, NULL, 'Pendiente - próxima semana', NOW()),
(v_did, 'coronavirus', 'optional', 1, '2026-02-26', 'Duramune', 10, NULL, NOW()),
(v_did, 'coronavirus', 'optional', 2, '2026-03-26', 'Duramune', 10, NULL, NOW()),
(v_did, 'tos-perrera', 'optional', 1, '2026-04-23', 'Nobivac KC', 14, 'Versión intranasal', NOW()),
(v_did, 'giardia', 'optional', 1, '2026-03-26', 'GiardiaVax', 18, NULL, NOW()),
(v_did, 'giardia', 'optional', 2, '2026-04-15', 'GiardiaVax', 18, NULL, NOW()),
(v_did, 'lyme', 'optional', 1, '2026-05-01', 'LymeVax', 22, 'Primera dosis Lyme', NOW());

-- ═══════════════════ VISITAS AL VETERINARIO ═══════════════════
INSERT INTO dog_vet_visits (dog_id, fecha, motivo, diagnostico, vet_name, peso_kg, vet_rating, notas, created_at) VALUES
(v_did, '2026-02-26', 'Primera consulta y plan de vacunación', 'Cachorro sano. Se inicia esquema DHPP.', 'Dra. María Fernández', 6.2, 5, 'Peso adecuado para su edad', NOW()),
(v_did, '2026-03-26', 'Segunda ronda de vacunas + revisión', 'Todo en orden. Creciendo bien.', 'Dra. María Fernández', 9.8, 5, 'Un poco ansioso durante la revisión', NOW()),
(v_did, '2026-04-23', 'Tercera ronda vacunas + desparasitación', 'Leve inflamación en zona de pinchazo. Normal.', 'Dr. Carlos Ramírez', 14.5, 4, 'Cambió de vet por disponibilidad', NOW()),
(v_did, '2026-05-15', 'Control de peso y revisión general', 'Muy buen estado. Próxima cita: rabia.', 'Dra. María Fernández', 19.8, 5, 'Peso actual: 19.8 kg. Creciendo rápido.', NOW());

-- ═══════════════════ MEDICAMENTOS (fix: TIME cast) ═══════════════════
INSERT INTO dog_medications (dog_id, medication_name, dosage, start_date, end_date, doses_per_day, dose_hours, status, created_at) VALUES
(v_did, 'Drontal Plus', '1 comprimido', '2026-04-23', '2026-04-23', 1, ARRAY['08:00:00'::TIME], 'completed', NOW()),
(v_did, 'Advocate (Spot-on)', '1 pipeta 4-10kg', '2026-03-01', '2026-04-01', 1, ARRAY['09:00:00'::TIME], 'completed', NOW()),
(v_did, 'Advocate (Spot-on)', '1 pipeta 10-25kg', '2026-05-01', '2026-06-01', 1, ARRAY['09:00:00'::TIME], 'active', NOW()),
(v_did, 'Omeprazol', '10mg cada 12h', '2026-05-20', '2026-05-27', 2, ARRAY['08:00:00'::TIME, '20:00:00'::TIME], 'completed', NOW());

-- ═══════════════════ HISTORIAL DE PESO ═══════════════════
INSERT INTO dog_weight_history (dog_id, peso_kg, fecha, notas, created_at) VALUES
(v_did, 4.2, '2026-02-01', 'Primera pesada en casa', NOW()),
(v_did, 6.2, '2026-02-26', 'En consulta veterinaria', NOW()),
(v_did, 9.8, '2026-03-26', '2da consulta. Subió 3.6 kg en un mes', NOW()),
(v_did, 12.1, '2026-04-10', 'Pesaje en casa', NOW()),
(v_did, 14.5, '2026-04-23', '3ra consulta', NOW()),
(v_did, 16.3, '2026-05-05', 'Creciendo muy rápido', NOW()),
(v_did, 19.8, '2026-05-15', '4ta consulta - control', NOW());

-- ═══════════════════ HORARIOS DE COMIDA ═══════════════════
INSERT INTO dog_meal_slots (dog_id, slot_index, label, time_of_day, active, created_at) VALUES
(v_did, 0, 'Desayuno', '08:00', true, NOW()),
(v_did, 1, 'Almuerzo', '14:00', true, NOW()),
(v_did, 2, 'Cena', '20:00', true, NOW());

-- ═══════════════════ COMIDAS (14 días) ═══════════════════
INSERT INTO meal_schedule (dog_id, fecha, meal_slot_index, status, gramos, created_at) VALUES
(v_did, v_today - 14, 0, 'fed', 190, NOW()), (v_did, v_today - 14, 1, 'fed', 200, NOW()), (v_did, v_today - 14, 2, 'fed', 185, NOW()),
(v_did, v_today - 13, 0, 'fed', 195, NOW()), (v_did, v_today - 13, 1, 'fed', 210, NOW()), (v_did, v_today - 13, 2, 'fed', 180, NOW()),
(v_did, v_today - 12, 0, 'fed', 200, NOW()), (v_did, v_today - 12, 1, 'fed', 195, NOW()), (v_did, v_today - 12, 2, 'fed', 190, NOW()),
(v_did, v_today - 11, 0, 'fed', 185, NOW()), (v_did, v_today - 11, 1, 'fed', 205, NOW()), (v_did, v_today - 11, 2, 'fed', 195, NOW()),
(v_did, v_today - 10, 0, 'fed', 210, NOW()), (v_did, v_today - 10, 1, 'fed', 190, NOW()), (v_did, v_today - 10, 2, 'fed', 200, NOW()),
(v_did, v_today - 9, 0, 'fed', 195, NOW()), (v_did, v_today - 9, 1, 'fed', 200, NOW()), (v_did, v_today - 9, 2, 'fed', 185, NOW()),
(v_did, v_today - 8, 0, 'fed', 205, NOW()), (v_did, v_today - 8, 1, 'fed', 190, NOW()), (v_did, v_today - 8, 2, 'fed', 195, NOW()),
(v_did, v_today - 7, 0, 'fed', 190, NOW()), (v_did, v_today - 7, 1, 'fed', 215, NOW()), (v_did, v_today - 7, 2, 'fed', 180, NOW()),
(v_did, v_today - 6, 0, 'fed', 200, NOW()), (v_did, v_today - 6, 1, 'fed', 195, NOW()), (v_did, v_today - 6, 2, 'fed', 190, NOW()),
(v_did, v_today - 5, 0, 'fed', 210, NOW()), (v_did, v_today - 5, 1, 'fed', 185, NOW()), (v_did, v_today - 5, 2, 'fed', 200, NOW()),
(v_did, v_today - 4, 0, 'fed', 195, NOW()), (v_did, v_today - 4, 1, 'fed', 205, NOW()), (v_did, v_today - 4, 2, 'fed', 190, NOW()),
(v_did, v_today - 3, 0, 'fed', 185, NOW()), (v_did, v_today - 3, 1, 'fed', 200, NOW()), (v_did, v_today - 3, 2, 'fed', 210, NOW()),
(v_did, v_today - 2, 0, 'fed', 200, NOW()), (v_did, v_today - 2, 1, 'fed', 190, NOW()), (v_did, v_today - 2, 2, 'fed', 195, NOW()),
(v_did, v_today - 1, 0, 'fed', 195, NOW()), (v_did, v_today - 1, 1, 'fed', 205, NOW()), (v_did, v_today - 1, 2, 'fed', 185, NOW()),
(v_did, v_today, 0, 'fed', 210, NOW()), (v_did, v_today, 1, 'fed', 195, NOW()), (v_did, v_today, 2, 'scheduled', 200, NOW());

-- ═══════════════════ PASEOS (19, últimos 21 días) ═══════════════════
INSERT INTO walks (dog_id, start_time, duration_sec, traffic_light, pipi_count, popo_count, stool_rating, created_at) VALUES
(v_did, (v_today - 21) + TIME '07:30:00', 1500, 'green', 2, 1, 4, NOW()),
(v_did, (v_today - 20) + TIME '07:45:00', 1800, 'green', 3, 0, 5, NOW()),
(v_did, (v_today - 18) + TIME '08:00:00', 1200, 'yellow', 1, 1, 3, NOW()),
(v_did, (v_today - 17) + TIME '07:15:00', 2000, 'green', 2, 1, 4, NOW()),
(v_did, (v_today - 15) + TIME '08:30:00', 1600, 'green', 2, 0, 5, NOW()),
(v_did, (v_today - 14) + TIME '07:20:00', 900, 'red', 0, 0, NULL, NOW()),
(v_did, (v_today - 13) + TIME '07:40:00', 2100, 'green', 3, 1, 4, NOW()),
(v_did, (v_today - 12) + TIME '08:10:00', 1400, 'green', 2, 1, 5, NOW()),
(v_did, (v_today - 10) + TIME '07:35:00', 1700, 'green', 1, 0, 4, NOW()),
(v_did, (v_today - 9) + TIME '07:50:00', 1100, 'yellow', 2, 1, 3, NOW()),
(v_did, (v_today - 8) + TIME '08:00:00', 1900, 'green', 3, 0, 5, NOW()),
(v_did, (v_today - 7) + TIME '07:25:00', 2200, 'green', 2, 1, 4, NOW()),
(v_did, (v_today - 6) + TIME '07:55:00', 1300, 'green', 1, 0, 4, NOW()),
(v_did, (v_today - 5) + TIME '08:15:00', 1000, 'red', 0, 0, NULL, NOW()),
(v_did, (v_today - 4) + TIME '07:30:00', 2000, 'green', 3, 1, 5, NOW()),
(v_did, (v_today - 3) + TIME '07:45:00', 1600, 'yellow', 2, 0, 4, NOW()),
(v_did, (v_today - 2) + TIME '08:05:00', 1800, 'green', 2, 1, 5, NOW()),
(v_did, v_today + TIME '07:25:00', 2100, 'green', 2, 1, 4, NOW()),
(v_did, v_today + TIME '17:30:00', 1500, 'green', 1, 0, 4, NOW());

-- ═══════════════════ AGILIDAD ═══════════════════
INSERT INTO agility_sessions (dog_id, fecha, activity_type, duration_min, circuit_time_seconds, notes, created_at) VALUES
(v_did, v_today - 12, 'Saltos', 15, 45, 'Buena técnica en los saltos bajos', NOW()),
(v_did, v_today - 8, 'Túnel', 12, 58, 'Primera vez en túnel. Un poco inseguro.', NOW()),
(v_did, v_today - 5, 'Slalom', 18, 72, 'Mejorando el zigzag. 4 postes seguidos.', NOW()),
(v_did, v_today - 3, 'Saltos', 20, 38, 'Completó circuito de 6 saltos sin errores', NOW()),
(v_did, v_today, 'Combinado', 22, 95, 'Circuito completo: salto, túnel, slalom. Mejor tiempo.', NOW());

-- ═══════════════════ LOGS DIARIOS (30 días) ═══════════════════
INSERT INTO daily_logs (dog_id, fecha, estado_animo, nivel_energia, apetito, created_at)
SELECT v_did, v_today - gs, 
  (ARRAY['Feliz','Juguetón','Tranquilo','Alerta','Cariñoso','Curioso','Energético','Relajado'])[1 + (gs % 8)],
  3 + (gs % 2), 3 + ((gs+1) % 2), NOW()
FROM generate_series(0, 29) AS gs;

-- ═══════════════════ LOGS DIGESTIVOS ═══════════════════
INSERT INTO digestive_logs (dog_id, fecha, stool_type, notes, created_at)
SELECT v_did, v_today - gs, 2 + (gs % 3), CASE WHEN gs % 4 = 0 THEN 'Un poco blando' ELSE 'Normal' END, NOW()
FROM generate_series(0, 7) AS gs;

-- ═══════════════════ RETO DETOX ═══════════════════
INSERT INTO detox_progress (dog_id, day_number, completed, completed_at, created_at)
SELECT v_did, gs, true, (v_today - 6 + gs)::timestamptz, NOW()
FROM generate_series(1, 5) AS gs;

-- ═══════════════════ LOGS DE MEDICAMENTOS ═══════════════════
SELECT id INTO v_med_id FROM dog_medications WHERE dog_id = v_did AND status = 'active' LIMIT 1;
INSERT INTO dog_medication_logs (medication_id, scheduled_time, taken, taken_at, created_at)
SELECT v_med_id, (v_today - gs || 'T09:00:00')::timestamptz, gs > 0, 
  CASE WHEN gs > 0 THEN (v_today - gs || 'T09:05:00')::timestamptz ELSE NULL END, NOW()
FROM generate_series(0, 5) AS gs;

RAISE NOTICE '✅ THOR creado con todos los datos de demo. ID: %', v_did;
END $$;
