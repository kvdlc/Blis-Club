-- Insertar imágenes de razas desde la carpeta public/icons
INSERT INTO breed_images (breed_name, image_url, variant) VALUES
('Dogo Argentino', '/icons/dogo 1.png', 'adulto'),
('American Pitbull', '/icons/pitbul 1.png', 'adulto')
ON CONFLICT (breed_name, variant) DO UPDATE SET image_url = EXCLUDED.image_url;
