ALTER TABLE dog_metabolic_profiles
  ADD COLUMN IF NOT EXISTS kibble_recipe_id UUID REFERENCES nutrition_recipes(id) ON DELETE SET NULL;