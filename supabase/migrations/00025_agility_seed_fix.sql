-- Emergency seed fix for agility module data
-- Re-inserts session types, foul types, obstacles, and circuits safely

-- 1. Session types
INSERT INTO agility_session_types (name, slug, description, standard_obstacle_count, has_contact_zones, has_time_limit) VALUES
  ('Entrenamiento libre', 'entrenamiento-libre', 'Sesión sin formato fijo', null, false, false),
  ('Circuito estándar', 'circuito-estandar', 'Agility Standard con todos los obstáculos', 14, true, true),
  ('Jumpers', 'jumpers', 'Solo saltos, sin contacto', 16, false, true),
  ('Agility con contacto', 'agility-contacto', 'Enfocado en zonas de contacto', 10, true, true),
  ('Snooker', 'snooker', 'Circuito tipo Snooker con puntos', 12, false, true),
  ('Gamblers', 'gamblers', 'Velocidad con desafío a distancia', 10, false, true),
  ('Steeplechase', 'steeplechase', 'Velocidad pura con obstáculos variados', 12, false, true),
  ('Relevos (Pairs)', 'relevos', 'Circuito en pareja de perros', 14, true, true),
  ('Power & Speed', 'power-speed', 'Primera parte técnica, segunda velocidad', 16, true, true),
  ('Secuencia técnica', 'secuencia-tecnica', 'Enfoque en transiciones entre obstáculos', 6, false, true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Foul types
INSERT INTO agility_foul_types (name, slug, default_time_penalty_seconds, is_disqualification, description) VALUES
  ('Negativa (Refusal)', 'negativa', 5, false, 'El perro se niega a realizar el obstáculo'),
  ('Derribo (Knock-down)', 'derribo', 5, false, 'El perro derriba una barra de salto'),
  ('Falta de contacto', 'falta-contacto', 5, false, 'No pisa la zona de contacto en rampa/puente/balancín'),
  ('Slalom incompleto', 'slalom-incompleto', 5, false, 'Sale del slalom antes de terminar'),
  ('Mesa: no pausar', 'mesa-no-pausar', 5, false, 'No se queda quieto en la mesa el tiempo requerido'),
  ('Salida de área (Run-out)', 'salida-area', 5, false, 'El perro sale del área del obstáculo sin completarlo'),
  ('Fuera de tiempo', 'fuera-tiempo', 1, false, 'Excede el tiempo máximo permitido (+1 seg por segundo)'),
  ('Curso incorrecto', 'curso-incorrecto', 0, true, 'Toma un obstáculo fuera de orden (descalificación)')
ON CONFLICT (slug) DO NOTHING;

-- 3. Obstacles (with unique name constraint handled via ON CONFLICT)
INSERT INTO agility_obstacles (name, category, icon_name, is_custom, approved_by_admin) VALUES
  ('Puente de madera (Dog Walk)', 'contacto', 'Zap', false, true),
  ('Rampa de subida (A-Frame)', 'contacto', 'Triangle', false, true),
  ('Balancín (Seesaw)', 'contacto', 'Scale', false, true),
  ('Valla simple', 'salto', 'Fence', false, true),
  ('Valla doble (Oxer)', 'salto', 'AlignVerticalSpaceBetween', false, true),
  ('Valla triple', 'salto', 'Layers', false, true),
  ('Neumático (Tire Jump)', 'salto', 'Circle', false, true),
  ('Mesa de pausa (Pause Table)', 'salto', 'Table', false, true),
  ('Pared / Panel', 'salto', 'PanelTop', false, true),
  ('Salto largo (Broad Jump)', 'salto', 'MoveHorizontal', false, true),
  ('Aro de salto', 'salto', 'CircleDot', false, true),
  ('Slalom / Teleras', 'slalom', 'Waves', false, true),
  ('Túnel cerrado', 'tunel', 'ArrowRightFromLine', false, true),
  ('Túnel de tela (Chute)', 'tunel', 'Shrink', false, true),
  ('Túnel largo', 'tunel', 'ArrowBigRight', false, true),
  ('Conos', 'entrenamiento', 'Cone', false, true),
  ('Escalones / Plataformas', 'entrenamiento', 'SquareStack', false, true),
  ('Cavaletti (varillas)', 'entrenamiento', 'Minus', false, true),
  ('Escalera de contacto', 'entrenamiento', 'Ladder', false, true),
  ('Laberinto de túneles', 'entrenamiento', 'GitBranch', false, true)
ON CONFLICT ON CONSTRAINT agility_obstacles_name_unique DO NOTHING;

-- 4. Native circuits (inserted with jsonb_build_array to avoid string escaping issues)
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
)
ON CONFLICT (slug) DO NOTHING;
