-- ============================================================
-- FINAL VARIANT UPDATE SCRIPT
-- ============================================================
-- This script updates all product variants to match client requirements
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STEP 1: DELETE ALL EXISTING VARIANTS
-- ============================================================
DO $$ BEGIN RAISE NOTICE 'Deleting all existing variants...'; END $$;

DELETE FROM product_variants;

DO $$ BEGIN RAISE NOTICE 'All variants deleted.'; END $$;

-- ============================================================
-- STEP 2: INSERT NEW VARIANTS FOR OUD PRODUCTS (13 products x 3 variants = 39)
-- Variants: 1 tola (150 AED), 3 tola (450 AED), 10 tola (1500 AED)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING OUD VARIANTS (39)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

-- Indian Dugga VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-dugga-vip';

-- Trat Agarwood Chips VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'trat-agarwood-chips-vip';

-- Malaki Majalis
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-majalis';

-- Royal Indian Syoufi
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'royal-indian-syoufi';

-- Malaki Vietnami
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-vietnami';

-- Malaki Mori
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'malaki-mori';

-- Mori VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-vip';

-- Mori Malaki
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'mori-malaki';

-- Salla VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'salla-vip';

-- Elite Trad
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trad';

-- Indian Syoufi Nagaland VIP
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'indian-syoufi-nagaland-vip';

-- Ancient Maroki Asgor Jungle
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-maroki-asgor-jungle';

-- Ancient Khao Yai Jungle (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ancient-khao-yai-jungle-rare';

DO $$ BEGIN RAISE NOTICE 'Oud variants created: 39'; END $$;

-- ============================================================
-- STEP 3: INSERT NEW VARIANTS FOR DEHNAL OUD PRODUCTS (8 products x 3 variants = 24)
-- Variants: 1 tola (150 AED), 3 tola (450 AED), 10 tola (1500 AED)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING DEHNAL OUD VARIANTS (24)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

-- Old Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-trat-oud-oil';

-- Elite Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-trat-oud-oil';

-- Sweet Trat Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'sweet-trat-oud-oil';

-- Old Malino Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-malino-oud-oil';

-- Old Maroki Oud Oil (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-maroki-oud-oil-rare';

-- Jaya Oud Oil (Rare)
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'jaya-oud-oil-rare';

-- Elite Prachin Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'elite-prachin-oud-oil';

-- Old Indian Syoufi Oud Oil
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Tola', '1 تولة', '1-tola', p.sku || '-1TOLA', 150, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '3 Tola', '3 تولة', '3-tola', p.sku || '-3TOLA', 450, 30, 2, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil';
INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '10 Tola', '10 تولة', '10-tola', p.sku || '-10TOLA', 1500, 10, 3, true, NOW(), NOW()
FROM products p WHERE p.slug = 'old-indian-syoufi-oud-oil';

DO $$ BEGIN RAISE NOTICE 'Dehnal Oud variants created: 24'; END $$;

-- ============================================================
-- STEP 4: INSERT NEW VARIANTS FOR PERFUMES (5 products x 1 variant = 5)
-- Variant: 100ml (200 AED)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING PERFUME VARIANTS (5)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'umsiya';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hikayah';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'nesayim';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'kunooz';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hams';

DO $$ BEGIN RAISE NOTICE 'Perfume variants created: 5'; END $$;

-- ============================================================
-- STEP 5: INSERT NEW VARIANTS FOR ALL OVER SPRAY (5 products x 1 variant = 5)
-- Variant: 100ml (200 AED)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING ALL OVER SPRAY VARIANTS (5)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'chic-body-spray';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'hiyam-body-spray';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'fajr-body-spray';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'gharam-body-spray';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '100 ML', '100 مل', '100ml', p.sku || '-100ML', 200, 50, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'ghazal-body-spray';

DO $$ BEGIN RAISE NOTICE 'All Over Spray variants created: 5'; END $$;

-- ============================================================
-- STEP 6: INSERT NEW VARIANTS FOR LIMITED EDITION (3 products x 1 variant = 3)
-- Variant: 1 piece (500 AED)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'CREATING LIMITED EDITION VARIANTS (3)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Piece', 'قطعة واحدة', '1-piece', p.sku || '-1PC', 500, 20, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'irth-collection';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Piece', 'قطعة واحدة', '1-piece', p.sku || '-1PC', 500, 20, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'gift-bag';

INSERT INTO product_variants (id, product_id, name, name_ar, size, sku, price, stock, sort_order, is_active, created_at, updated_at)
SELECT gen_random_uuid(), p.id, '1 Piece', 'قطعة واحدة', '1-piece', p.sku || '-1PC', 500, 20, 1, true, NOW(), NOW()
FROM products p WHERE p.slug = 'antique-luxury-box';

DO $$ BEGIN RAISE NOTICE 'Limited Edition variants created: 3'; END $$;

-- ============================================================
-- STEP 7: UPDATE PRODUCT BASE PRICES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'UPDATING PRODUCT BASE PRICES'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

-- Update Oud products base price to 150 (minimum variant)
UPDATE products SET price = 150, updated_at = NOW()
WHERE slug IN (
  'indian-dugga-vip', 'trat-agarwood-chips-vip', 'malaki-majalis', 'royal-indian-syoufi',
  'malaki-vietnami', 'malaki-mori', 'mori-vip', 'mori-malaki', 'salla-vip', 'elite-trad',
  'indian-syoufi-nagaland-vip', 'ancient-maroki-asgor-jungle', 'ancient-khao-yai-jungle-rare'
);

-- Update Dehnal Oud products base price to 150 (minimum variant)
UPDATE products SET price = 150, updated_at = NOW()
WHERE slug IN (
  'old-trat-oud-oil', 'elite-trat-oud-oil', 'sweet-trat-oud-oil', 'old-malino-oud-oil',
  'old-maroki-oud-oil-rare', 'jaya-oud-oil-rare', 'elite-prachin-oud-oil', 'old-indian-syoufi-oud-oil'
);

-- Update Perfumes base price to 200
UPDATE products SET price = 200, updated_at = NOW()
WHERE slug IN ('umsiya', 'hikayah', 'nesayim', 'kunooz', 'hams');

-- Update All Over Spray base price to 200
UPDATE products SET price = 200, updated_at = NOW()
WHERE slug IN ('chic-body-spray', 'hiyam-body-spray', 'fajr-body-spray', 'gharam-body-spray', 'ghazal-body-spray');

-- Update Limited Edition base price to 500
UPDATE products SET price = 500, updated_at = NOW()
WHERE slug IN ('irth-collection', 'gift-bag', 'antique-luxury-box');

DO $$ BEGIN RAISE NOTICE 'Product base prices updated.'; END $$;

-- ============================================================
-- STEP 8: UPDATE PRODUCT STOCK (sum of variant stocks)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'UPDATING PRODUCT STOCK'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

UPDATE products p
SET stock = subquery.total_stock, updated_at = NOW()
FROM (
  SELECT pv.product_id, SUM(pv.stock) as total_stock
  FROM product_variants pv
  WHERE pv.is_active = true
  GROUP BY pv.product_id
) subquery
WHERE p.id = subquery.product_id;

DO $$ BEGIN RAISE NOTICE 'Product stock updated.'; END $$;

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
GROUP BY c.id, c.name, c.sort_order
ORDER BY c.sort_order;

DO $$
DECLARE
  variant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO variant_count FROM product_variants WHERE is_active = true;
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCESS! Total variants: %', variant_count;
  RAISE NOTICE 'Expected: 76 (39 + 24 + 5 + 5 + 3)';
  RAISE NOTICE '========================================';
END $$;
