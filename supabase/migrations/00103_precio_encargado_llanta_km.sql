-- Precio del vehículo, encargado de taller, medida de llanta y km anuales para herramientas
alter table vehicles add column if not exists precio numeric(12,2);
alter table vehicle_contacts add column if not exists encargado text;
alter table vehicle_specs add column if not exists llanta_ancho integer;
alter table vehicle_specs add column if not exists llanta_perfil integer;
alter table vehicle_specs add column if not exists llanta_rin integer;
alter table vehicle_specs add column if not exists km_anuales integer;
