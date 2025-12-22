-- Rollback script for add_payment_id_to_guest_orders.sql
-- Use this if you need to remove the payment_id column from guest_orders

-- Drop the index first
DROP INDEX IF EXISTS "guest_orders_payment_id_idx";

-- Drop the column
ALTER TABLE "guest_orders"
DROP COLUMN IF EXISTS "payment_id";

-- Verify the column was removed
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'guest_orders' AND column_name = 'payment_id';
