-- Coherencia de aplicaciones en el panel admin
-- 1) app_settings para Spartan (faltaba)
insert into public.app_settings (application_id, enabled_features, admin_modules)
select a.id, '{}'::text[],
  '{"dashboard":true,"usuarios":true,"productos":true,"compras":true,"email":false,"referidos":false,"marketplace":false,"proveedores":false,"configuracion":false}'::jsonb
from public.applications a
where a.slug = 'Spartan'
  and not exists (select 1 from public.app_settings s where s.application_id = a.id);

-- 2) Helper de admin (incluye empleado) para políticas
create or replace function public.current_user_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','superadmin','empleado')
  );
$$;

revoke execute on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

-- 3) providers no tenía políticas → escrituras rotas. Permitir a admins.
alter table public.providers enable row level security;
drop policy if exists "Admins gestionan providers" on public.providers;
create policy "Admins gestionan providers" on public.providers
  for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());

-- 4) vehicles: permitir a admins gestionar cualquiera (hoy solo el dueño)
drop policy if exists "Admins gestionan vehiculos" on public.vehicles;
create policy "Admins gestionan vehiculos" on public.vehicles
  for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
