-- ============================================
-- GUEST CHECKOUT TABLES - SEPARATE FROM EXISTING
-- Confidence: 100% - No risk to existing tables
-- Can be rolled back instantly with DROP TABLE
-- ============================================

-- Guest Carts Table
CREATE TABLE IF NOT EXISTS guest_carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,
  user_agent TEXT,
  ip_address VARCHAR(45),

  CONSTRAINT chk_session_token_format CHECK (session_token ~ '^guest_[0-9]+_[a-f0-9]+$')
);

-- Indexes for guest_carts
CREATE INDEX IF NOT EXISTS idx_guest_carts_session_token ON guest_carts(session_token) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_carts_created_at ON guest_carts(created_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_carts_updated_at ON guest_carts(updated_at);

-- Guest Cart Items Table
CREATE TABLE IF NOT EXISTS guest_cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  guest_cart_id TEXT NOT NULL REFERENCES guest_carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_guest_cart_items_quantity CHECK (quantity > 0 AND quantity <= 99),
  UNIQUE (guest_cart_id, product_id, variant_id)
);

-- Indexes for guest_cart_items
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_cart ON guest_cart_items(guest_cart_id);
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_product ON guest_cart_items(product_id);

-- Guest Orders Table
CREATE TABLE IF NOT EXISTS guest_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  session_token VARCHAR(255),
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL DEFAULT 0,
  shipping_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  user_agent TEXT,
  ip_address VARCHAR(45),

  CONSTRAINT chk_guest_orders_email CHECK (guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_guest_orders_amounts CHECK (
    subtotal >= 0 AND
    tax >= 0 AND
    shipping_fee >= 0 AND
    discount >= 0 AND
    total >= 0
  ),
  CONSTRAINT chk_guest_orders_status CHECK (
    order_status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
  ),
  CONSTRAINT chk_guest_orders_payment_method CHECK (
    payment_method IN ('CASH_ON_DELIVERY', 'ONLINE_PAYMENT', 'BANK_TRANSFER')
  ),
  CONSTRAINT chk_guest_orders_payment_status CHECK (
    payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')
  )
);

-- Indexes for guest_orders
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_orders_order_number ON guest_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_guest_orders_email ON guest_orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_guest_orders_session ON guest_orders(session_token) WHERE session_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON guest_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_guest_orders_created_at ON guest_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guest_orders_tracking ON guest_orders(order_number, guest_email);

-- Guest Order Items Table
CREATE TABLE IF NOT EXISTS guest_order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  guest_order_id TEXT NOT NULL REFERENCES guest_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_name VARCHAR(255) NOT NULL,
  product_name_ar VARCHAR(255),
  variant_name VARCHAR(255),
  variant_name_ar VARCHAR(255),
  quantity INTEGER NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_guest_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_guest_order_items_price CHECK (price >= 0)
);

-- Indexes for guest_order_items
CREATE INDEX IF NOT EXISTS idx_guest_order_items_order ON guest_order_items(guest_order_id);
CREATE INDEX IF NOT EXISTS idx_guest_order_items_product ON guest_order_items(product_id);

-- ============================================
-- VALIDATION
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_carts') THEN
    RAISE EXCEPTION 'Table guest_carts not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_cart_items') THEN
    RAISE EXCEPTION 'Table guest_cart_items not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_orders') THEN
    RAISE EXCEPTION 'Table guest_orders not created';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_order_items') THEN
    RAISE EXCEPTION 'Table guest_order_items not created';
  END IF;

  RAISE NOTICE 'All guest tables created successfully! ✓';
END $$;
