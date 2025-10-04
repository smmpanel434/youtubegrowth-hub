-- Set the first user as admin (you can change this email to the correct admin email)
UPDATE profiles 
SET is_admin = true 
WHERE email = 'miayeye@gmail.com';

-- Ensure deposits table has all necessary fields for admin verification
-- Add a notes field for admin to add verification notes
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);