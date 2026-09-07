-- Campos para repuestos/accesorios: tipo de componente, marca, proveedor, odómetro de compra y notas
alter table vehicle_upgrades add column if not exists tipo_componente text;
alter table vehicle_upgrades add column if not exists marca text;
alter table vehicle_upgrades add column if not exists proveedor text;
alter table vehicle_upgrades add column if not exists odometro integer;
alter table vehicle_upgrades add column if not exists notas text;
