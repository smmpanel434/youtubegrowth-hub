-- Fix search_path for create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@protocal100.com' LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    -- Create admin user (password will be set via Supabase dashboard or auth.users)
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
      crypt('Protocal100', gen_salt('bf')),
      now(),
      '{"full_name": "Admin User"}'::jsonb,
      now(),
      now(),
      '',
      ''
    ) RETURNING id INTO admin_user_id;
  END IF;
  
  -- Ensure profile exists
  INSERT INTO public.profiles (user_id, email, full_name, is_admin)
  VALUES (admin_user_id, 'admin@protocal100.com', 'Admin User', true)
  ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;