/**
 * Production-Safe Category Migration Script
 *
 * This script safely migrates the category system to the new 7-category structure.
 * It handles:
 * 1. Creating new categories (all-over-spray, air-freshener, dakhoon-oud-muattar)
 * 2. Updating existing category names/translations
 * 3. Migrating products from body-spray to all-over-spray
 * 4. Safely removing old unused categories
 *
 * Run with: npx ts-node prisma/migrate-categories.ts
 *
 * This script is IDEMPOTENT - safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// The 7 client categories we want
const TARGET_CATEGORIES = [
  {
    slug: 'oud',
    name: 'Oud',
    nameAr: 'العود الطبيعي',
    description: 'Premium natural Oud wood chips and agarwood',
    descriptionAr: 'رقائق العود الطبيعي الفاخر وخشب العود',
    image: '/perfume-images/antik-posts9.jpg',
    icon: '🪵',
    sortOrder: 1,
  },
  {
    slug: 'dehnal-oud',
    name: 'Dehnal Oud Mukhallat',
    nameAr: 'دهن العود',
    description: 'Premium Dehnal Oud oils and mukhallat blends',
    descriptionAr: 'دهن العود الفاخر ومخلطات العود',
    image: '/perfume-images/antik-posts11.jpg',
    icon: '🧴',
    sortOrder: 2,
  },
  {
    slug: 'perfumes',
    name: 'Perfumes',
    nameAr: 'المخلطات و المسك',
    description: 'Exclusive perfume blends and musk fragrances',
    descriptionAr: 'مخلطات العطور الحصرية وعطور المسك',
    image: '/perfume-images/antik-posts6.jpg',
    icon: '🌸',
    sortOrder: 3,
  },
  {
    slug: 'all-over-spray',
    name: 'All Over Spray',
    nameAr: 'بخاخ الجسم',
    description: 'Refreshing all-over body sprays for everyday use',
    descriptionAr: 'بخاخات الجسم المنعشة للاستخدام اليومي',
    image: '/perfume-images/antik-posts7.jpg',
    icon: '💦',
    sortOrder: 4,
  },
  {
    slug: 'air-freshener',
    name: 'Air Freshener',
    nameAr: 'معطر الجو',
    description: 'Premium air fresheners and home fragrances',
    descriptionAr: 'معطرات الجو الفاخرة وعطور المنزل',
    image: '/perfume-images/antik-posts8.jpg',
    icon: '🏠',
    sortOrder: 5,
  },
  {
    slug: 'dakhoon-oud-muattar',
    name: 'Dakhoon & Oud Muattar',
    nameAr: 'العود المعطر و الدخون',
    description: 'Traditional dakhoon incense and scented oud',
    descriptionAr: 'الدخون التقليدي والعود المعطر',
    image: '/perfume-images/antik-posts10.jpg',
    icon: '🔥',
    sortOrder: 6,
  },
  {
    slug: 'limited-edition',
    name: 'Limited Edition',
    nameAr: 'إصدار محدود',
    description: 'Exclusive limited edition collections and gift sets',
    descriptionAr: 'مجموعات حصرية وهدايا محدودة الإصدار',
    image: '/perfume-images/antik-posts2.jpg',
    icon: '✨',
    sortOrder: 7,
  },
];

// Old categories to remove (if they have no products)
const OLD_CATEGORIES_TO_REMOVE = [
  'attars',
  'bakhoor',
  'home-fragrance',
  'gift-sets',
  'body-mist',
  'our-brand',
  // Note: body-spray is handled separately (products migrated first)
];

async function main() {
  console.log('🚀 Starting category migration...\n');

  // Step 1: Show current state
  console.log('📊 STEP 1: Current database state\n');
  const existingCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  console.log('Current categories:');
  for (const cat of existingCategories) {
    console.log(`  - ${cat.slug}: "${cat.name}" (${cat._count.products} products)`);
  }
  console.log('');

  // Step 2: Create/Update target categories
  console.log('📁 STEP 2: Creating/Updating target categories\n');

  for (const category of TARGET_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (existing) {
      // Update existing category
      await prisma.category.update({
        where: { slug: category.slug },
        data: {
          name: category.name,
          nameAr: category.nameAr,
          description: category.description,
          descriptionAr: category.descriptionAr,
          image: category.image,
          icon: category.icon,
          sortOrder: category.sortOrder,
          isActive: true,
        },
      });
      console.log(`  ✓ Updated: ${category.slug}`);
    } else {
      // Create new category
      await prisma.category.create({
        data: {
          ...category,
          isActive: true,
        },
      });
      console.log(`  ✓ Created: ${category.slug}`);
    }
  }
  console.log('');

  // Step 3: Migrate products from body-spray to all-over-spray
  console.log('🔄 STEP 3: Migrating products from body-spray to all-over-spray\n');

  const bodySprayCategory = await prisma.category.findUnique({
    where: { slug: 'body-spray' },
  });

  const allOverSprayCategory = await prisma.category.findUnique({
    where: { slug: 'all-over-spray' },
  });

  if (bodySprayCategory && allOverSprayCategory) {
    const productsToMigrate = await prisma.product.findMany({
      where: { categoryId: bodySprayCategory.id },
      select: { id: true, name: true },
    });

    if (productsToMigrate.length > 0) {
      console.log(`  Found ${productsToMigrate.length} products to migrate:`);
      for (const product of productsToMigrate) {
        console.log(`    - ${product.name}`);
      }

      // Migrate all products
      const result = await prisma.product.updateMany({
        where: { categoryId: bodySprayCategory.id },
        data: { categoryId: allOverSprayCategory.id },
      });

      console.log(`  ✓ Migrated ${result.count} products to all-over-spray`);
    } else {
      console.log('  No products to migrate from body-spray');
    }
  } else if (!bodySprayCategory) {
    console.log('  body-spray category not found (already migrated or never existed)');
  }
  console.log('');

  // Step 4: Remove old categories (only if empty)
  console.log('🗑️  STEP 4: Removing old categories (if empty)\n');

  // Add body-spray to removal list after migration
  const categoriesToRemove = [...OLD_CATEGORIES_TO_REMOVE, 'body-spray'];

  for (const slug of categoriesToRemove) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      console.log(`  - ${slug}: not found (skipping)`);
      continue;
    }

    if (category._count.products > 0) {
      console.log(`  ⚠️  ${slug}: has ${category._count.products} products - NOT DELETED`);
      console.log(`      You must reassign these products before deleting this category.`);
    } else {
      await prisma.category.delete({
        where: { slug },
      });
      console.log(`  ✓ Deleted: ${slug}`);
    }
  }
  console.log('');

  // Step 5: Final state
  console.log('📊 STEP 5: Final database state\n');
  const finalCategories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  console.log('Final categories:');
  for (const cat of finalCategories) {
    const isTarget = TARGET_CATEGORIES.some(t => t.slug === cat.slug);
    const marker = isTarget ? '✓' : '⚠️';
    console.log(`  ${marker} ${cat.slug}: "${cat.name}" (${cat._count.products} products)`);
  }

  const targetSlugs = TARGET_CATEGORIES.map(t => t.slug);
  const unexpectedCategories = finalCategories.filter(c => !targetSlugs.includes(c.slug));

  if (unexpectedCategories.length > 0) {
    console.log('\n⚠️  WARNING: The following categories are not in the target list:');
    for (const cat of unexpectedCategories) {
      console.log(`    - ${cat.slug} (${cat._count.products} products)`);
    }
    console.log('    These may need manual cleanup.');
  }

  console.log('\n✅ Migration complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
