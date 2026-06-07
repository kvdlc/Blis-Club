-- ============================================================
-- 39. PRODUCTOS DE COMPRA ÚNICA
-- ============================================================

-- Tabla de productos (compra única, no suscripción)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INT DEFAULT NULL, -- NULL = ilimitado
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos visibles para todos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Admin gestiona productos"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Tabla de órdenes de compra única
CREATE TABLE IF NOT EXISTS product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL,
  total_price_cents INT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
  payment_method TEXT,
  izipay_transaction_id TEXT,
  shipping_address JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus órdenes"
  ON product_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin gestiona órdenes"
  ON product_orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_application ON products(application_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_orders_user ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_product ON product_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_product_orders_created ON product_orders(created_at DESC);

-- Función RPC para obtener last_sign_in_at de auth.users (solo para admin/service_role)
CREATE OR REPLACE FUNCTION get_users_last_sign_in(user_ids UUID[])
RETURNS TABLE (id UUID, last_sign_in_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id::UUID, u.last_sign_in_at::TIMESTAMPTZ
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para updated_at en products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_orders_updated_at ON product_orders;
CREATE TRIGGER update_product_orders_updated_at
  BEFORE UPDATE ON product_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
