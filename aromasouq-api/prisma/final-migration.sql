-- ============================================================
-- COMPLETE PRODUCTION MIGRATION SCRIPT (FIXED VERSION)
-- ============================================================
-- Run this in Supabase SQL Editor
-- This script marks unwanted products as INACTIVE instead of
-- deleting them to preserve order history.
-- ============================================================

-- ============================================================
-- STEP 0: SHOW CURRENT STATE BEFORE ANY CHANGES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 0: CURRENT STATE (BEFORE MIGRATION)                  ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

DO $$
DECLARE
  cat_count INTEGER;
  prod_count INTEGER;
  active_prod_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO prod_count FROM products;
  SELECT COUNT(*) INTO active_prod_count FROM products WHERE is_active = true;
  RAISE NOTICE '📊 Current categories: %', cat_count;
  RAISE NOTICE '📊 Current products: % (% active)', prod_count, active_prod_count;
END $$;

-- Show all current categories
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '📁 Current Categories:'; END $$;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT slug, name, (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND is_active = true) as cnt
    FROM categories ORDER BY sort_order
  LOOP
    RAISE NOTICE '   • % (%) - % active products', rec.slug, rec.name, rec.cnt;
  END LOOP;
END $$;

-- ============================================================
-- STEP 1: CREATE MISSING CATEGORIES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 1: CREATING MISSING CATEGORIES                       ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- Check and create all-over-spray
DO $$
DECLARE
  exists_check INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_check FROM categories WHERE slug = 'all-over-spray';
  IF exists_check > 0 THEN
    RAISE NOTICE '   ⏭️  all-over-spray already exists - skipping';
  ELSE
    RAISE NOTICE '   ➕ Creating all-over-spray...';
  END IF;
END $$;

INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'all-over-spray', 'All Over Spray', 'بخاخ الجسم',
  'Refreshing all-over body sprays for everyday use',
  'بخاخات الجسم المنعشة للاستخدام اليومي',
  '/perfume-images/antik-posts7.jpg', '💦', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Check and create air-freshener
DO $$
DECLARE
  exists_check INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_check FROM categories WHERE slug = 'air-freshener';
  IF exists_check > 0 THEN
    RAISE NOTICE '   ⏭️  air-freshener already exists - skipping';
  ELSE
    RAISE NOTICE '   ➕ Creating air-freshener...';
  END IF;
END $$;

INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'air-freshener', 'Air Freshener', 'معطر الجو',
  'Premium air fresheners and home fragrances',
  'معطرات الجو الفاخرة وعطور المنزل',
  '/perfume-images/antik-posts8.jpg', '🏠', 5, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Check and create dakhoon-oud-muattar
DO $$
DECLARE
  exists_check INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_check FROM categories WHERE slug = 'dakhoon-oud-muattar';
  IF exists_check > 0 THEN
    RAISE NOTICE '   ⏭️  dakhoon-oud-muattar already exists - skipping';
  ELSE
    RAISE NOTICE '   ➕ Creating dakhoon-oud-muattar...';
  END IF;
END $$;

INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), 'dakhoon-oud-muattar', 'Dakhoon & Oud Muattar', 'العود المعطر و الدخون',
  'Traditional dakhoon incense and scented oud',
  'الدخون التقليدي والعود المعطر',
  '/perfume-images/antik-posts10.jpg', '🔥', 6, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '   ✅ Missing categories creation complete'; END $$;

-- ============================================================
-- STEP 2: UPDATE EXISTING CATEGORIES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 2: UPDATING EXISTING CATEGORIES                      ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- Update oud
DO $$ BEGIN RAISE NOTICE '   📝 Updating oud → name_ar: العود الطبيعي, sort_order: 1'; END $$;
UPDATE categories SET
  name = 'Oud',
  name_ar = 'العود الطبيعي',
  description = 'Premium natural Oud wood chips and agarwood',
  description_ar = 'رقائق العود الطبيعي الفاخر وخشب العود',
  image = '/perfume-images/antik-posts9.jpg',
  icon = '🪵',
  sort_order = 1,
  updated_at = NOW()
WHERE slug = 'oud';

-- Update dehnal-oud
DO $$ BEGIN RAISE NOTICE '   📝 Updating dehnal-oud → name: Dehnal Oud Mukhallat, sort_order: 2'; END $$;
UPDATE categories SET
  name = 'Dehnal Oud Mukhallat',
  name_ar = 'دهن العود',
  description = 'Premium Dehnal Oud oils and mukhallat blends',
  description_ar = 'دهن العود الفاخر ومخلطات العود',
  image = '/perfume-images/antik-posts11.jpg',
  icon = '🧴',
  sort_order = 2,
  updated_at = NOW()
WHERE slug = 'dehnal-oud';

-- Update perfumes
DO $$ BEGIN RAISE NOTICE '   📝 Updating perfumes → name_ar: المخلطات و المسك, sort_order: 3'; END $$;
UPDATE categories SET
  name = 'Perfumes',
  name_ar = 'المخلطات و المسك',
  description = 'Exclusive perfume blends and musk fragrances',
  description_ar = 'مخلطات العطور الحصرية وعطور المسك',
  image = '/perfume-images/antik-posts6.jpg',
  icon = '🌸',
  sort_order = 3,
  updated_at = NOW()
WHERE slug = 'perfumes';

-- Update all-over-spray (in case it existed before with wrong data)
DO $$ BEGIN RAISE NOTICE '   📝 Updating all-over-spray → sort_order: 4'; END $$;
UPDATE categories SET
  name = 'All Over Spray',
  name_ar = 'بخاخ الجسم',
  description = 'Refreshing all-over body sprays for everyday use',
  description_ar = 'بخاخات الجسم المنعشة للاستخدام اليومي',
  image = '/perfume-images/antik-posts7.jpg',
  icon = '💦',
  sort_order = 4,
  updated_at = NOW()
WHERE slug = 'all-over-spray';

-- Update air-freshener
DO $$ BEGIN RAISE NOTICE '   📝 Updating air-freshener → sort_order: 5'; END $$;
UPDATE categories SET
  name = 'Air Freshener',
  name_ar = 'معطر الجو',
  description = 'Premium air fresheners and home fragrances',
  description_ar = 'معطرات الجو الفاخرة وعطور المنزل',
  image = '/perfume-images/antik-posts8.jpg',
  icon = '🏠',
  sort_order = 5,
  updated_at = NOW()
WHERE slug = 'air-freshener';

-- Update dakhoon-oud-muattar
DO $$ BEGIN RAISE NOTICE '   📝 Updating dakhoon-oud-muattar → sort_order: 6'; END $$;
UPDATE categories SET
  name = 'Dakhoon & Oud Muattar',
  name_ar = 'العود المعطر و الدخون',
  description = 'Traditional dakhoon incense and scented oud',
  description_ar = 'الدخون التقليدي والعود المعطر',
  image = '/perfume-images/antik-posts10.jpg',
  icon = '🔥',
  sort_order = 6,
  updated_at = NOW()
WHERE slug = 'dakhoon-oud-muattar';

-- Update limited-edition
DO $$ BEGIN RAISE NOTICE '   📝 Updating limited-edition → sort_order: 7'; END $$;
UPDATE categories SET
  name = 'Limited Edition',
  name_ar = 'إصدار محدود',
  description = 'Exclusive limited edition collections and gift sets',
  description_ar = 'مجموعات حصرية وهدايا محدودة الإصدار',
  image = '/perfume-images/antik-posts2.jpg',
  icon = '✨',
  sort_order = 7,
  updated_at = NOW()
WHERE slug = 'limited-edition';

DO $$ BEGIN RAISE NOTICE '   ✅ Category updates complete'; END $$;

-- ============================================================
-- STEP 3: MOVE PRODUCTS FROM body-spray TO all-over-spray
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 3: MOVING body-spray PRODUCTS → all-over-spray       ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- List products to be moved
DO $$
DECLARE
  rec RECORD;
  move_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT p.name, p.slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE c.slug = 'body-spray'
  LOOP
    RAISE NOTICE '   🔄 Moving: % (%)', rec.name, rec.slug;
    move_count := move_count + 1;
  END LOOP;

  IF move_count = 0 THEN
    RAISE NOTICE '   ⏭️  No products in body-spray to move (already done)';
  ELSE
    RAISE NOTICE '   📦 Total products to move: %', move_count;
  END IF;
END $$;

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'all-over-spray'),
    updated_at = NOW()
WHERE category_id = (SELECT id FROM categories WHERE slug = 'body-spray');

DO $$ BEGIN RAISE NOTICE '   ✅ body-spray products move complete'; END $$;

-- ============================================================
-- STEP 4: MOVE "Fajr" FROM oud TO all-over-spray
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 4: MOVING "Fajr" FROM oud → all-over-spray           ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

DO $$
DECLARE
  fajr_exists INTEGER;
  fajr_cat TEXT;
BEGIN
  SELECT COUNT(*), (SELECT c.slug FROM categories c JOIN products p ON p.category_id = c.id WHERE p.slug = 'fajr-body-spray')
  INTO fajr_exists, fajr_cat
  FROM products WHERE slug = 'fajr-body-spray';

  IF fajr_exists > 0 THEN
    IF fajr_cat = 'all-over-spray' THEN
      RAISE NOTICE '   ⏭️  Fajr already in all-over-spray - skipping';
    ELSE
      RAISE NOTICE '   🔄 Moving: Fajr (fajr-body-spray) from % → all-over-spray', fajr_cat;
    END IF;
  ELSE
    RAISE NOTICE '   ⏭️  Fajr product not found - skipping';
  END IF;
END $$;

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'all-over-spray'),
    updated_at = NOW()
WHERE slug = 'fajr-body-spray';

DO $$ BEGIN RAISE NOTICE '   ✅ Fajr move complete'; END $$;

-- ============================================================
-- STEP 5: MOVE "IRTH COLLECTION" TO limited-edition
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 5: MOVING "IRTH COLLECTION" → limited-edition        ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

DO $$
DECLARE
  irth_exists INTEGER;
  irth_cat TEXT;
BEGIN
  SELECT COUNT(*) INTO irth_exists FROM products WHERE slug = 'IRTH-COLLECTION ';

  IF irth_exists > 0 THEN
    SELECT c.slug INTO irth_cat FROM categories c JOIN products p ON p.category_id = c.id WHERE p.slug = 'IRTH-COLLECTION ';
    IF irth_cat = 'limited-edition' THEN
      RAISE NOTICE '   ⏭️  IRTH COLLECTION already in limited-edition - skipping';
    ELSE
      RAISE NOTICE '   🔄 Moving: IRTH COLLECTION from % → limited-edition', irth_cat;
    END IF;
  ELSE
    RAISE NOTICE '   ⏭️  IRTH COLLECTION not found - skipping';
  END IF;
END $$;

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'limited-edition'),
    updated_at = NOW()
WHERE slug = 'IRTH-COLLECTION ';

DO $$ BEGIN RAISE NOTICE '   ✅ IRTH COLLECTION move complete'; END $$;

-- ============================================================
-- STEP 6: MARK UNWANTED PRODUCTS AS INACTIVE (NOT DELETE!)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 6: MARKING UNWANTED PRODUCTS AS INACTIVE             ║'; END $$;
DO $$ BEGIN RAISE NOTICE '║  (Not deleting to preserve order history)                  ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- Check Test Product
DO $$
DECLARE
  test_exists INTEGER;
  test_active BOOLEAN;
BEGIN
  SELECT COUNT(*), is_active INTO test_exists, test_active
  FROM products WHERE slug = 'payment-test-product-1aed'
  GROUP BY is_active;

  IF test_exists > 0 THEN
    IF test_active = false THEN
      RAISE NOTICE '   ⏭️  Test Product already inactive - skipping';
    ELSE
      RAISE NOTICE '   🔕 Marking INACTIVE: Test Product (payment-test-product-1aed)';
    END IF;
  ELSE
    RAISE NOTICE '   ⏭️  Test Product not found - skipping';
  END IF;
END $$;

UPDATE products
SET is_active = false, updated_at = NOW()
WHERE slug = 'payment-test-product-1aed';

-- Check Rejaul Karim
DO $$
DECLARE
  rej_exists INTEGER;
  rej_active BOOLEAN;
BEGIN
  SELECT COUNT(*), is_active INTO rej_exists, rej_active
  FROM products WHERE slug = 'rejaul-karim'
  GROUP BY is_active;

  IF rej_exists > 0 THEN
    IF rej_active = false THEN
      RAISE NOTICE '   ⏭️  Rejaul Karim already inactive - skipping';
    ELSE
      RAISE NOTICE '   🔕 Marking INACTIVE: Rejaul Karim (rejaul-karim)';
    END IF;
  ELSE
    RAISE NOTICE '   ⏭️  Rejaul Karim not found - skipping';
  END IF;
END $$;

UPDATE products
SET is_active = false, updated_at = NOW()
WHERE slug = 'rejaul-karim';

DO $$ BEGIN RAISE NOTICE '   ✅ Unwanted products marked as inactive'; END $$;

-- ============================================================
-- STEP 7: DELETE OLD CATEGORIES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 7: DELETING OLD CATEGORIES                           ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- List categories to be deleted
DO $$
DECLARE
  rec RECORD;
  delete_count INTEGER := 0;
  keep_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT slug, name, (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id) as cnt
    FROM categories
    WHERE slug NOT IN ('oud', 'dehnal-oud', 'perfumes', 'all-over-spray', 'air-freshener', 'dakhoon-oud-muattar', 'limited-edition')
  LOOP
    IF rec.cnt > 0 THEN
      RAISE NOTICE '   ⚠️  % (%) has % products - CANNOT DELETE (will keep)', rec.slug, rec.name, rec.cnt;
      keep_count := keep_count + 1;
    ELSE
      RAISE NOTICE '   🗑️  Deleting: % (%)', rec.slug, rec.name;
      delete_count := delete_count + 1;
    END IF;
  END LOOP;

  IF delete_count = 0 AND keep_count = 0 THEN
    RAISE NOTICE '   ⏭️  No old categories to delete (already clean)';
  ELSIF delete_count > 0 THEN
    RAISE NOTICE '   📦 Categories to delete: %', delete_count;
  END IF;

  IF keep_count > 0 THEN
    RAISE NOTICE '   ⚠️  Categories kept (have products): %', keep_count;
  END IF;
END $$;

DELETE FROM categories
WHERE slug NOT IN ('oud', 'dehnal-oud', 'perfumes', 'all-over-spray', 'air-freshener', 'dakhoon-oud-muattar', 'limited-edition')
AND id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL);

DO $$ BEGIN RAISE NOTICE '   ✅ Old categories deletion complete'; END $$;

-- ============================================================
-- STEP 8: FINAL VERIFICATION
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '╔════════════════════════════════════════════════════════════╗'; END $$;
DO $$ BEGIN RAISE NOTICE '║  STEP 8: FINAL VERIFICATION                                ║'; END $$;
DO $$ BEGIN RAISE NOTICE '╚════════════════════════════════════════════════════════════╝'; END $$;

-- Show final categories
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '📁 Final Categories:'; END $$;

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT slug, name, name_ar, sort_order,
           (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND is_active = true) as active_cnt,
           (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id AND is_active = false) as inactive_cnt
    FROM categories
    ORDER BY sort_order
  LOOP
    IF rec.inactive_cnt > 0 THEN
      RAISE NOTICE '   ✅ % | % | % | Order: % | Active: % | Inactive: %',
        rec.slug, rec.name, rec.name_ar, rec.sort_order, rec.active_cnt, rec.inactive_cnt;
    ELSE
      RAISE NOTICE '   ✅ % | % | % | Order: % | Products: %',
        rec.slug, rec.name, rec.name_ar, rec.sort_order, rec.active_cnt;
    END IF;
  END LOOP;
END $$;

-- Show final products per category
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '📦 Active Products by Category:'; END $$;

DO $$
DECLARE
  rec RECORD;
  current_cat TEXT := '';
BEGIN
  FOR rec IN
    SELECT c.slug as cat_slug, c.name as cat_name, p.name as prod_name, p.is_active
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
    ORDER BY c.sort_order, p.name
  LOOP
    IF current_cat != rec.cat_slug THEN
      RAISE NOTICE '';
      RAISE NOTICE '   📂 % (%):', rec.cat_name, rec.cat_slug;
      current_cat := rec.cat_slug;
    END IF;
    RAISE NOTICE '      • %', rec.prod_name;
  END LOOP;
END $$;

-- Show inactive products
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '🔕 Inactive Products (hidden from website, kept for order history):'; END $$;

DO $$
DECLARE
  rec RECORD;
  inactive_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT p.name as prod_name, p.slug, c.name as cat_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = false
    ORDER BY p.name
  LOOP
    RAISE NOTICE '      • % (%) in %', rec.prod_name, rec.slug, rec.cat_name;
    inactive_count := inactive_count + 1;
  END LOOP;

  IF inactive_count = 0 THEN
    RAISE NOTICE '      (none)';
  END IF;
END $$;

-- Final summary
DO $$
DECLARE
  cat_count INTEGER;
  prod_count INTEGER;
  active_prod_count INTEGER;
  inactive_prod_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO prod_count FROM products;
  SELECT COUNT(*) INTO active_prod_count FROM products WHERE is_active = true;
  SELECT COUNT(*) INTO inactive_prod_count FROM products WHERE is_active = false;

  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════';

  IF cat_count = 7 THEN
    RAISE NOTICE '🎉🎉🎉 SUCCESS! 🎉🎉🎉';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Categories: % (expected: 7)', cat_count;
    RAISE NOTICE '✅ Active Products: % (expected: 34)', active_prod_count;
    RAISE NOTICE '📦 Inactive Products: % (kept for order history)', inactive_prod_count;
    RAISE NOTICE '';
    RAISE NOTICE '👉 You can now push your code changes!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: Migration may be incomplete';
    RAISE NOTICE '';
    RAISE NOTICE '❌ Categories: % (expected: 7)', cat_count;
    RAISE NOTICE '📦 Active Products: %', active_prod_count;
    RAISE NOTICE '📦 Inactive Products: %', inactive_prod_count;
    RAISE NOTICE '';
    RAISE NOTICE '👉 Check the logs above for categories that could not be deleted.';
  END IF;

  RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;

-- Also output a table for visual confirmation
SELECT
  c.slug,
  c.name,
  c.name_ar,
  c.sort_order,
  COUNT(p.id) FILTER (WHERE p.is_active = true) as active_products,
  COUNT(p.id) FILTER (WHERE p.is_active = false) as inactive_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.slug, c.name, c.name_ar, c.sort_order
ORDER BY c.sort_order;
