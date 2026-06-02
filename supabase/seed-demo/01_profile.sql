-- ============================================================
-- 01 — COMPLETAR PERFIL
-- ============================================================
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM profiles WHERE email = 'demo@blis.club';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario demo@blis.club no encontrado en profiles.';
  END IF;

  UPDATE profiles SET
    first_name = 'Carlos',
    last_name = 'Mendoza',
    country = 'PE',
    whatsapp = '+51999888777',
    timezone = 'America/Lima',
    avatar_url = 'https://yauoswqvuwruufozwduu.supabase.co/storage/v1/object/public/avatars/default-avatar.png',
    display_name = 'Carlos Mendoza'
  WHERE id = v_uid;

  RAISE NOTICE '01 OK — Perfil completado: %', v_uid;
END $$;
