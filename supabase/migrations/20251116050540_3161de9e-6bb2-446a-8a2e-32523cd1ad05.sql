-- Upsert admin user with email and password, confirm email, backfill profiles, and assign admin role
DO $$
DECLARE
  uid uuid;
BEGIN
  -- Find existing admin user by email
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@protocal100.com' LIMIT 1;

  IF uid IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@protocal100.com',
      crypt('polo100', gen_salt('bf')),
      now(),
      '{"full_name": "Admin User"}'::jsonb,
      now(),
      now(),
      '',
      ''
    ) RETURNING id INTO uid;
  ELSE
    -- Ensure password and email confirmation are set
    UPDATE auth.users 
    SET encrypted_password = crypt('polo100', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = uid;
  END IF;

  -- Ensure profile exists and is marked admin
  INSERT INTO public.profiles (user_id, email, full_name, is_admin)
  VALUES (uid, 'admin@protocal100.com', 'Admin User', true)
  ON CONFLICT (user_id) DO UPDATE SET is_admin = true, email = EXCLUDED.email, full_name = EXCLUDED.full_name;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Backfill profiles for any existing auth users missing profiles
INSERT INTO public.profiles (user_id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;