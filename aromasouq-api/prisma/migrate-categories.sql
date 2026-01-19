-- ============================================================
-- PRODUCTION CATEGORY MIGRATION SQL
-- ============================================================
-- Run this in Supabase SQL Editor BEFORE pushing code
-- This script is SAFE to run multiple times (idempotent)
-- ============================================================

-- ============================================================
-- STEP 1: SHOW CURRENT STATE (BEFORE MIGRATION)
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 1: CURRENT DATABASE STATE (BEFORE)'; END $$;
DO $$ BEGIN RAISE NOTICE '========================================'; END $$;

SELECT
  '📦 BEFORE: ' || slug as status,
  name,
  name_ar as arabic_name,
  sort_order,
  (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id) as product_count
FROM categories
ORDER BY sort_order;

-- ============================================================
-- STEP 2: CREATE/UPDATE THE 7 TARGET CATEGORIES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '=========================================='; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 2: CREATING/UPDATING 7 CATEGORIES'; END $$;
DO $$ BEGIN RAISE NOTICE '=========================================='; END $$;

-- Category 1: Oud
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'oud', 'Oud', 'العود الطبيعي',
  'Premium natural Oud wood chips and agarwood',
  'رقائق العود الطبيعي الفاخر وخشب العود',
  '/perfume-images/antik-posts9.jpg', '🪵', 1, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Oud',
  name_ar = 'العود الطبيعي',
  description = 'Premium natural Oud wood chips and agarwood',
  description_ar = 'رقائق العود الطبيعي الفاخر وخشب العود',
  image = '/perfume-images/antik-posts9.jpg',
  icon = '🪵',
  sort_order = 1,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 1/7: oud - DONE'; END $$;

-- Category 2: Dehnal Oud Mukhallat
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'dehnal-oud', 'Dehnal Oud Mukhallat', 'دهن العود',
  'Premium Dehnal Oud oils and mukhallat blends',
  'دهن العود الفاخر ومخلطات العود',
  '/perfume-images/antik-posts11.jpg', '🧴', 2, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Dehnal Oud Mukhallat',
  name_ar = 'دهن العود',
  description = 'Premium Dehnal Oud oils and mukhallat blends',
  description_ar = 'دهن العود الفاخر ومخلطات العود',
  image = '/perfume-images/antik-posts11.jpg',
  icon = '🧴',
  sort_order = 2,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 2/7: dehnal-oud - DONE'; END $$;

-- Category 3: Perfumes
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'perfumes', 'Perfumes', 'المخلطات و المسك',
  'Exclusive perfume blends and musk fragrances',
  'مخلطات العطور الحصرية وعطور المسك',
  '/perfume-images/antik-posts6.jpg', '🌸', 3, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Perfumes',
  name_ar = 'المخلطات و المسك',
  description = 'Exclusive perfume blends and musk fragrances',
  description_ar = 'مخلطات العطور الحصرية وعطور المسك',
  image = '/perfume-images/antik-posts6.jpg',
  icon = '🌸',
  sort_order = 3,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 3/7: perfumes - DONE'; END $$;

-- Category 4: All Over Spray (NEW - replaces body-spray)
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'all-over-spray', 'All Over Spray', 'بخاخ الجسم',
  'Refreshing all-over body sprays for everyday use',
  'بخاخات الجسم المنعشة للاستخدام اليومي',
  '/perfume-images/antik-posts7.jpg', '💦', 4, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'All Over Spray',
  name_ar = 'بخاخ الجسم',
  description = 'Refreshing all-over body sprays for everyday use',
  description_ar = 'بخاخات الجسم المنعشة للاستخدام اليومي',
  image = '/perfume-images/antik-posts7.jpg',
  icon = '💦',
  sort_order = 4,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 4/7: all-over-spray - DONE (NEW)'; END $$;

-- Category 5: Air Freshener (NEW)
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'air-freshener', 'Air Freshener', 'معطر الجو',
  'Premium air fresheners and home fragrances',
  'معطرات الجو الفاخرة وعطور المنزل',
  '/perfume-images/antik-posts8.jpg', '🏠', 5, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Air Freshener',
  name_ar = 'معطر الجو',
  description = 'Premium air fresheners and home fragrances',
  description_ar = 'معطرات الجو الفاخرة وعطور المنزل',
  image = '/perfume-images/antik-posts8.jpg',
  icon = '🏠',
  sort_order = 5,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 5/7: air-freshener - DONE (NEW)'; END $$;

-- Category 6: Dakhoon & Oud Muattar (NEW)
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'dakhoon-oud-muattar', 'Dakhoon & Oud Muattar', 'العود المعطر و الدخون',
  'Traditional dakhoon incense and scented oud',
  'الدخون التقليدي والعود المعطر',
  '/perfume-images/antik-posts10.jpg', '🔥', 6, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Dakhoon & Oud Muattar',
  name_ar = 'العود المعطر و الدخون',
  description = 'Traditional dakhoon incense and scented oud',
  description_ar = 'الدخون التقليدي والعود المعطر',
  image = '/perfume-images/antik-posts10.jpg',
  icon = '🔥',
  sort_order = 6,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 6/7: dakhoon-oud-muattar - DONE (NEW)'; END $$;

-- Category 7: Limited Edition
INSERT INTO categories (id, slug, name, name_ar, description, description_ar, image, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 'limited-edition', 'Limited Edition', 'إصدار محدود',
  'Exclusive limited edition collections and gift sets',
  'مجموعات حصرية وهدايا محدودة الإصدار',
  '/perfume-images/antik-posts2.jpg', '✨', 7, true, NOW(), NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = 'Limited Edition',
  name_ar = 'إصدار محدود',
  description = 'Exclusive limited edition collections and gift sets',
  description_ar = 'مجموعات حصرية وهدايا محدودة الإصدار',
  image = '/perfume-images/antik-posts2.jpg',
  icon = '✨',
  sort_order = 7,
  is_active = true,
  updated_at = NOW();

DO $$ BEGIN RAISE NOTICE '✅ Category 7/7: limited-edition - DONE'; END $$;
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '✅ ALL 7 CATEGORIES CREATED/UPDATED SUCCESSFULLY'; END $$;

-- ============================================================
-- STEP 3: CHECK PRODUCTS IN body-spray BEFORE MIGRATION
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '================================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 3: CHECKING PRODUCTS IN body-spray CATEGORY'; END $$;
DO $$ BEGIN RAISE NOTICE '================================================'; END $$;

SELECT
  '🔍 Product to migrate: ' || p.name as status,
  p.slug as product_slug,
  c.slug as current_category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'body-spray';

-- ============================================================
-- STEP 4: MIGRATE PRODUCTS FROM body-spray TO all-over-spray
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '===================================================='; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 4: MIGRATING PRODUCTS body-spray → all-over-spray'; END $$;
DO $$ BEGIN RAISE NOTICE '===================================================='; END $$;

UPDATE products
SET category_id = (SELECT id FROM categories WHERE slug = 'all-over-spray'),
    updated_at = NOW()
WHERE category_id = (SELECT id FROM categories WHERE slug = 'body-spray');

DO $$ BEGIN RAISE NOTICE '✅ Products migrated to all-over-spray'; END $$;

-- Verify migration worked
SELECT
  '✅ Migrated: ' || p.name as status,
  c.slug as new_category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'all-over-spray';

-- ============================================================
-- STEP 5: CHECK OLD CATEGORIES BEFORE DELETION
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '============================================='; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 5: CHECKING OLD CATEGORIES BEFORE DELETE'; END $$;
DO $$ BEGIN RAISE NOTICE '============================================='; END $$;

SELECT
  CASE
    WHEN COUNT(p.id) > 0 THEN '⚠️ HAS PRODUCTS - WILL NOT DELETE: ' || c.slug
    ELSE '🗑️ EMPTY - WILL DELETE: ' || c.slug
  END as status,
  c.name,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
WHERE c.slug IN ('attars', 'bakhoor', 'home-fragrance', 'gift-sets', 'body-mist', 'body-spray', 'our-brand')
GROUP BY c.id, c.slug, c.name;

-- ============================================================
-- STEP 6: DELETE OLD EMPTY CATEGORIES
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '================================'; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 6: DELETING OLD CATEGORIES'; END $$;
DO $$ BEGIN RAISE NOTICE '================================'; END $$;

-- Delete old categories that have NO products
DELETE FROM categories
WHERE slug IN ('attars', 'bakhoor', 'home-fragrance', 'gift-sets', 'body-mist', 'body-spray', 'our-brand')
AND id NOT IN (SELECT DISTINCT category_id FROM products WHERE category_id IS NOT NULL);

DO $$ BEGIN RAISE NOTICE '✅ Old empty categories deleted'; END $$;

-- ============================================================
-- STEP 7: FINAL VERIFICATION
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '====================================='; END $$;
DO $$ BEGIN RAISE NOTICE 'STEP 7: FINAL STATE (AFTER MIGRATION)'; END $$;
DO $$ BEGIN RAISE NOTICE '====================================='; END $$;

SELECT
  '✅ FINAL: ' || slug as status,
  name,
  name_ar as arabic_name,
  sort_order,
  (SELECT COUNT(*) FROM products WHERE products.category_id = categories.id) as product_count
FROM categories
ORDER BY sort_order;

-- Count check
DO $$
DECLARE
  cat_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;

  IF cat_count = 7 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉';
    RAISE NOTICE '🎉 SUCCESS! You now have exactly 7 categories! 🎉';
    RAISE NOTICE '🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now safely push your code changes!';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ WARNING: You have % categories instead of 7', cat_count;
    RAISE NOTICE 'Check the output above for categories with products that could not be deleted.';
  END IF;
END $$;

-- ============================================================
-- SUMMARY TABLE
-- ============================================================
DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE '==================='; END $$;
DO $$ BEGIN RAISE NOTICE 'MIGRATION COMPLETE!'; END $$;
DO $$ BEGIN RAISE NOTICE '==================='; END $$;
