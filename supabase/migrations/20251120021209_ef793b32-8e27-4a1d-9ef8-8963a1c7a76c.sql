-- Ensure admin user exists with correct credentials
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@protocal100.com' 
  LIMIT 1;
  
  -- If admin doesn't exist, create the user
  IF admin_user_id IS NULL THEN
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
      recovery_token,
      email_change_token_new,
      email_change
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
      '',
      '',
      ''
    ) RETURNING id INTO admin_user_id;
  END IF;
  
  -- Ensure profile exists with admin flag
  INSERT INTO public.profiles (user_id, email, full_name, is_admin, balance)
  VALUES (admin_user_id, 'admin@protocal100.com', 'Admin User', true, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_admin = true,
    email = 'admin@protocal100.com',
    full_name = 'Admin User';
  
  -- Ensure admin role exists in user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;