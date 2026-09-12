-- Endurecimiento 2: quitar el grant por defecto a PUBLIC y permitir solo a autenticados
revoke execute on function public.is_notifications_admin() from public, anon;
grant execute on function public.is_notifications_admin() to authenticated;

revoke execute on function public.admin_mark_notifications_read() from public, anon;
grant execute on function public.admin_mark_notifications_read() to authenticated;

-- Las funciones de trigger solo las invoca el motor (no la API)
revoke execute on function public.notify_new_user_registration() from public, anon, authenticated;
revoke execute on function public.backfill_notification_app() from public, anon, authenticated;
