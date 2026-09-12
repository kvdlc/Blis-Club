-- Tipo de carga: 'tanqueado' (llenado completo) o 'parcial' (llenado parcial)
-- Permite estadísticas de consumo real (tanque a tanque) y por grifo/ubicación.
alter table public.fuel_logs add column if not exists tipo_carga text;

alter table public.fuel_logs drop constraint if exists fuel_logs_tipo_carga_check;
alter table public.fuel_logs add constraint fuel_logs_tipo_carga_check
  check (tipo_carga is null or tipo_carga in ('tanqueado','parcial'));

create index if not exists fuel_logs_tipo_carga_idx on public.fuel_logs (tipo_carga);
create index if not exists fuel_logs_contacto_id_idx on public.fuel_logs (contacto_id);
