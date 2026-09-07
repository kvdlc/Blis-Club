-- Campos para contactos de la Guantera: número alternativo, ubicación (mapa) y foto del taller
alter table vehicle_contacts add column if not exists telefono_alt text;
alter table vehicle_contacts add column if not exists ubicacion text;
alter table vehicle_contacts add column if not exists foto_url text;
alter table vehicle_contacts add column if not exists lat double precision;
alter table vehicle_contacts add column if not exists lng double precision;
