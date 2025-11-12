-- Drop the old payment method check constraint
ALTER TABLE public.deposits DROP CONSTRAINT deposits_payment_method_check;

-- Add new check constraint that includes mpesa
ALTER TABLE public.deposits ADD CONSTRAINT deposits_payment_method_check 
CHECK (payment_method = ANY (ARRAY['card'::text, 'bank_transfer'::text, 'crypto'::text, 'mpesa'::text]));