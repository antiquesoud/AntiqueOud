-- Add payment_id column to guest_orders table for Stripe Payment Intent ID
-- This allows guest checkout orders to track Stripe payments

-- Add the payment_id column (nullable, as not all orders will use Stripe)
ALTER TABLE "guest_orders"
ADD COLUMN IF NOT EXISTS "payment_id" TEXT;

-- Add index for faster lookups by payment_id (useful for webhook processing)
CREATE INDEX IF NOT EXISTS "guest_orders_payment_id_idx" ON "guest_orders"("payment_id");

-- Verify the column was added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'guest_orders' AND column_name = 'payment_id';
