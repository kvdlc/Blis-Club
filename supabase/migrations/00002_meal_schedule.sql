-- ============================================================
-- Dog Blis Club - Migración: Sistema de Agendado de Comidas
-- ============================================================

-- ============================================================
-- 1. RECIPE_STEPS (Pasos de preparación)
-- ============================================================
CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL CHECK (step_number >= 1),
  instruction TEXT NOT NULL,
  image_url TEXT,
  duration_min INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pasos visibles para todos"
  ON recipe_steps FOR SELECT
  USING (true);

-- ============================================================
-- 2. RECIPE_NUTRITION_FACTS (Macros y micronutrientes por 100g)
-- ============================================================
CREATE TABLE recipe_nutrition_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL UNIQUE REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  protein_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fiber_g NUMERIC(6,2),
  moisture_g NUMERIC(6,2),
  ash_g NUMERIC(6,2),
  calcium_mg NUMERIC(8,2),
  phosphorus_mg NUMERIC(8,2),
  iron_mg NUMERIC(8,2),
  zinc_mg NUMERIC(8,2),
  vitamin_a_ui NUMERIC(8,2),
  vitamin_d_ui NUMERIC(8,2),
  vitamin_e_mg NUMERIC(8,2),
  omega3_g NUMERIC(6,2),
  omega6_g NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipe_nutrition_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricion visibles para todos"
  ON recipe_nutrition_facts FOR SELECT
  USING (true);

-- ============================================================
-- 3. DOG_MEAL_SLOTS (Horarios configurables de comida por perro)
-- ============================================================
CREATE TABLE dog_meal_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  slot_index INT NOT NULL CHECK (slot_index >= 0 AND slot_index <= 7),
  label TEXT NOT NULL DEFAULT 'Comida',
  time_of_day TIME NOT NULL DEFAULT '08:00:00',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dog_id, slot_index)
);

ALTER TABLE dog_meal_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven horarios de sus perros"
  ON dog_meal_slots FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_meal_slots.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios gestionan horarios de sus perros"
  ON dog_meal_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_meal_slots.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 4. MEAL_SCHEDULE (Agenda de comidas)
-- ============================================================
CREATE TYPE meal_status AS ENUM ('scheduled', 'fed', 'skipped', 'suggested');

CREATE TABLE meal_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES nutrition_recipes(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_slot_index INT NOT NULL CHECK (meal_slot_index >= 0 AND meal_slot_index <= 7),
  status meal_status DEFAULT 'scheduled',
  gramos INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dog_id, fecha, meal_slot_index)
);

ALTER TABLE meal_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven agenda de sus perros"
  ON meal_schedule FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = meal_schedule.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios gestionan agenda de sus perros"
  ON meal_schedule FOR ALL
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = meal_schedule.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- INDICES
-- ============================================================
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);
CREATE INDEX idx_meal_schedule_dog_date ON meal_schedule(dog_id, fecha);
CREATE INDEX idx_meal_schedule_date ON meal_schedule(fecha);
CREATE INDEX idx_dog_meal_slots_dog ON dog_meal_slots(dog_id, slot_index);

-- Trigger para actualizar updated_at en meal_schedule
CREATE OR REPLACE FUNCTION update_meal_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meal_schedule_updated_at
  BEFORE UPDATE ON meal_schedule
  FOR EACH ROW EXECUTE FUNCTION update_meal_schedule_updated_at();
