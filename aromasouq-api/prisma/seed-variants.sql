-- ============================================================
-- PRODUCT VARIANTS SEED SQL
-- ============================================================
-- Run this in Supabase SQL Editor
-- This script creates 128 variants for all products
-- IDEMPOTENT - Safe to run multiple times (uses ON CONFLICT)
-- ============================================================

-- ============================================================
-- STEP 1: OUD (AGARWOOD) PRODUCTS - 13 products x 6 variants = 78 variants
-- Variants: 1 Tola, 5 Tola, 50gm, 250gm, 500gm, 1kg
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING OUD PRODUCT VARIANTS (78)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

-- 1. Indian Dugga VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 3200, 3800, 25, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 3200, compare_at_price = 3800, stock = 25, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 14500, 17000, 15, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 14500, compare_at_price = 17000, stock = 15, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 12000, 14000, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 12000, compare_at_price = 14000, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 55000, 65000, 5, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 55000, compare_at_price = 65000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 105000, 125000, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 105000, compare_at_price = 125000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 195000, 230000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip'
ON CONFLICT (sku) DO UPDATE SET price = 195000, compare_at_price = 230000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Indian Dugga VIP - 6 variants'; END $$;

-- 2. Trat Agarwood Chips VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 2800, 3300, 20, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 2800, compare_at_price = 3300, stock = 20, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 12500, 15000, 12, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 12500, compare_at_price = 15000, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 10500, 12500, 8, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 10500, compare_at_price = 12500, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 48000, 57000, 4, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 48000, compare_at_price = 57000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 92000, 110000, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 92000, compare_at_price = 110000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 175000, 210000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip'
ON CONFLICT (sku) DO UPDATE SET price = 175000, compare_at_price = 210000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Trat Agarwood Chips VIP - 6 variants'; END $$;

-- 3. Malaki Majalis
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 1800, 2100, 30, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 1800, compare_at_price = 2100, stock = 30, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 8000, 9500, 20, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 8000, compare_at_price = 9500, stock = 20, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 6800, 8000, 15, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 6800, compare_at_price = 8000, stock = 15, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 31000, 37000, 8, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 31000, compare_at_price = 37000, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 58000, 70000, 5, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 58000, compare_at_price = 70000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 110000, 130000, 3, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis'
ON CONFLICT (sku) DO UPDATE SET price = 110000, compare_at_price = 130000, stock = 3, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Malaki Majalis - 6 variants'; END $$;

-- 4. Royal Indian Syoufi
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 3500, 4200, 22, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 3500, compare_at_price = 4200, stock = 22, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 15800, 19000, 14, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 15800, compare_at_price = 19000, stock = 14, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 13200, 16000, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 13200, compare_at_price = 16000, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 60000, 72000, 5, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 60000, compare_at_price = 72000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 115000, 138000, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 115000, compare_at_price = 138000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 215000, 260000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi'
ON CONFLICT (sku) DO UPDATE SET price = 215000, compare_at_price = 260000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Royal Indian Syoufi - 6 variants'; END $$;

-- 5. Malaki Vietnami
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 1500, 1800, 28, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 1500, compare_at_price = 1800, stock = 28, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 6800, 8000, 18, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 6800, compare_at_price = 8000, stock = 18, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 5600, 6700, 12, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 5600, compare_at_price = 6700, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 26000, 31000, 6, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 26000, compare_at_price = 31000, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 48000, 58000, 4, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 48000, compare_at_price = 58000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 90000, 108000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami'
ON CONFLICT (sku) DO UPDATE SET price = 90000, compare_at_price = 108000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Malaki Vietnami - 6 variants'; END $$;

-- 6. Malaki Mori
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 1200, 1400, 35, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 1200, compare_at_price = 1400, stock = 35, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 5400, 6500, 22, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 5400, compare_at_price = 6500, stock = 22, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 4500, 5400, 15, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 4500, compare_at_price = 5400, stock = 15, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 21000, 25000, 8, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 21000, compare_at_price = 25000, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 38000, 46000, 5, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 38000, compare_at_price = 46000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 72000, 86000, 3, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori'
ON CONFLICT (sku) DO UPDATE SET price = 72000, compare_at_price = 86000, stock = 3, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Malaki Mori - 6 variants'; END $$;

-- 7. Mori VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 1800, 2200, 18, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 1800, compare_at_price = 2200, stock = 18, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 8000, 9600, 12, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 8000, compare_at_price = 9600, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 6800, 8200, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 6800, compare_at_price = 8200, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 31000, 37000, 5, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 31000, compare_at_price = 37000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 58000, 70000, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 58000, compare_at_price = 70000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 110000, 132000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip'
ON CONFLICT (sku) DO UPDATE SET price = 110000, compare_at_price = 132000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Mori VIP - 6 variants'; END $$;

-- 8. Mori Malaki
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 1400, 1700, 24, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 1400, compare_at_price = 1700, stock = 24, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 6200, 7500, 16, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 6200, compare_at_price = 7500, stock = 16, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 5200, 6200, 12, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 5200, compare_at_price = 6200, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 24000, 29000, 6, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 24000, compare_at_price = 29000, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 44000, 53000, 4, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 44000, compare_at_price = 53000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 82000, 98000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki'
ON CONFLICT (sku) DO UPDATE SET price = 82000, compare_at_price = 98000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Mori Malaki - 6 variants'; END $$;

-- 9. Salla VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 2200, 2600, 15, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 2200, compare_at_price = 2600, stock = 15, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 9800, 11800, 10, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 9800, compare_at_price = 11800, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 8200, 9800, 8, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 8200, compare_at_price = 9800, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 38000, 45000, 4, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 38000, compare_at_price = 45000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 72000, 86000, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 72000, compare_at_price = 86000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 135000, 162000, 2, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip'
ON CONFLICT (sku) DO UPDATE SET price = 135000, compare_at_price = 162000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Salla VIP - 6 variants'; END $$;

-- 10. Elite Trad
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 2500, 3000, 12, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 2500, compare_at_price = 3000, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 11200, 13500, 8, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 11200, compare_at_price = 13500, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 9400, 11300, 6, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 9400, compare_at_price = 11300, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 43000, 52000, 4, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 43000, compare_at_price = 52000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 82000, 98000, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 82000, compare_at_price = 98000, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 155000, 186000, 1, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad'
ON CONFLICT (sku) DO UPDATE SET price = 155000, compare_at_price = 186000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Elite Trad - 6 variants'; END $$;

-- 11. Indian Syoufi Nagaland VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 3800, 4500, 10, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 3800, compare_at_price = 4500, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 17000, 20500, 6, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 17000, compare_at_price = 20500, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 14200, 17000, 5, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 14200, compare_at_price = 17000, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 65000, 78000, 3, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 65000, compare_at_price = 78000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 125000, 150000, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 125000, compare_at_price = 150000, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 235000, 282000, 1, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip'
ON CONFLICT (sku) DO UPDATE SET price = 235000, compare_at_price = 282000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Indian Syoufi Nagaland VIP - 6 variants'; END $$;

-- 12. Ancient Maroki Asgor Jungle
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 2000, 2400, 8, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 2000, compare_at_price = 2400, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 9000, 10800, 5, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 9000, compare_at_price = 10800, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 7500, 9000, 4, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 7500, compare_at_price = 9000, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 35000, 42000, 3, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 35000, compare_at_price = 42000, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 65000, 78000, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 65000, compare_at_price = 78000, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 120000, 144000, 1, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle'
ON CONFLICT (sku) DO UPDATE SET price = 120000, compare_at_price = 144000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Ancient Maroki Asgor Jungle - 6 variants'; END $$;

-- 13. Ancient Khao Yai Jungle (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 5500, 6600, 5, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 5500, compare_at_price = 6600, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 24500, 29500, 3, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 24500, compare_at_price = 29500, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '50gm', '50 غرام', '50gm', p.sku || '-50GM', 20500, 24600, 3, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 20500, compare_at_price = 24600, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '250gm', '250 غرام', '250gm', p.sku || '-250GM', 95000, 114000, 2, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 95000, compare_at_price = 114000, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '500gm', '500 غرام', '500gm', p.sku || '-500GM', 180000, 216000, 1, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 180000, compare_at_price = 216000, stock = 1, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1kg', '1 كيلو', '1kg', p.sku || '-1KG', 340000, 408000, 1, 6, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare'
ON CONFLICT (sku) DO UPDATE SET price = 340000, compare_at_price = 408000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Ancient Khao Yai Jungle (Rare) - 6 variants'; END $$;

-- ============================================================
-- STEP 2: DEHN AL OUD PRODUCTS - 8 products x 5 variants = 40 variants
-- Variants: 3ml, 6ml, 12ml, 5 Tola, 10 Tola
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING DEHN AL OUD VARIANTS (40)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

-- 1. Old Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 650, 780, 15, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 650, compare_at_price = 780, stock = 15, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1200, 1440, 12, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1200, compare_at_price = 1440, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 2200, 2640, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 2200, compare_at_price = 2640, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 9500, 11400, 5, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 9500, compare_at_price = 11400, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 18000, 21600, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 18000, compare_at_price = 21600, stock = 3, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Old Trat Oud Oil - 5 variants'; END $$;

-- 2. Elite Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 750, 900, 12, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 750, compare_at_price = 900, stock = 12, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1400, 1680, 10, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1400, compare_at_price = 1680, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 2600, 3120, 8, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 2600, compare_at_price = 3120, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 11500, 13800, 4, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 11500, compare_at_price = 13800, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 22000, 26400, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 22000, compare_at_price = 26400, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Elite Trat Oud Oil - 5 variants'; END $$;

-- 3. Sweet Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 580, 700, 18, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 580, compare_at_price = 700, stock = 18, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1080, 1300, 14, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1080, compare_at_price = 1300, stock = 14, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 2000, 2400, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 2000, compare_at_price = 2400, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 8800, 10500, 5, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 8800, compare_at_price = 10500, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 16500, 19800, 3, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 16500, compare_at_price = 19800, stock = 3, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Sweet Trat Oud Oil - 5 variants'; END $$;

-- 4. Old Malino Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 720, 860, 10, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 720, compare_at_price = 860, stock = 10, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1350, 1620, 8, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1350, compare_at_price = 1620, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 2500, 3000, 6, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 2500, compare_at_price = 3000, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 11000, 13200, 4, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 11000, compare_at_price = 13200, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 21000, 25200, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 21000, compare_at_price = 25200, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Old Malino Oud Oil - 5 variants'; END $$;

-- 5. Old Maroki Oud Oil (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 1400, 1680, 5, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 1400, compare_at_price = 1680, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 2600, 3120, 4, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 2600, compare_at_price = 3120, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 4800, 5760, 3, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 4800, compare_at_price = 5760, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 21000, 25200, 2, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 21000, compare_at_price = 25200, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 40000, 48000, 1, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 40000, compare_at_price = 48000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Old Maroki Oud Oil (Rare) - 5 variants'; END $$;

-- 6. Jaya Oud Oil (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 1600, 1920, 6, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 1600, compare_at_price = 1920, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 3000, 3600, 4, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 3000, compare_at_price = 3600, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 5500, 6600, 3, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 5500, compare_at_price = 6600, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 24000, 28800, 2, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 24000, compare_at_price = 28800, stock = 2, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 45000, 54000, 1, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare'
ON CONFLICT (sku) DO UPDATE SET price = 45000, compare_at_price = 54000, stock = 1, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Jaya Oud Oil (Rare) - 5 variants'; END $$;

-- 7. Elite Prachin Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 850, 1020, 8, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 850, compare_at_price = 1020, stock = 8, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1600, 1920, 6, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1600, compare_at_price = 1920, stock = 6, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 2950, 3540, 5, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 2950, compare_at_price = 3540, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 13000, 15600, 3, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 13000, compare_at_price = 15600, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 24500, 29400, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 24500, compare_at_price = 29400, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Elite Prachin Oud Oil - 5 variants'; END $$;

-- 8. Old Indian Syoufi Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3ml', '3 مل', '3ml', p.sku || '-3ML', 950, 1140, 7, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 950, compare_at_price = 1140, stock = 7, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '6ml', '6 مل', '6ml', p.sku || '-6ML', 1780, 2140, 5, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 1780, compare_at_price = 2140, stock = 5, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '12ml', '12 مل', '12ml', p.sku || '-12ML', 3300, 3960, 4, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 3300, compare_at_price = 3960, stock = 4, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '5 Tola', '5 تولة', '5-tola', p.sku || '-5TOLA', 14500, 17400, 3, 4, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 14500, compare_at_price = 17400, stock = 3, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 27500, 33000, 2, 5, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil'
ON CONFLICT (sku) DO UPDATE SET price = 27500, compare_at_price = 33000, stock = 2, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Old Indian Syoufi Oud Oil - 5 variants'; END $$;

-- ============================================================
-- STEP 3: PERFUMES - 5 products x 1 variant = 5 variants
-- Variant: 100ml
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING PERFUME VARIANTS (5)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 480, 580, 40, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'umsiya'
ON CONFLICT (sku) DO UPDATE SET price = 480, compare_at_price = 580, stock = 40, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 450, 540, 35, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hikayah'
ON CONFLICT (sku) DO UPDATE SET price = 450, compare_at_price = 540, stock = 35, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 420, 500, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'nesayim'
ON CONFLICT (sku) DO UPDATE SET price = 420, compare_at_price = 500, stock = 50, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 420, 500, 30, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'kunooz'
ON CONFLICT (sku) DO UPDATE SET price = 420, compare_at_price = 500, stock = 30, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 380, 450, 45, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hams'
ON CONFLICT (sku) DO UPDATE SET price = 380, compare_at_price = 450, stock = 45, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ All Perfumes - 5 variants'; END $$;

-- ============================================================
-- STEP 4: ALL OVER SPRAYS - 5 products x 1 variant = 5 variants
-- Variant: 100ml
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING SPRAY VARIANTS (5)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 135, 160, 80, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'chic-body-spray'
ON CONFLICT (sku) DO UPDATE SET price = 135, compare_at_price = 160, stock = 80, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 125, 150, 75, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hiyam-body-spray'
ON CONFLICT (sku) DO UPDATE SET price = 125, compare_at_price = 150, stock = 75, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 120, 145, 90, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'fajr-body-spray'
ON CONFLICT (sku) DO UPDATE SET price = 120, compare_at_price = 145, stock = 90, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 115, 140, 70, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'gharam-body-spray'
ON CONFLICT (sku) DO UPDATE SET price = 115, compare_at_price = 140, stock = 70, updated_at = NOW();

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, compare_at_price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100ml', '100 مل', '100ml', p.sku || '-100ML', 110, 130, 85, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ghazal-body-spray'
ON CONFLICT (sku) DO UPDATE SET price = 110, compare_at_price = 130, stock = 85, updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ All Sprays - 5 variants'; END $$;

-- ============================================================
-- STEP 5: UPDATE PRODUCT BASE PRICES (minimum variant price)
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'UPDATING PRODUCT BASE PRICES & STOCK'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

UPDATE products p
SET
  price = subquery.min_price,
  stock = subquery.total_stock,
  updated_at = NOW()
FROM (
  SELECT
    pv.product_id,
    MIN(pv.price) as min_price,
    SUM(pv.stock) as total_stock
  FROM product_variants pv
  WHERE pv.is_active = true
  GROUP BY pv.product_id
) subquery
WHERE p.id = subquery.product_id;

DO $$ BEGIN RAISE NOTICE '✅ Product base prices and stock updated'; END $$;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'VERIFICATION'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

SELECT
  c.name as category,
  COUNT(DISTINCT p.id) as products,
  COUNT(pv.id) as variants
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
WHERE c.slug IN ('oud', 'dehnal-oud', 'perfumes', 'all-over-spray')
GROUP BY c.id, c.name, c.sort_order
ORDER BY c.sort_order;

DO $$
DECLARE
  variant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO variant_count FROM product_variants WHERE is_active = true;

  RAISE NOTICE '';
  RAISE NOTICE '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉';
  RAISE NOTICE '🎉 SUCCESS! Created % variants! 🎉', variant_count;
  RAISE NOTICE '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected: 128 variants (78 + 40 + 5 + 5)';
END $$;
