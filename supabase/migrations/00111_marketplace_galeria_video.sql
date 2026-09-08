-- Galería de imágenes y video para productos del marketplace.
alter table marketplace_products add column if not exists galeria text[];
alter table marketplace_products add column if not exists video_url text;
