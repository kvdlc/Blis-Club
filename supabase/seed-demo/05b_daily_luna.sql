DO $$
DECLARE
  v_dog2_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT id INTO v_dog2_id FROM dogs d JOIN profiles p ON p.id = d.owner_id WHERE p.email = 'demo@blis.club' AND d.nombre = 'LUNA';

  INSERT INTO daily_logs (dog_id, fecha, nivel_estres, notas_conducta, comida_gramos) VALUES
  (v_dog2_id, v_today-0,  1, 'Muy juguetona. Buena socialización.', 380),
  (v_dog2_id, v_today-1,  2, 'Aprendiendo rápido "sentado".', 350),
  (v_dog2_id, v_today-2,  1, 'Jugó con otros perros en el parque.', 400),
  (v_dog2_id, v_today-3,  2, 'Día tranquilo.', 370),
  (v_dog2_id, v_today-4,  1, 'Muy cariñosa. Buena energía.', 390),
  (v_dog2_id, v_today-5,  2, 'Aprendió "quieto" hoy.', 360),
  (v_dog2_id, v_today-6,  1, 'Muy feliz todo el día.', 380),
  (v_dog2_id, v_today-7,  1, 'Paseo largo. Agotada pero feliz.', 350),
  (v_dog2_id, v_today-8,  2, 'Tranquila en casa.', 400),
  (v_dog2_id, v_today-9,  1, 'Buena respuesta a comandos.', 370),
  (v_dog2_id, v_today-10, 2, 'Normal.', 390),
  (v_dog2_id, v_today-11, 1, 'Juguetona. Mucha energía.', 360),
  (v_dog2_id, v_today-12, 2, 'Día de lluvia. Tranquila.', 380),
  (v_dog2_id, v_today-13, 1, 'Primera vez en túnel de agilidad.', 350),
  (v_dog2_id, v_today-14, 2, 'Normal.', 400);

  RAISE NOTICE '05b OK — 15 daily_logs LUNA';
END $$;
