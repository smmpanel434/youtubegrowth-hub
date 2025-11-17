-- Fix admin user record and ensure proper role/profile to prevent auth 500s
-- NOTE: This script only updates the single admin user and avoids structural changes.
DO $$
DECLARE
  uid uuid;
BEGIN
  -- Find existing admin user by email
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@protocal100.com' LIMIT 1;

  IF uid IS NULL THEN
    -- Create admin user with safe defaults for text columns (avoid NULLs)
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@protocal100.com',
      crypt('polo100', gen_salt('bf')),
      now(),
      '{"full_name":"Admin User"}',
      now(),
      now(),
      '',
      '',
      ''
    ) RETURNING id INTO uid;
  ELSE
    -- Normalize any nullable text columns and confirm email; set password
    UPDATE auth.users
    SET
      encrypted_password = crypt('polo100', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name":"Admin User"}',
      updated_at = now(),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change = COALESCE(email_change, '')
    WHERE id = uid;
  END IF;

  -- Ensure profile exists and is marked admin
  INSERT INTO public.profiles (user_id, email, full_name, is_admin)
  VALUES (uid, 'admin@protocal100.com', 'Admin User', true)
  ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

  -- Ensure admin role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
