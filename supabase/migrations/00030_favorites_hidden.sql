-- Fix: Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Usuarios ven solo sus favoritos" ON user_favorite_recipes;
DROP POLICY IF EXISTS "Usuarios gestionan sus favoritos" ON user_favorite_recipes;
DROP POLICY IF EXISTS "Usuarios ven solo sus ocultas" ON user_hidden_recipes;
DROP POLICY IF EXISTS "Usuarios gestionan sus ocultas" ON user_hidden_recipes;

-- Recreate tables if missing
CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS user_hidden_recipes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES nutrition_recipes(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE user_favorite_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hidden_recipes ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Usuarios ven solo sus favoritos"
  ON user_favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus favoritos"
  ON user_favorite_recipes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios ven solo sus ocultas"
  ON user_hidden_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus ocultas"
  ON user_hidden_recipes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indices
CREATE INDEX IF NOT EXISTS idx_user_fav_user ON user_favorite_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fav_recipe ON user_favorite_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_user ON user_hidden_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_recipe ON user_hidden_recipes(recipe_id);
