-- Add admin policies for managing support tickets  
CREATE POLICY "Admins can view all tickets" 
ON public.support_tickets 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update ticket status" 
ON public.support_tickets 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Add admin policies for managing orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update order status" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Add admin policies for viewing all deposits
CREATE POLICY "Admins can view all deposits" 
ON public.deposits 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can update deposit status" 
ON public.deposits 
FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);