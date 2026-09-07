-- ============================================================
-- Tipos de cambio (FX) cacheados
-- ============================================================
CREATE TABLE IF NOT EXISTS fx_rates (
  currency_code TEXT PRIMARY KEY,       -- ISO 4217 (e.g. 'PEN', 'USD', 'MXN')
  fx_usd_rate NUMERIC(18,6) NOT NULL,   -- 1 USD = N unidades de la moneda
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FX rates are public" ON fx_rates FOR SELECT USING (true);

-- Seed con tasas aproximadas de referencia (serán actualizadas por la app)
INSERT INTO fx_rates (currency_code, fx_usd_rate) VALUES
  ('USD', 1.000000),
  ('PEN', 3.750000),
  ('MXN', 17.500000),
  ('COP', 4100.000000),
  ('CLP', 950.000000),
  ('ARS', 900.000000),
  ('BOB', 6.900000),
  ('PYG', 7400.000000),
  ('UYU', 40.000000)
ON CONFLICT (currency_code) DO NOTHING;
