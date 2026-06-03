-- Agility module complete migration
-- Adds session types, foul types, obstacles, session obstacles, penalty settings, and extends agility_sessions

-- 1. Tipos de sesión/competición
CREATE TABLE IF NOT EXISTS agility_session_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  standard_obstacle_count int,
  has_contact_zones boolean DEFAULT false,
  has_time_limit boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Tipos de faltas/penalizaciones
CREATE TABLE IF NOT EXISTS agility_foul_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  default_time_penalty_seconds int DEFAULT 5,
  is_disqualification boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 3. Catálogo de obstáculos
CREATE TABLE IF NOT EXISTS agility_obstacles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  icon_name text,
  is_custom boolean DEFAULT false,
  suggested_by_user_id uuid REFERENCES profiles(id),
  approved_by_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. Ampliar agility_sessions
ALTER TABLE agility_sessions
ADD COLUMN IF NOT EXISTS session_type_id uuid REFERENCES agility_session_types(id),
ADD COLUMN IF NOT EXISTS lesson_id uuid REFERENCES lessons(id),
ADD COLUMN IF NOT EXISTS difficulty_level text CHECK (difficulty_level IN ('principiante', 'intermedio', 'avanzado')),
ADD COLUMN IF NOT EXISTS fouls_total int DEFAULT 0,
ADD COLUMN IF NOT EXISTS clean_run boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS time_fault boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS obstacles_completed_count int DEFAULT 0,
ADD COLUMN IF NOT EXISTS raw_time_seconds int,
ADD COLUMN IF NOT EXISTS net_time_seconds int;

-- 5. Tabla de obstáculos por sesión (con faltas específicas)
CREATE TABLE IF NOT EXISTS agility_session_obstacles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES agility_sessions(id) ON DELETE CASCADE,
  obstacle_id uuid NOT NULL REFERENCES agility_obstacles(id),
  used boolean DEFAULT true,
  fouls_count int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. Configuración de penalizaciones por sesión
CREATE TABLE IF NOT EXISTS agility_session_penalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES agility_sessions(id) ON DELETE CASCADE,
  foul_type_id uuid NOT NULL REFERENCES agility_foul_types(id),
  penalty_seconds int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. Insertar tipos de sesión
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

-- 8. Insertar tipos de faltas
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

-- 9. Insertar obstáculos nativos
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
ON CONFLICT DO NOTHING;
