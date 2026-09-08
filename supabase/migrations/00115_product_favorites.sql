-- Favoritos de productos del marketplace.
create table if not exists product_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references marketplace_products (id) on delete cascade,
  created_at timestamptz not null default now(),

  unique(user_id, product_id)
);

alter table product_favorites enable row level security;

create policy "Users can view all product favorites"
  on product_favorites for select using (true);

create policy "Users can insert own product favorites"
  on product_favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own product favorites"
  on product_favorites for delete using (auth.uid() = user_id);
