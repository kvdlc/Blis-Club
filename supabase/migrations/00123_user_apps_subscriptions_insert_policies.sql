-- Políticas RLS faltantes: permitir que cada usuario cree/actualice sus propias
-- filas en user_apps y subscriptions (necesario para createTrial en el registro/login).
drop policy if exists "Usuarios crean sus apps" on public.user_apps;
create policy "Usuarios crean sus apps" on public.user_apps
  for insert to public with check (auth.uid() = user_id);

drop policy if exists "Usuarios actualizan sus apps" on public.user_apps;
create policy "Usuarios actualizan sus apps" on public.user_apps
  for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Usuarios crean su suscripcion" on public.subscriptions;
create policy "Usuarios crean su suscripcion" on public.subscriptions
  for insert to public with check (auth.uid() = user_id);

drop policy if exists "Usuarios actualizan su suscripcion" on public.subscriptions;
create policy "Usuarios actualizan su suscripcion" on public.subscriptions
  for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
