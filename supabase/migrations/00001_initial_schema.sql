-- ============================================================
-- Dog Blis Club - Schema inicial (20 tablas + RLS + triggers)
-- ============================================================

-- ============================================================
-- 1. PROFILES (se crea automaticamente al registrarse)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: crear perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. DOGS
-- ============================================================
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  raza TEXT NOT NULL,
  edad_meses INT NOT NULL,
  peso_kg NUMERIC(5,2) NOT NULL,
  objetivo_principal TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios perros"
  ON dogs FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Usuarios crean sus propios perros"
  ON dogs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuarios actualizan sus propios perros"
  ON dogs FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Usuarios eliminan sus propios perros"
  ON dogs FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================
-- 3. DAILY_LOGS (registro diario original)
-- ============================================================
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  nivel_estres INT CHECK (nivel_estres >= 1 AND nivel_estres <= 5),
  notas_conducta TEXT,
  comida_gramos INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven logs de sus perros"
  ON daily_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = daily_logs.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean logs de sus perros"
  ON daily_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = daily_logs.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 4. DOG_METABOLIC_PROFILES
-- ============================================================
CREATE TYPE activity_level AS ENUM ('sedentario', 'moderado', 'activo', 'atletico');

CREATE TABLE dog_metabolic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL UNIQUE REFERENCES dogs(id) ON DELETE CASCADE,
  activity_level activity_level DEFAULT 'moderado',
  allergies TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  feeding_pct NUMERIC(3,1) DEFAULT 2.5,
  custom_meat_pct NUMERIC(5,2) DEFAULT 50.00,
  custom_bone_pct NUMERIC(5,2) DEFAULT 20.00,
  custom_organ_pct NUMERIC(5,2) DEFAULT 10.00,
  custom_veggie_pct NUMERIC(5,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dog_metabolic_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven perfil metabolico de sus perros"
  ON dog_metabolic_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_metabolic_profiles.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean perfil metabolico de sus perros"
  ON dog_metabolic_profiles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_metabolic_profiles.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios actualizan perfil metabolico de sus perros"
  ON dog_metabolic_profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_metabolic_profiles.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 5. NUTRITION_RECIPES
-- ============================================================
CREATE TYPE recipe_category AS ENUM ('diario', 'snack', 'helado', 'pastel');
CREATE TYPE recipe_difficulty AS ENUM ('facil', 'medio', 'avanzado');

CREATE TABLE nutrition_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category recipe_category DEFAULT 'diario',
  image_url TEXT,
  video_url TEXT,
  is_therapeutic BOOLEAN DEFAULT false,
  health_tags TEXT[] DEFAULT '{}',
  source_book TEXT,
  prep_time_min INT,
  difficulty recipe_difficulty DEFAULT 'facil',
  kcal_per_100g NUMERIC(6,2),
  is_detox BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nutrition_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recetas visibles para todos los usuarios"
  ON nutrition_recipes FOR SELECT
  USING (true);

-- ============================================================
-- 6. RECIPE_INGREDIENTS
-- ============================================================
CREATE TYPE ingredient_type AS ENUM ('proteina', 'hueso', 'viscera', 'vegetal', 'suplemento', 'otro');

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity_per_serving_g INT NOT NULL,
  ingredient_type ingredient_type DEFAULT 'otro'
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredientes visibles para todos"
  ON recipe_ingredients FOR SELECT
  USING (true);

-- ============================================================
-- 7. NUTRITION_LOGS
-- ============================================================
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES nutrition_recipes(id) ON DELETE SET NULL,
  gramos_servidos INT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven logs de nutricion de sus perros"
  ON nutrition_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = nutrition_logs.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean logs de nutricion de sus perros"
  ON nutrition_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = nutrition_logs.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 8. WALKS
-- ============================================================
CREATE TYPE traffic_light AS ENUM ('green', 'yellow', 'red');

CREATE TABLE walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_sec INT,
  pipi_count INT DEFAULT 0,
  popo_count INT DEFAULT 0,
  traffic_light traffic_light,
  trigger_tags TEXT[] DEFAULT '{}',
  stool_rating INT CHECK (stool_rating >= 1 AND stool_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven paseos de sus perros"
  ON walks FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = walks.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean paseos de sus perros"
  ON walks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = walks.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios actualizan paseos de sus perros"
  ON walks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = walks.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 9. DIGESTIVE_LOGS
-- ============================================================
CREATE TABLE digestive_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  stool_type INT CHECK (stool_type >= 1 AND stool_type <= 7),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE digestive_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven logs digestivos de sus perros"
  ON digestive_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = digestive_logs.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean logs digestivos de sus perros"
  ON digestive_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = digestive_logs.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 10. AGILITY_SESSIONS
-- ============================================================
CREATE TABLE agility_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL,
  duration_min INT NOT NULL,
  circuit_time_seconds INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agility_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sesiones agility de sus perros"
  ON agility_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = agility_sessions.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios crean sesiones agility de sus perros"
  ON agility_sessions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = agility_sessions.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 11. STAGES (Etapas de la Academia)
-- ============================================================
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  "order" INT NOT NULL UNIQUE,
  color_hex TEXT DEFAULT '#2563EB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Etapas visibles para todos"
  ON stages FOR SELECT
  USING (true);

-- ============================================================
-- 12. MODULES (Modulos de la Academia)
-- ============================================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INT NOT NULL,
  icon_name TEXT DEFAULT 'BookOpen',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stage_id, "order")
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modulos visibles para todos"
  ON modules FOR SELECT
  USING (true);

-- ============================================================
-- 13. LESSONS (Lecciones de la Academia)
-- ============================================================
CREATE TYPE lesson_type AS ENUM ('theory', 'minigame_reflejos', 'minigame_diccionario', 'practice_timer');

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type lesson_type DEFAULT 'theory',
  "order" INT NOT NULL,
  content_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, "order")
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecciones visibles para todos"
  ON lessons FOR SELECT
  USING (true);

-- ============================================================
-- 14. USER_PROGRESS (Progreso en lecciones)
-- ============================================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  score INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su propio progreso"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su propio progreso"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios modifican su propio progreso"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 15. BADGES
-- ============================================================
CREATE TYPE badge_type AS ENUM ('academia', 'tracker', 'streak');

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  badge_type badge_type DEFAULT 'tracker',
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insignias visibles para todos"
  ON badges FOR SELECT
  USING (true);

-- ============================================================
-- 16. USER_BADGES
-- ============================================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propias insignias"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios ganan insignias"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 17. USER_STREAKS (Rachas)
-- ============================================================
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL DEFAULT 'walk',
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propias rachas"
  ON user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus rachas"
  ON user_streaks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 18. TOXIC_FOODS
-- ============================================================
CREATE TYPE severity_level AS ENUM ('bajo', 'medio', 'alto', 'mortal');

CREATE TABLE toxic_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_toxic BOOLEAN DEFAULT true,
  severity severity_level DEFAULT 'medio',
  explanation TEXT,
  symptoms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE toxic_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alimentos toxicos visibles para todos"
  ON toxic_foods FOR SELECT
  USING (true);

-- ============================================================
-- 19. DETOX_DAYS
-- ============================================================
CREATE TABLE detox_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INT NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 14),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  warning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE detox_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dias detox visibles para todos"
  ON detox_days FOR SELECT
  USING (true);

-- ============================================================
-- 20. DETOX_PROGRESS
-- ============================================================
CREATE TABLE detox_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dog_id, day_number)
);

ALTER TABLE detox_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven progreso detox de sus perros"
  ON detox_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = detox_progress.dog_id AND dogs.owner_id = auth.uid()));

CREATE POLICY "Usuarios actualizan progreso detox de sus perros"
  ON detox_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM dogs WHERE dogs.id = detox_progress.dog_id AND dogs.owner_id = auth.uid()));

-- ============================================================
-- 21. WEEKLY_CHALLENGES
-- ============================================================
CREATE TABLE weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  link_whatsapp TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Retos visibles para todos"
  ON weekly_challenges FOR SELECT
  USING (true);

-- ============================================================
-- 22. USER_CHALLENGES
-- ============================================================
CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus retos"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios completan retos"
  ON user_challenges FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 23. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus notificaciones"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios marcan notificaciones como leidas"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 24. PLANS (Suscripciones)
-- ============================================================
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  izipay_price_id TEXT,
  max_dogs INT DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planes visibles para todos"
  ON plans FOR SELECT
  USING (true);

-- ============================================================
-- 25. SUBSCRIPTIONS
-- ============================================================
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  izipay_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su suscripcion"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 26. SHOPPING_LIST
-- ============================================================
CREATE TABLE shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity_g INT,
  checked BOOLEAN DEFAULT false,
  week_start DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su lista de compras"
  ON shopping_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan su lista de compras"
  ON shopping_list FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- INDICES
-- ============================================================
CREATE INDEX idx_dogs_owner ON dogs(owner_id);
CREATE INDEX idx_daily_logs_dog ON daily_logs(dog_id, fecha);
CREATE INDEX idx_walks_dog_date ON walks(dog_id, start_time);
CREATE INDEX idx_digestive_logs_dog ON digestive_logs(dog_id, fecha);
CREATE INDEX idx_nutrition_logs_dog ON nutrition_logs(dog_id, fecha);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_lessons_module ON lessons(module_id, "order");
CREATE INDEX idx_modules_stage ON modules(stage_id, "order");
CREATE INDEX idx_agility_sessions_dog ON agility_sessions(dog_id, fecha);
CREATE INDEX idx_notifications_user ON notifications(user_id, leida);
CREATE INDEX idx_detox_progress_dog ON detox_progress(dog_id);
CREATE INDEX idx_shopping_list_user ON shopping_list(user_id, checked);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
