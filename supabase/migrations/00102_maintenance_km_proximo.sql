-- Cambio de aceite en mantenimientos: kilometraje del próximo cambio + tipo nuevo
alter table maintenance_logs add column if not exists km_proximo integer;

alter table maintenance_logs drop constraint if exists maintenance_logs_tipo_check;
alter table maintenance_logs add constraint maintenance_logs_tipo_check check (tipo in ('preventivo', 'correctivo', 'lavado', 'inspeccion', 'otro', 'cambio_aceite'));
