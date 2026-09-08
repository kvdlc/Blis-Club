-- Centros/establecimientos (vehicle_contacts) vinculados a registros + tipos grifo/tienda_accesorios + métricas por grifo
alter table fuel_logs add column if not exists contacto_id uuid references vehicle_contacts(id);
alter table maintenance_logs add column if not exists contacto_id uuid references vehicle_contacts(id);
alter table vehicle_upgrades add column if not exists contacto_id uuid references vehicle_contacts(id);

alter table fuel_logs add column if not exists grifo text;

alter table vehicle_contacts drop constraint if exists vehicle_contacts_tipo_check;
alter table vehicle_contacts add constraint vehicle_contacts_tipo_check check (tipo in ('mecanico','electromecanico','grua','tienda_repuestos','tienda_accesorios','aseguradora','grifo','otro'));
