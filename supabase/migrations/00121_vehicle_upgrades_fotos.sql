-- Fotos del repuesto/compra (hasta 3 imágenes) para recordar cómo era.
alter table vehicle_upgrades add column if not exists fotos text[] default '{}';

-- Migrar la foto única existente (si la hay) al arreglo.
update vehicle_upgrades
set fotos = ARRAY[foto_url]
where foto_url is not null and (fotos is null or cardinality(fotos) = 0);
