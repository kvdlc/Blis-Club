-- Notificaciones unificadas de nuevos registros para admins/superadmins
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'user_registered',
  user_id uuid,
  app_slug text,
  first_name text,
  last_name text,
  email text,
  title text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_user_id_idx on public.admin_notifications (user_id);

-- Estado leído por admin
create table if not exists public.admin_notification_reads (
  notification_id uuid not null references public.admin_notifications(id) on delete cascade,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

-- Trigger: nuevo registro en auth.users
create or replace function public.notify_new_user_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text := coalesce(new.raw_user_meta_data->>'first_name', '');
  v_last  text := coalesce(new.raw_user_meta_data->>'last_name', '');
  v_app   text := nullif(new.raw_user_meta_data->>'app_category', '');
  v_name  text;
begin
  v_name := nullif(trim(v_first || ' ' || v_last), '');
  if v_name is null then
    v_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));
  end if;

  insert into public.admin_notifications (type, user_id, app_slug, first_name, last_name, email, title, body, created_at)
  values ('user_registered', new.id, v_app, v_first, v_last, new.email, 'Nuevo registro', v_name || ' · ' || new.email, coalesce(new.created_at, now()));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_notify on auth.users;
create trigger on_auth_user_created_notify
after insert on auth.users
for each row execute function public.notify_new_user_registration();

-- Trigger de apoyo: completar app_slug cuando se crea user_apps
create or replace function public.backfill_notification_app()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.admin_notifications
     set app_slug = new.app_slug
   where user_id = new.user_id
     and app_slug is null;
  return new;
end;
$$;

drop trigger if exists on_user_app_created_backfill on public.user_apps;
create trigger on_user_app_created_backfill
after insert on public.user_apps
for each row execute function public.backfill_notification_app();

-- Helper: ¿es admin/superadmin?
create or replace function public.is_notifications_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','superadmin')
  );
$$;

-- RPC: marcar todas como leídas para el admin actual
create or replace function public.admin_mark_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (select 1 from public.profiles where id = v_uid and role in ('admin','superadmin')) then
    raise exception 'not authorized';
  end if;

  insert into public.admin_notification_reads (notification_id, user_id)
  select n.id, v_uid from public.admin_notifications n
  on conflict (notification_id, user_id) do nothing;
end;
$$;

-- RLS
alter table public.admin_notifications enable row level security;
alter table public.admin_notification_reads enable row level security;

drop policy if exists "Admins ven notificaciones" on public.admin_notifications;
create policy "Admins ven notificaciones" on public.admin_notifications
  for select to public using (public.is_notifications_admin());

drop policy if exists "Admins ven sus lecturas" on public.admin_notification_reads;
create policy "Admins ven sus lecturas" on public.admin_notification_reads
  for select to public using (user_id = auth.uid());

drop policy if exists "Admins insertan sus lecturas" on public.admin_notification_reads;
create policy "Admins insertan sus lecturas" on public.admin_notification_reads
  for insert to public with check (user_id = auth.uid() and public.is_notifications_admin());

drop policy if exists "Admins borran sus lecturas" on public.admin_notification_reads;
create policy "Admins borran sus lecturas" on public.admin_notification_reads
  for delete to public using (user_id = auth.uid());

-- Backfill de los usuarios existentes
insert into public.admin_notifications (type, user_id, app_slug, first_name, last_name, email, title, body, created_at)
select
  'user_registered',
  p.id,
  coalesce(
    (select ua.app_slug from public.user_apps ua where ua.user_id = p.id order by ua.created_at asc limit 1),
    nullif(p.app_category, '')
  ),
  coalesce(p.first_name, ''),
  coalesce(p.last_name, ''),
  p.email,
  'Nuevo registro',
  coalesce(nullif(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'')), ''), p.display_name, split_part(p.email,'@',1)) || ' · ' || p.email,
  coalesce(p.created_at, now())
from public.profiles p
where not exists (
  select 1 from public.admin_notifications n where n.user_id = p.id and n.type = 'user_registered'
);
