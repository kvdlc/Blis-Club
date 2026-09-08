-- Vincular listings al vehículo en venta (publisher autos_usados, se sincroniza con vehicles.estado='en venta')
alter table marketplace_listings add column if not exists vehicle_id uuid references vehicles(id);
create unique index if not exists marketplace_listings_vehicle_id_key on marketplace_listings(vehicle_id) where vehicle_id is not null;
