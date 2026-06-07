-- ============================================================
-- RECUPERACIÓN: Resetear password del admin
-- Ejecuta esto si tu cuenta de admin fue sobreescrita por pruebas
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@blis.club';  -- cambia esto si usaste otro email
  v_new_password TEXT := 'Admin123!Blis';
BEGIN
  -- Buscar usuario por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario no encontrado: %', v_email;
  ELSE
    -- Resetear password
    UPDATE auth.users
    SET encrypted_password = crypt(v_new_password, gen_salt('bf'))
    WHERE id = v_user_id;

    -- Asegurar rol superadmin
    UPDATE profiles
    SET role = 'superadmin'
    WHERE id = v_user_id;

    RAISE NOTICE 'Password reseteado para: % (ID: %)', v_email, v_user_id;
    RAISE NOTICE 'Nuevo password: %', v_new_password;
  END IF;
END $$;
