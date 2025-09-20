-- Create ticket_replies table for support conversations
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  user_id UUID,
  admin_id UUID,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket_replies
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_replies
CREATE POLICY "Users can view replies to their tickets" 
ON public.ticket_replies 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can reply to their own tickets" 
ON public.ticket_replies 
FOR INSERT 
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
  ) AND user_id = auth.uid() AND is_admin_reply = false
);

CREATE POLICY "Admins can view all ticket replies" 
ON public.ticket_replies 
FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Admins can create admin replies" 
ON public.ticket_replies 
FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
  AND is_admin_reply = true AND admin_id = auth.uid()
);

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

-- Add trigger for ticket_replies updated_at
CREATE TRIGGER update_ticket_replies_updated_at
BEFORE UPDATE ON public.ticket_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update support tickets when new reply is added
CREATE OR REPLACE FUNCTION public.update_ticket_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_tickets 
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_on_reply
AFTER INSERT ON public.ticket_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_ticket_on_reply();