-- Add breed size column to dogs table
ALTER TABLE dogs ADD COLUMN tamano TEXT DEFAULT NULL;

-- Add breed_sizes column to nutrition_recipes
ALTER TABLE nutrition_recipes ADD COLUMN breed_sizes TEXT[] DEFAULT '{}';
