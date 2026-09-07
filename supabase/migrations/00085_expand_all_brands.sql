-- ============================================================
-- Expandir TODAS las marcas existentes (lineups LATAM)
-- ============================================================

-- Marcas nuevas
INSERT INTO vehicle_catalog_makes (nombre, slug, pais_origen) VALUES
  ('Volkswagen', 'volkswagen', 'Alemania'),
  ('Renault', 'renault', 'Francia'),
  ('Mazda', 'mazda', 'Japón'),
  ('Mitsubishi', 'mitsubishi', 'Japón'),
  ('Peugeot', 'peugeot', 'Francia'),
  ('Subaru', 'subaru', 'Japón'),
  ('BYD', 'byd', 'China'),
  ('Great Wall', 'great-wall', 'China'),
  ('JAC', 'jac', 'China'),
  ('DFSK', 'dfsk', 'China'),
  ('MG', 'mg', 'China'),
  ('Geely', 'geely', 'China')
ON CONFLICT (nombre) DO NOTHING;

-- Modelos (todas las marcas)
INSERT INTO vehicle_catalog_models (make_id, nombre, slug, tipo_vehiculo)
SELECT m.id, v.nombre, v.slug, v.tipo
FROM (VALUES
  -- Toyota
  ('toyota', 'Yaris Cross', 'yaris-cross', 'suv'),
  ('toyota', 'Rav4', 'rav4', 'suv'),
  ('toyota', 'Fortuner', 'fortuner', 'suv'),
  ('toyota', 'Land Cruiser Prado', 'prado', 'suv'),
  ('toyota', 'Agya', 'agya', 'auto'),
  ('toyota', 'Avanza', 'avanza', 'furgoneta'),
  ('toyota', 'Etios', 'etios', 'auto'),
  ('toyota', 'Rush', 'rush', 'suv'),
  ('toyota', 'Tacoma', 'tacoma', 'pickup'),
  -- Hyundai
  ('hyundai', 'Tucson', 'tucson', 'suv'),
  ('hyundai', 'Santa Fe', 'santa-fe', 'suv'),
  ('hyundai', 'Grand i10', 'grand-i10', 'auto'),
  ('hyundai', 'HB20', 'hb20', 'auto'),
  ('hyundai', 'Elantra', 'elantra', 'auto'),
  ('hyundai', 'Kona', 'kona', 'suv'),
  ('hyundai', 'Starex', 'starex', 'furgoneta'),
  -- Kia
  ('kia', 'Picanto', 'picanto', 'auto'),
  ('kia', 'Soluto', 'soluto', 'auto'),
  ('kia', 'Seltos', 'seltos', 'suv'),
  ('kia', 'Sorento', 'sorento', 'suv'),
  ('kia', 'Carnival', 'carnival', 'furgoneta'),
  ('kia', 'Stonic', 'stonic', 'suv'),
  ('kia', 'Cerato', 'cerato', 'auto'),
  -- Suzuki
  ('suzuki', 'Baleno', 'baleno', 'auto'),
  ('suzuki', 'Ciaz', 'ciaz', 'auto'),
  ('suzuki', 'Ertiga', 'ertiga', 'furgoneta'),
  ('suzuki', 'Jimny', 'jimny', 'suv'),
  ('suzuki', 'Ignis', 'ignis', 'auto'),
  ('suzuki', 'Celerio', 'celerio', 'auto'),
  ('suzuki', 'Fronx', 'fronx', 'suv'),
  ('suzuki', 'Grand Vitara', 'grand-vitara', 'suv'),
  -- Chevrolet
  ('chevrolet', 'Spark GT', 'spark-gt', 'auto'),
  ('chevrolet', 'Sail', 'sail', 'auto'),
  ('chevrolet', 'Cruze', 'cruze', 'auto'),
  ('chevrolet', 'Tracker', 'tracker', 'suv'),
  ('chevrolet', 'Captiva', 'captiva', 'suv'),
  ('chevrolet', 'Colorado', 'colorado', 'pickup'),
  ('chevrolet', 'S10', 's10', 'pickup'),
  ('chevrolet', 'N300', 'n300', 'furgoneta'),
  ('chevrolet', 'Groove', 'groove', 'suv'),
  -- Nissan
  ('nissan', 'March', 'march', 'auto'),
  ('nissan', 'Sentra', 'sentra', 'auto'),
  ('nissan', 'Kicks', 'kicks', 'suv'),
  ('nissan', 'X-Trail', 'x-trail', 'suv'),
  ('nissan', 'Qashqai', 'qashqai', 'suv'),
  ('nissan', 'NP300', 'np300', 'pickup'),
  -- Jeep
  ('jeep', 'Compass', 'compass', 'suv'),
  ('jeep', 'Wrangler', 'wrangler', 'suv'),
  ('jeep', 'Grand Cherokee', 'grand-cherokee', 'suv'),
  ('jeep', 'Gladiator', 'gladiator', 'pickup'),
  ('jeep', 'Commander', 'commander', 'suv'),
  -- Ford
  ('ford', 'F-150', 'f-150', 'pickup'),
  ('ford', 'Escape', 'escape', 'suv'),
  ('ford', 'Explorer', 'explorer', 'suv'),
  ('ford', 'Territory', 'territory', 'suv'),
  ('ford', 'Maverick', 'maverick', 'pickup'),
  ('ford', 'Everest', 'everest', 'suv'),
  ('ford', 'Transit', 'transit', 'furgoneta'),
  -- Honda
  ('honda', 'City', 'city', 'auto'),
  ('honda', 'Civic', 'civic', 'auto'),
  ('honda', 'CR-V', 'cr-v', 'suv'),
  ('honda', 'HR-V', 'hr-v', 'suv'),
  ('honda', 'Fit', 'fit', 'auto'),
  ('honda', 'BR-V', 'br-v', 'furgoneta'),
  -- Yamaha (motos)
  ('yamaha', 'FZ 150', 'fz-150', 'moto'),
  ('yamaha', 'FZ 250', 'fz-250', 'moto'),
  ('yamaha', 'R15', 'r15', 'moto'),
  ('yamaha', 'MT-03', 'mt-03', 'moto'),
  ('yamaha', 'MT-07', 'mt-07', 'moto'),
  ('yamaha', 'XTZ 250', 'xtz-250', 'moto'),
  ('yamaha', 'Crypton 110', 'crypton-110', 'moto'),
  -- Volkswagen
  ('volkswagen', 'Gol', 'gol', 'auto'),
  ('volkswagen', 'Virtus', 'virtus', 'auto'),
  ('volkswagen', 'T-Cross', 't-cross', 'suv'),
  ('volkswagen', 'Nivus', 'nivus', 'suv'),
  ('volkswagen', 'Amarok', 'amarok', 'pickup'),
  ('volkswagen', 'Saveiro', 'saveiro', 'pickup'),
  ('volkswagen', 'Tiguan', 'tiguan', 'suv'),
  ('volkswagen', 'Jetta', 'jetta', 'auto'),
  -- Renault
  ('renault', 'Duster', 'duster', 'suv'),
  ('renault', 'Captur', 'captur', 'suv'),
  ('renault', 'Koleos', 'koleos', 'suv'),
  ('renault', 'Sandero', 'sandero', 'auto'),
  ('renault', 'Logan', 'logan', 'auto'),
  ('renault', 'Stepway', 'stepway', 'auto'),
  ('renault', 'Kwid', 'kwid', 'auto'),
  ('renault', 'Oroch', 'oroch', 'pickup'),
  -- Mazda
  ('mazda', 'Mazda2', 'mazda2', 'auto'),
  ('mazda', 'Mazda3', 'mazda3', 'auto'),
  ('mazda', 'CX-30', 'cx-30', 'suv'),
  ('mazda', 'CX-5', 'cx-5', 'suv'),
  ('mazda', 'BT-50', 'bt-50', 'pickup'),
  -- Mitsubishi
  ('mitsubishi', 'L200', 'l200', 'pickup'),
  ('mitsubishi', 'Montero Sport', 'montero-sport', 'suv'),
  ('mitsubishi', 'Outlander', 'outlander', 'suv'),
  ('mitsubishi', 'ASX', 'asx', 'suv'),
  ('mitsubishi', 'Eclipse Cross', 'eclipse-cross', 'suv'),
  -- Peugeot
  ('peugeot', '208', '208', 'auto'),
  ('peugeot', '2008', '2008', 'suv'),
  ('peugeot', '3008', '3008', 'suv'),
  ('peugeot', 'Landtrek', 'landtrek', 'pickup'),
  ('peugeot', 'Expert', 'expert', 'furgoneta'),
  -- Subaru
  ('subaru', 'Forester', 'forester', 'suv'),
  ('subaru', 'Outback', 'outback', 'suv'),
  ('subaru', 'XV', 'xv', 'suv'),
  ('subaru', 'Impreza', 'impreza', 'auto'),
  -- BYD
  ('byd', 'Dolphin', 'dolphin', 'auto'),
  ('byd', 'Seal', 'seal', 'auto'),
  ('byd', 'Yuan Plus', 'yuan-plus', 'suv'),
  ('byd', 'Song Plus', 'song-plus', 'suv'),
  -- Great Wall
  ('great-wall', 'Poer', 'poer', 'pickup'),
  ('great-wall', 'Haval H6', 'haval-h6', 'suv'),
  ('great-wall', 'Haval Jolion', 'haval-jolion', 'suv'),
  -- JAC
  ('jac', 'T8', 't8', 'pickup'),
  ('jac', 'JS4', 'js4', 'suv'),
  ('jac', 'S3', 's3', 'suv'),
  -- DFSK
  ('dfsk', 'Glory 580', 'glory-580', 'suv'),
  ('dfsk', 'C35', 'c35', 'furgoneta'),
  ('dfsk', 'T5', 't5', 'suv'),
  -- MG
  ('mg', 'MG5', 'mg5', 'auto'),
  ('mg', 'MG ZS', 'mg-zs', 'suv'),
  ('mg', 'MG HS', 'mg-hs', 'suv'),
  ('mg', 'MG One', 'mg-one', 'suv'),
  -- Geely
  ('geely', 'Coolray', 'coolray', 'suv'),
  ('geely', 'Okavango', 'okavango', 'suv'),
  ('geely', 'Emgrand', 'emgrand', 'auto')
) AS v(make_slug, nombre, slug, tipo)
JOIN vehicle_catalog_makes m ON m.slug = v.make_slug
ON CONFLICT (make_id, nombre) DO NOTHING;
