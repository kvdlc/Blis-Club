-- Slug corto para compartir talleres/contactos del directorio (URLs tipo /t/Ab3xK9p)
create or replace function public.gen_short_slug()
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..7 loop
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  end loop;
  return result;
end;
$$;

alter table public.vehicle_contacts add column if not exists share_slug text;

create unique index if not exists vehicle_contacts_share_slug_key on public.vehicle_contacts (share_slug);

update public.vehicle_contacts
set share_slug = public.gen_short_slug()
where share_slug is null;

alter table public.vehicle_contacts alter column share_slug set default public.gen_short_slug();
