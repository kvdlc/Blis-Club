-- ═══════════ Carrito (BD, persistente por usuario) ═══════════
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references marketplace_products(id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table cart_items enable row level security;
create policy "Users can view own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on cart_items for delete using (auth.uid() = user_id);
create index if not exists cart_items_user_idx on cart_items(user_id);

-- ═══════════ Checkout agrupado (un solo pago para N productos) ═══════════
create table if not exists product_checkouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  total_price_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  payment_method text default 'izipay',
  izipay_transaction_id text,
  shipping_address jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table product_checkouts enable row level security;
create policy "Users can view own checkouts" on product_checkouts for select using (auth.uid() = user_id);
create policy "Users can view own checkout items" on product_orders for select using (auth.uid() = user_id);

-- Vincular líneas de producto a su checkout (compra agrupada)
alter table product_orders add column if not exists checkout_id uuid references product_checkouts(id) on delete set null;
create index if not exists product_orders_checkout_idx on product_orders(checkout_id);

-- ═══════════ Specs para comparar autos ═══════════
alter table marketplace_listings add column if not exists anio integer;
alter table marketplace_listings add column if not exists kilometraje integer;
alter table marketplace_listings add column if not exists combustible text;
alter table marketplace_listings add column if not exists transmision text;

-- ═══════════ Autos demo (ficticios, para que el marketplace y compare luzcan vivos) ═══════════
insert into marketplace_listings
  (user_id, slug, titulo, categoria, marca, modelo, estado_item, precio, descripcion, fotos, whatsapp, ciudad, activo, anio, kilometraje, combustible, transmision)
values
('1830d1ed-ef20-4f27-82ad-2a49744124f9','chevrolet-sail-2021-demo','Chevrolet Sail 2021 LT','autos_usados','Chevrolet','Sail','usado',10450,'Auto compacto impecable, unico dueño, mantenimiento al dia en agencia. Aire acondicionado, dirección electrica y central multimedia.','{"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop"}','+593999000001','Quito',true,2021,43000,'gasolina','manual'),
('1830d1ed-ef20-4f27-82ad-2a49744124f9','honda-crv-2019-demo','Honda CR-V 2019 Touring','autos_usados','Honda','CR-V','usado',28500,'SUV confortable y segura, full equipo. Cámara 360, sunroof, asientos de cuero y mantenimiento en casa matriz.','{"https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop"}','+593999000002','Guayaquil',true,2019,58000,'gasolina','automatica'),
('1830d1ed-ef20-4f27-82ad-2a49744124f9','toyota-hilux-2021-demo','Toyota Hilux 2021 SRX 4x4','autos_usados','Toyota','Hilux','usado',36800,'Pickup 4x4 lista para trabajo y aventura. Motor diesel 2.8, doble cabina, frenos ABS y central multimedia con pantalla.','{"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop"}','+593999000003','Cuenca',true,2021,61000,'diesel','manual'),
('1830d1ed-ef20-4f27-82ad-2a49744124f9','kia-sportage-2018-demo','Kia Sportage 2018 EX','autos_usados','Kia','Sportage','usado',17500,'Excelente estado, ideal para ciudad. Aire, cámara de reversa, rines de lujo y llantas nuevas.','{"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop"}','+593999000004','Quito',true,2018,72000,'gasolina','automatica'),
('1830d1ed-ef20-4f27-82ad-2a49744124f9','mazda-3-2020-demo','Mazda 3 2020 Grand Touring','autos_usados','Mazda','3','usado',21900,'Sedán deportivo, mecánica excepcional. Apple CarPlay, head-up display, sensores de parqueo y piel.','{"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop"}','+593999000005','Guayaquil',true,2020,39000,'gasolina','automatica'),
('1830d1ed-ef20-4f27-82ad-2a49744124f9','suzuki-vitara-2022-demo','Suzuki Vitara 2022 GLX','autos_usados','Suzuki','Vitara','usado',24200,'SUV compacta casi nueva, bajo kilometraje. Tracción 4x2, pantalla tactil, clima y garantia vigente.','{"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop"}','+593999000006','Ambato',true,2022,18000,'gasolina','automatica');
