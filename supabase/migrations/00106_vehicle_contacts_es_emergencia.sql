-- Marcar contactos como SOS/emergencia (aparecen primero en el asistente en carretera)
alter table vehicle_contacts add column if not exists es_emergencia boolean default false;
