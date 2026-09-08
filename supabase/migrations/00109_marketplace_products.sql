-- Catálogo de productos del marketplace (accesorios/repuestos, gestionado solo por admin/superadmin)
create table if not exists marketplace_products (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  categoria text,
  descripcion text,
  imagen_url text,
  precio numeric(12,2),
  precio_original numeric(12,2),
  url_temu text,
  destacado boolean default false,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table marketplace_products enable row level security;

create policy "Anyone can view active marketplace products" on marketplace_products for select using (activo = true);
create policy "Admins manage marketplace products" on marketplace_products for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','superadmin'))
) with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','superadmin'))
);
