-- Insertar la aplicacion "Auto" en el ecosistema Blis Club
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM applications WHERE slug = 'auto') THEN
    INSERT INTO applications (name, slug, description, is_active)
    VALUES ('Auto', 'auto', 'PWA de gestión automotriz: bitácora, calculadoras y marketplace', true);
  END IF;
END $$;
