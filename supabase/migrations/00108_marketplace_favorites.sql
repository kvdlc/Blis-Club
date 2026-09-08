-- Favoritos de publicaciones del marketplace
create table if not exists marketplace_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

alter table marketplace_favorites enable row level security;

create policy "Users can view all favorites" on marketplace_favorites for select using (true);
create policy "Users can insert own favorites" on marketplace_favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on marketplace_favorites for delete using (auth.uid() = user_id);
