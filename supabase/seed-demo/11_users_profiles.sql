-- ============================================================
-- 11 — PERFILES DE 9 USUARIOS FICTICIOS
-- ============================================================
DO $$
BEGIN
  -- demo1@blis.club
  UPDATE profiles SET first_name = 'Ana', last_name = 'García', country = 'PE', 
    whatsapp = '+51999111111', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Ana García'
  WHERE id = 'a6909b92-0cc1-4eb4-ba15-85880eea38fe';

  -- demo2@blis.club
  UPDATE profiles SET first_name = 'Luis', last_name = 'Rodríguez', country = 'PE',
    whatsapp = '+51999222222', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Luis Rodríguez'
  WHERE id = 'b972c492-6e7c-48b9-af9c-6f3bb9e4d882';

  -- demo3@blis.club
  UPDATE profiles SET first_name = 'María', last_name = 'López', country = 'PE',
    whatsapp = '+51999333333', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'María López'
  WHERE id = 'c6a15be2-5190-4f86-a076-b9e5b316e40f';

  -- demo4@blis.club
  UPDATE profiles SET first_name = 'Pedro', last_name = 'Martínez', country = 'PE',
    whatsapp = '+51999444444', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Pedro Martínez'
  WHERE id = 'ca8567fd-4576-4822-9fe7-b4a2da551448';

  -- demo5@blis.club
  UPDATE profiles SET first_name = 'Laura', last_name = 'Sánchez', country = 'PE',
    whatsapp = '+51999555555', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Laura Sánchez'
  WHERE id = '1c03d605-1729-4ff5-a49c-19c8664d300c';

  -- demo6@blis.club
  UPDATE profiles SET first_name = 'Carlos', last_name = 'Hernández', country = 'PE',
    whatsapp = '+51999666666', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Carlos Hernández'
  WHERE id = 'fc5ba12c-24cf-417d-9ad6-64706776108d';

  -- demo7@blis.club
  UPDATE profiles SET first_name = 'Sofia', last_name = 'Torres', country = 'PE',
    whatsapp = '+51999777777', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Sofia Torres'
  WHERE id = 'a0b15107-5818-4242-b83a-269f1e978539';

  -- demo8@blis.club
  UPDATE profiles SET first_name = 'Diego', last_name = 'Ramírez', country = 'PE',
    whatsapp = '+51999888888', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Diego Ramírez'
  WHERE id = 'd89cf549-8844-4f50-98b5-fed31c55c3d2';

  -- demo9@blis.club
  UPDATE profiles SET first_name = 'Elena', last_name = 'Flores', country = 'PE',
    whatsapp = '+51999999999', timezone = 'America/Lima', avatar_url = '/icons/user-default.png', display_name = 'Elena Flores'
  WHERE id = '27a2481c-436e-4cde-bc96-e8321df2c328';

  RAISE NOTICE '11 OK — 9 perfiles completados';
END $$;
