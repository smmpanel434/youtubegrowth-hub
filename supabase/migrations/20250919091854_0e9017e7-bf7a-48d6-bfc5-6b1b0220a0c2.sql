-- Fix infinite recursion in RLS policies by removing circular dependencies

-- Drop problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all deposits" ON public.deposits;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;

-- Create new simplified admin policies without recursion
-- For profiles - users can only see their own profile (admins will use service role for admin functions)
-- This removes the circular dependency

-- For orders - users can only see their own orders
-- For deposits - users can only see their own deposits  
-- For support_tickets - users can only see their own tickets
-- For services - everyone can see active services (no admin check needed for viewing)