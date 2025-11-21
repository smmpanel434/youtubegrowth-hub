-- Update the orders status check constraint to allow the correct statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'active', 'in progress', 'completed', 'cancelled'));