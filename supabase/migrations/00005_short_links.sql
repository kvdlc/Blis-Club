-- Short links for QR codes and redirects
CREATE TABLE IF NOT EXISTS short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read short links" ON short_links FOR SELECT USING (true);

CREATE POLICY "Auth users can create short links" ON short_links FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth users can update own short links" ON short_links FOR UPDATE USING (auth.uid() IS NOT NULL);
