-- Agility Circuits: native admin circuits + user custom circuits

-- 1. Native circuits (managed by superadmin)
CREATE TABLE IF NOT EXISTS agility_circuits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  session_type_id uuid REFERENCES agility_session_types(id),
  difficulty_level text CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')),
  standard_obstacles jsonb DEFAULT '[]', -- array of {obstacle_id: string, order: number}
  is_active boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  application_id uuid REFERENCES applications(id),
  created_at timestamptz DEFAULT now()
);

-- 2. User custom circuits (saved by users, can be suggested to admin)
CREATE TABLE IF NOT EXISTS agility_custom_circuits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id uuid REFERENCES dogs(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  session_type_id uuid REFERENCES agility_session_types(id),
  difficulty_level text CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')),
  obstacles jsonb DEFAULT '[]', -- array of {obstacle_id: string, order: number}
  is_active boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  suggested_to_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insert sample native circuits
INSERT INTO agility_circuits (name, slug, description, session_type_id, difficulty_level, standard_obstacles, is_active, is_visible) VALUES
  ('Circuito Estándar', 'circuito-estandar', 'Circuito completo con todos los tipos de obstáculos', (SELECT id FROM agility_session_types WHERE slug = 'circuito-estandar'), 'intermedio', '[
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), "order": 1},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Túnel cerrado'), "order": 2},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), "order": 3},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Puente de madera (Dog Walk)'), "order": 4},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Neumático (Tire Jump)'), "order": 5},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), "order": 6},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), "order": 7},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Túnel largo'), "order": 8},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Rampa de subida (A-Frame)'), "order": 9},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Aro de salto'), "order": 10},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Balancín (Seesaw)'), "order": 11},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla triple'), "order": 12}
  ]', true, true),
  ('Jumpers Rápido', 'jumpers-rapido', 'Solo saltos, ideal para trabajar velocidad', (SELECT id FROM agility_session_types WHERE slug = 'jumpers'), 'principiante', '[
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), "order": 1},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), "order": 2},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Neumático (Tire Jump)'), "order": 3},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Aro de salto'), "order": 4},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla triple'), "order": 5},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Salto largo (Broad Jump)'), "order": 6},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Pared / Panel'), "order": 7},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), "order": 8}
  ]', true, true),
  ('Slalom Perfecto', 'slalom-perfecto', 'Enfocado en teleras y fluidez', (SELECT id FROM agility_session_types WHERE slug = 'secuencia-tecnica'), 'principiante', '[
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), "order": 1},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla simple'), "order": 2},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), "order": 3},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Conos'), "order": 4},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Slalom / Teleras'), "order": 5},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Valla doble (Oxer)'), "order": 6}
  ]', true, true),
  ('Contacto y Control', 'contacto-control', 'Rampa, puente y balancín', (SELECT id FROM agility_session_types WHERE slug = 'agility-contacto'), 'intermedio', '[
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Puente de madera (Dog Walk)'), "order": 1},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Rampa de subida (A-Frame)'), "order": 2},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Balancín (Seesaw)'), "order": 3},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Mesa de pausa (Pause Table)'), "order": 4},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Escalera de contacto'), "order": 5},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Escalones / Plataformas'), "order": 6}
  ]', true, true),
  ('Túneles y Diversión', 'tuneles-diversion', 'Circuito divertido con túneles', (SELECT id FROM agility_session_types WHERE slug = 'entrenamiento-libre'), 'principiante', '[
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Túnel cerrado'), "order": 1},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Túnel de tela (Chute)'), "order": 2},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Túnel largo'), "order": 3},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Laberinto de túneles'), "order": 4},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Conos'), "order": 5},
    {"obstacle_id": (SELECT id FROM agility_obstacles WHERE name = 'Cavaletti (varillas)'), "order": 6}
  ]', true, true)
ON CONFLICT (slug) DO NOTHING;
