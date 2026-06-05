-- Add benefits and storage_instructions columns to nutrition_recipes
ALTER TABLE nutrition_recipes
  ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS storage_instructions TEXT;
