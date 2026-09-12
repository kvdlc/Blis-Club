-- Endurecimiento: las funciones de trigger no deben ser invocables por la API REST
revoke execute on function public.notify_new_user_registration() from anon, authenticated, public;
revoke execute on function public.backfill_notification_app() from anon, authenticated, public;
-- Helpers/RPC: solo usuarios autenticados (el RPC valida rol internamente)
revoke execute on function public.is_notifications_admin() from anon;
revoke execute on function public.admin_mark_notifications_read() from anon;
