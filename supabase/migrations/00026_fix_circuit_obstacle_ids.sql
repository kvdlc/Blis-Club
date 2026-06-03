-- Fix: Update native circuits to use correct obstacle IDs after 00025 re-seed
-- First delete existing native circuits, then re-insert with current obstacle IDs

DELETE FROM agility_circuits WHERE slug IN (
  'circuito-estandar', 'jumpers-rapido', 'slalom-perfecto', 'contacto-control', 'tuneles-diversion'
);

INSERT INTO agility_circuits (name, slug, description, session_type_id, difficulty_level, standard_obstacles, is_active, is_visible)
VALUES (
  'Circuito Estándar', 'circuito-estandar', 'Circuito completo con todos los tipos de obstáculos',
  (SELECT id FROM agility_session_types WHERE slug = 'circuito-estandar'),
  'intermedio',
  jsonb_build_array(
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), 'order', 1),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Túnel cerrado'), 'order', 2),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), 'order', 3),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Puente de madera (Dog Walk)'), 'order', 4),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Neumático (Tire Jump)'), 'order', 5),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), 'order', 6),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), 'order', 7),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Túnel largo'), 'order', 8),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Rampa de subida (A-Frame)'), 'order', 9),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Aro de salto'), 'order', 10),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Balancín (Seesaw)'), 'order', 11),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla triple'), 'order', 12)
  ),
  true, true
),
(
  'Jumpers Rápido', 'jumpers-rapido', 'Solo saltos, ideal para trabajar velocidad',
  (SELECT id FROM agility_session_types WHERE slug = 'jumpers'),
  'principiante',
  jsonb_build_array(
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), 'order', 1),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), 'order', 2),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Neumático (Tire Jump)'), 'order', 3),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Aro de salto'), 'order', 4),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla triple'), 'order', 5),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Salto largo (Broad Jump)'), 'order', 6),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Pared / Panel'), 'order', 7),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), 'order', 8)
  ),
  true, true
),
(
  'Slalom Perfecto', 'slalom-perfecto', 'Enfocado en teleras y fluidez',
  (SELECT id FROM agility_session_types WHERE slug = 'secuencia-tecnica'),
  'principiante',
  jsonb_build_array(
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), 'order', 1),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), 'order', 2),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), 'order', 3),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Conos'), 'order', 4),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), 'order', 5),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), 'order', 6)
  ),
  true, true
),
(
  'Contacto y Control', 'contacto-control', 'Rampa, puente y balancín',
  (SELECT id FROM agility_session_types WHERE slug = 'agility-contacto'),
  'intermedio',
  jsonb_build_array(
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Puente de madera (Dog Walk)'), 'order', 1),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Rampa de subida (A-Frame)'), 'order', 2),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Balancín (Seesaw)'), 'order', 3),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), 'order', 4),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Escalera de contacto'), 'order', 5),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Escalones / Plataformas'), 'order', 6)
  ),
  true, true
),
(
  'Túneles y Diversión', 'tuneles-diversion', 'Circuito divertido con túneles',
  (SELECT id FROM agility_session_types WHERE slug = 'entrenamiento-libre'),
  'principiante',
  jsonb_build_array(
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Túnel cerrado'), 'order', 1),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Túnel de tela (Chute)'), 'order', 2),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Túnel largo'), 'order', 3),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Laberinto de túneles'), 'order', 4),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Conos'), 'order', 5),
    jsonb_build_object('obstacle_id', (SELECT id FROM agility_obstacles WHERE name = 'Cavaletti (varillas)'), 'order', 6)
  ),
  true, true
);
