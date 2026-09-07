-- Campos para contactos de la Guantera: número alternativo y ubicación (Google Maps)
alter table vehicle_contacts add column if not exists telefono_alt text;
alter table vehicle_contacts add column if not exists ubicacion text;
