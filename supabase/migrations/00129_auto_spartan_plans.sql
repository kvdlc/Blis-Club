-- Planes de suscripción para Auto y Spartan (landing de pago /web)
insert into public.plans (application_id, name, price_cents, original_price_cents, billing_interval, features, landing_visible, landing_order, landing_slug, description, badge, payment_provider, max_dogs, cta_text)
select a.id, v.name, v.price_cents, v.original, v.interval, v.feats, true, v.ord, v.slug, v.descr, v.badge, 'izipay', 999, v.cta
from public.applications a
cross join (values
  ('Pro Mensual', 1000, null::int, 'month', array['Acceso completo a todas las funciones','Cancela cuando quieras']::text[], 1, 'auto-web', 'Acceso completo, mes a mes', null::text, 'Pagar ahora'),
  ('Pro Trimestral', 2500, 3000, 'quarter', array['Acceso completo a todas las funciones','Ahorra 17% vs mensual','Cancela cuando quieras'], 2, 'auto-web', '3 meses con descuento', 'Más popular', 'Pagar ahora'),
  ('Pro Anual', 9000, 12000, 'year', array['Acceso completo a todas las funciones','Ahorra 25% vs mensual','Cancela cuando quieras'], 3, 'auto-web', 'El mejor precio', 'Mejor valor', 'Pagar ahora')
) as v(name, price_cents, original, interval, feats, ord, slug, descr, badge, cta)
where a.slug = 'auto'
  and not exists (select 1 from public.plans p where p.application_id = a.id);

insert into public.plans (application_id, name, price_cents, original_price_cents, billing_interval, features, landing_visible, landing_order, landing_slug, description, badge, payment_provider, max_dogs, cta_text)
select a.id, v.name, v.price_cents, v.original, v.interval, v.feats, true, v.ord, v.slug, v.descr, v.badge, 'izipay', 999, v.cta
from public.applications a
cross join (values
  ('Pro Mensual', 1000, null::int, 'month', array['Acceso completo: rutinas, hábitos y gym','Cancela cuando quieras']::text[], 1, 'Spartan-web', 'Acceso completo, mes a mes', null::text, 'Pagar ahora'),
  ('Pro Trimestral', 2500, 3000, 'quarter', array['Acceso completo: rutinas, hábitos y gym','Ahorra 17% vs mensual','Cancela cuando quieras'], 2, 'Spartan-web', '3 meses con descuento', 'Más popular', 'Pagar ahora'),
  ('Pro Anual', 9000, 12000, 'year', array['Acceso completo: rutinas, hábitos y gym','Ahorra 25% vs mensual','Cancela cuando quieras'], 3, 'Spartan-web', 'El mejor precio', 'Mejor valor', 'Pagar ahora')
) as v(name, price_cents, original, interval, feats, ord, slug, descr, badge, cta)
where a.slug = 'Spartan'
  and not exists (select 1 from public.plans p where p.application_id = a.id);
