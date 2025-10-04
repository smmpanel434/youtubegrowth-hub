-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create admin user with specified credentials
-- First, we'll create a function to handle this since we need to create the auth user
CREATE OR REPLACE FUNCTION public.create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update RLS policies to use the new role system
-- Drop old admin policies and create new ones using has_role function

-- Deposits policies
DROP POLICY IF EXISTS "Admins can view all deposits" ON public.deposits;
DROP POLICY IF EXISTS "Admins can update deposit status" ON public.deposits;

CREATE POLICY "Admins can view all deposits"
ON public.deposits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deposit status"
ON public.deposits
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order status"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Support tickets policies
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update ticket status" ON public.support_tickets;

CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ticket status"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Ticket replies policies
DROP POLICY IF EXISTS "Admins can view all ticket replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Admins can create admin replies" ON public.ticket_replies;

CREATE POLICY "Admins can view all ticket replies"
ON public.ticket_replies
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create admin replies"
ON public.ticket_replies
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  AND is_admin_reply = true 
  AND admin_id = auth.uid()
);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);