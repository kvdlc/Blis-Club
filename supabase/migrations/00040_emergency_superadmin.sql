-- ============================================================
-- EMERGENCY: Crear superadmin por defecto
-- Ejecutar esto si no puedes acceder al panel de administración
-- ============================================================

-- 1. Crear usuario en auth.users (si no existe)
-- Reemplaza 'admin@blis.club' y 'TuPasswordSegura123!' con tus datos
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@blis.club';
  v_password TEXT := 'Admin123!Blis';
BEGIN
  -- Verificar si el usuario ya existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- Crear usuario con email confirmado
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      role
    )
    VALUES (
      gen_random_uuid(),
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      '{"first_name": "Admin", "last_name": "Blis"}'::jsonb,
      NOW(),
      NOW(),
      'authenticated'
    )
    RETURNING id INTO v_user_id;

    -- El trigger on_auth_user_created creará automáticamente el perfil
    -- Pero actualizamos el rol a superadmin
    UPDATE profiles
    SET role = 'superadmin',
        first_name = 'Admin',
        last_name = 'Blis',
        display_name = 'Admin Blis'
    WHERE id = v_user_id;

    RAISE NOTICE 'Superadmin creado: % (ID: %)', v_email, v_user_id;
  ELSE
    -- Si ya existe, asegurar que tenga rol superadmin
    UPDATE profiles
    SET role = 'superadmin'
    WHERE id = v_user_id;

    -- Actualizar contraseña
    UPDATE auth.users
    SET encrypted_password = crypt(v_password, gen_salt('bf'))
    WHERE id = v_user_id;

    RAISE NOTICE 'Superadmin actualizado: % (ID: %)', v_email, v_user_id;
  END IF;
END $$;
