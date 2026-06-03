-- ============================================================
-- Dog Blis Club - Migración 00027: Sistema de Compras + Unidades en Recetas
-- ============================================================

-- 1. Unidades en ingredientes de recetas
ALTER TABLE recipe_ingredients 
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'g',
ADD COLUMN IF NOT EXISTS unit_weight_g NUMERIC(8,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS display_unit TEXT;

-- Normalizar datos existentes (solo los que aún están en NULL/default)
UPDATE recipe_ingredients 
SET unit_type = 'g', 
    unit_weight_g = 1, 
    display_unit = ingredient_name || ' (g)'
WHERE unit_type IS NULL OR unit_type = 'g' AND display_unit IS NULL;

-- 2. Fix multi-tenancy: application_id en nutrition_recipes y toxic_foods
ALTER TABLE nutrition_recipes 
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id);

ALTER TABLE toxic_foods 
ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id);

-- 3. Tabla de tiendas configurables
CREATE TABLE IF NOT EXISTS purchase_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE purchase_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios gestionan sus tiendas" ON purchase_stores;
CREATE POLICY "Usuarios gestionan sus tiendas"
  ON purchase_stores FOR ALL
  USING (user_id = auth.uid());

-- 4. Tabla de historial de compras
CREATE TABLE IF NOT EXISTS shopping_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  store_id UUID REFERENCES purchase_stores(id) ON DELETE SET NULL,
  quantity NUMERIC(8,3),
  quantity_unit TEXT DEFAULT 'kg',
  currency TEXT DEFAULT 'PEN',
  price_total NUMERIC(10,2),
  price_per_kg NUMERIC(10,2),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus compras" ON shopping_purchases;
CREATE POLICY "Usuarios ven sus compras"
  ON shopping_purchases FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_shopping_purchases_user_ingredient ON shopping_purchases(user_id, ingredient_name);
CREATE INDEX IF NOT EXISTS idx_shopping_purchases_date ON shopping_purchases(purchase_date);
