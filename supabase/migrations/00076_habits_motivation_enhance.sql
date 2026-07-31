-- Categorías para agrupar hábitos
ALTER TABLE spartan_habits ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Ampliar categorías de la biblioteca de motivación
ALTER TABLE spartan_motivation_items DROP CONSTRAINT IF EXISTS spartan_motivation_items_category_check;
ALTER TABLE spartan_motivation_items ADD CONSTRAINT spartan_motivation_items_category_check CHECK (category IN ('motivacion','seduccion','negocios','disciplina','emprendimiento','habilidades_blandas','conocimiento','vestimenta','mentalidad','relaciones','finanzas_personales','liderazgo','otro'));
