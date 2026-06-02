DO $$
DECLARE
  v_dog1_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_dog1_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'MAX';

  INSERT INTO daily_logs (dog_id, fecha, nivel_estres, notas_conducta, comida_gramos) VALUES
  (v_dog1_id, v_today-0,  2, 'Día excelente. Todos los comandos bien.', 550),
  (v_dog1_id, v_today-1,  1, 'Muy tranquilo. Buen paseo.', 520),
  (v_dog1_id, v_today-2,  3, 'Reactivo con motos en el parque.', 500),
  (v_dog1_id, v_today-3,  2, 'Día normal.', 530),
  (v_dog1_id, v_today-4,  1, 'Excelente. Cero tirones.', 510),
  (v_dog1_id, v_today-5,  3, 'Algo tenso con otros perros.', 540),
  (v_dog1_id, v_today-6,  2, 'Tranquilo.', 500),
  (v_dog1_id, v_today-7,  2, 'Día normal. Buena energía.', 550),
  (v_dog1_id, v_today-8,  1, 'Muy buen comportamiento.', 520),
  (v_dog1_id, v_today-9,  3, 'Reactivo con ruidos fuertes.', 500),
  (v_dog1_id, v_today-10, 2, 'Día tranquilo en casa.', 530),
  (v_dog1_id, v_today-11, 1, 'Excelente paseo matutino.', 510),
  (v_dog1_id, v_today-12, 3, 'Un poco estresado.', 540),
  (v_dog1_id, v_today-13, 2, 'Normal.', 500),
  (v_dog1_id, v_today-14, 2, 'Buena sesión de agilidad.', 550),
  (v_dog1_id, v_today-15, 1, 'Muy relajado todo el día.', 520),
  (v_dog1_id, v_today-16, 3, 'Ladró a un gato en la calle.', 500),
  (v_dog1_id, v_today-17, 2, 'Tranquilo.', 530),
  (v_dog1_id, v_today-18, 1, 'Paseo largo, muy feliz.', 510),
  (v_dog1_id, v_today-19, 3, 'Alerta por visita en casa.', 540),
  (v_dog1_id, v_today-20, 2, 'Normal.', 500),
  (v_dog1_id, v_today-21, 2, 'Día sin novedad.', 550),
  (v_dog1_id, v_today-22, 1, 'Tranquilo y cariñoso.', 520),
  (v_dog1_id, v_today-23, 3, 'Reacción a fuegos artificiales.', 500),
  (v_dog1_id, v_today-24, 2, 'Normal.', 530),
  (v_dog1_id, v_today-25, 1, 'Muy buen día.', 510),
  (v_dog1_id, v_today-26, 3, 'Algo nervioso.', 540),
  (v_dog1_id, v_today-27, 2, 'Tranquilo.', 500),
  (v_dog1_id, v_today-28, 2, 'Día normal.', 550),
  (v_dog1_id, v_today-29, 1, 'Excelente comportamiento.', 520);

  RAISE NOTICE '05a OK — 30 daily_logs MAX';
END $$;
