-- Enable realtime for tables to support real-time updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.deposits REPLICA IDENTITY FULL; 
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_replies REPLICA IDENTITY FULL;

-- Add tables to realtime publication for real-time functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;