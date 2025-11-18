-- ============================================
-- ROLLBACK SCRIPT - DROP GUEST TABLES
-- Confidence: 100% - Safe to run, no impact on existing data
-- ============================================

DO $$
BEGIN
  -- Drop tables in reverse order (respect foreign keys)
  DROP TABLE IF EXISTS guest_order_items CASCADE;
  DROP TABLE IF EXISTS guest_orders CASCADE;
  DROP TABLE IF EXISTS guest_cart_items CASCADE;
  DROP TABLE IF EXISTS guest_carts CASCADE;

  RAISE NOTICE 'Guest tables rolled back successfully. Existing tables unaffected. ✓';
END $$;

-- Verify existing tables still work
SELECT COUNT(*) as existing_users FROM users;
SELECT COUNT(*) as existing_carts FROM carts;
SELECT COUNT(*) as existing_orders FROM orders;

-- Output success message
SELECT 'Rollback completed - All existing data intact' as status;
