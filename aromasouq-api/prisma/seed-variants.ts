/**
 * Product Variants Seed Script
 *
 * Creates variants for all existing products based on their category:
 * - Oud (Agarwood): 1 Tola, 5 Tola, 50gm, 250gm, 500gm, 1kg
 * - Dehn Al Oud: 3ml, 6ml, 12ml, 5 Tola, 10 Tola
 * - Perfumes: 100ml
 * - All Over Sprays: 100ml
 *
 * Run with: npx ts-node prisma/seed-variants.ts
 *
 * This script is IDEMPOTENT - safe to run multiple times (uses upsert by SKU).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// VARIANT DEFINITIONS BY CATEGORY
// ============================================

// Oud (Agarwood) Variants - 6 sizes
const OUD_VARIANTS = [
  { name: '1 Tola', nameAr: '1 تولة', size: '1-tola', sortOrder: 1 },
  { name: '5 Tola', nameAr: '5 تولة', size: '5-tola', sortOrder: 2 },
  { name: '50gm', nameAr: '50 غرام', size: '50gm', sortOrder: 3 },
  { name: '250gm', nameAr: '250 غرام', size: '250gm', sortOrder: 4 },
  { name: '500gm', nameAr: '500 غرام', size: '500gm', sortOrder: 5 },
  { name: '1kg', nameAr: '1 كيلو', size: '1kg', sortOrder: 6 },
];

// Dehn Al Oud Variants - 5 sizes
const DEHN_OUD_VARIANTS = [
  { name: '3ml', nameAr: '3 مل', size: '3ml', sortOrder: 1 },
  { name: '6ml', nameAr: '6 مل', size: '6ml', sortOrder: 2 },
  { name: '12ml', nameAr: '12 مل', size: '12ml', sortOrder: 3 },
  { name: '5 Tola', nameAr: '5 تولة', size: '5-tola', sortOrder: 4 },
  { name: '10 Tola', nameAr: '10 تولة', size: '10-tola', sortOrder: 5 },
];

// Perfumes & All Over Sprays - Single size
const SINGLE_SIZE_VARIANT = [
  { name: '100ml', nameAr: '100 مل', size: '100ml', sortOrder: 1 },
];

// ============================================
// PRODUCT PRICING DATA
// All prices in AED
// ============================================

interface ProductPricing {
  slug: string;
  variants: { [size: string]: { price: number; compareAtPrice?: number; stock: number } };
}

// OUD PRODUCTS PRICING (13 products x 6 variants = 78 variants)
const OUD_PRICING: ProductPricing[] = [
  {
    slug: 'indian-dugga-vip',
    variants: {
      '1-tola': { price: 3200, compareAtPrice: 3800, stock: 25 },
      '5-tola': { price: 14500, compareAtPrice: 17000, stock: 15 },
      '50gm': { price: 12000, compareAtPrice: 14000, stock: 10 },
      '250gm': { price: 55000, compareAtPrice: 65000, stock: 5 },
      '500gm': { price: 105000, compareAtPrice: 125000, stock: 3 },
      '1kg': { price: 195000, compareAtPrice: 230000, stock: 2 },
    },
  },
  {
    slug: 'trat-agarwood-chips-vip',
    variants: {
      '1-tola': { price: 2800, compareAtPrice: 3300, stock: 20 },
      '5-tola': { price: 12500, compareAtPrice: 15000, stock: 12 },
      '50gm': { price: 10500, compareAtPrice: 12500, stock: 8 },
      '250gm': { price: 48000, compareAtPrice: 57000, stock: 4 },
      '500gm': { price: 92000, compareAtPrice: 110000, stock: 3 },
      '1kg': { price: 175000, compareAtPrice: 210000, stock: 2 },
    },
  },
  {
    slug: 'malaki-majalis',
    variants: {
      '1-tola': { price: 1800, compareAtPrice: 2100, stock: 30 },
      '5-tola': { price: 8000, compareAtPrice: 9500, stock: 20 },
      '50gm': { price: 6800, compareAtPrice: 8000, stock: 15 },
      '250gm': { price: 31000, compareAtPrice: 37000, stock: 8 },
      '500gm': { price: 58000, compareAtPrice: 70000, stock: 5 },
      '1kg': { price: 110000, compareAtPrice: 130000, stock: 3 },
    },
  },
  {
    slug: 'royal-indian-syoufi',
    variants: {
      '1-tola': { price: 3500, compareAtPrice: 4200, stock: 22 },
      '5-tola': { price: 15800, compareAtPrice: 19000, stock: 14 },
      '50gm': { price: 13200, compareAtPrice: 16000, stock: 10 },
      '250gm': { price: 60000, compareAtPrice: 72000, stock: 5 },
      '500gm': { price: 115000, compareAtPrice: 138000, stock: 3 },
      '1kg': { price: 215000, compareAtPrice: 260000, stock: 2 },
    },
  },
  {
    slug: 'malaki-vietnami',
    variants: {
      '1-tola': { price: 1500, compareAtPrice: 1800, stock: 28 },
      '5-tola': { price: 6800, compareAtPrice: 8000, stock: 18 },
      '50gm': { price: 5600, compareAtPrice: 6700, stock: 12 },
      '250gm': { price: 26000, compareAtPrice: 31000, stock: 6 },
      '500gm': { price: 48000, compareAtPrice: 58000, stock: 4 },
      '1kg': { price: 90000, compareAtPrice: 108000, stock: 2 },
    },
  },
  {
    slug: 'malaki-mori',
    variants: {
      '1-tola': { price: 1200, compareAtPrice: 1400, stock: 35 },
      '5-tola': { price: 5400, compareAtPrice: 6500, stock: 22 },
      '50gm': { price: 4500, compareAtPrice: 5400, stock: 15 },
      '250gm': { price: 21000, compareAtPrice: 25000, stock: 8 },
      '500gm': { price: 38000, compareAtPrice: 46000, stock: 5 },
      '1kg': { price: 72000, compareAtPrice: 86000, stock: 3 },
    },
  },
  {
    slug: 'mori-vip',
    variants: {
      '1-tola': { price: 1800, compareAtPrice: 2200, stock: 18 },
      '5-tola': { price: 8000, compareAtPrice: 9600, stock: 12 },
      '50gm': { price: 6800, compareAtPrice: 8200, stock: 10 },
      '250gm': { price: 31000, compareAtPrice: 37000, stock: 5 },
      '500gm': { price: 58000, compareAtPrice: 70000, stock: 3 },
      '1kg': { price: 110000, compareAtPrice: 132000, stock: 2 },
    },
  },
  {
    slug: 'mori-malaki',
    variants: {
      '1-tola': { price: 1400, compareAtPrice: 1700, stock: 24 },
      '5-tola': { price: 6200, compareAtPrice: 7500, stock: 16 },
      '50gm': { price: 5200, compareAtPrice: 6200, stock: 12 },
      '250gm': { price: 24000, compareAtPrice: 29000, stock: 6 },
      '500gm': { price: 44000, compareAtPrice: 53000, stock: 4 },
      '1kg': { price: 82000, compareAtPrice: 98000, stock: 2 },
    },
  },
  {
    slug: 'salla-vip',
    variants: {
      '1-tola': { price: 2200, compareAtPrice: 2600, stock: 15 },
      '5-tola': { price: 9800, compareAtPrice: 11800, stock: 10 },
      '50gm': { price: 8200, compareAtPrice: 9800, stock: 8 },
      '250gm': { price: 38000, compareAtPrice: 45000, stock: 4 },
      '500gm': { price: 72000, compareAtPrice: 86000, stock: 3 },
      '1kg': { price: 135000, compareAtPrice: 162000, stock: 2 },
    },
  },
  {
    slug: 'elite-trad',
    variants: {
      '1-tola': { price: 2500, compareAtPrice: 3000, stock: 12 },
      '5-tola': { price: 11200, compareAtPrice: 13500, stock: 8 },
      '50gm': { price: 9400, compareAtPrice: 11300, stock: 6 },
      '250gm': { price: 43000, compareAtPrice: 52000, stock: 4 },
      '500gm': { price: 82000, compareAtPrice: 98000, stock: 2 },
      '1kg': { price: 155000, compareAtPrice: 186000, stock: 1 },
    },
  },
  {
    slug: 'indian-syoufi-nagaland-vip',
    variants: {
      '1-tola': { price: 3800, compareAtPrice: 4500, stock: 10 },
      '5-tola': { price: 17000, compareAtPrice: 20500, stock: 6 },
      '50gm': { price: 14200, compareAtPrice: 17000, stock: 5 },
      '250gm': { price: 65000, compareAtPrice: 78000, stock: 3 },
      '500gm': { price: 125000, compareAtPrice: 150000, stock: 2 },
      '1kg': { price: 235000, compareAtPrice: 282000, stock: 1 },
    },
  },
  {
    slug: 'ancient-maroki-asgor-jungle',
    variants: {
      '1-tola': { price: 2000, compareAtPrice: 2400, stock: 8 },
      '5-tola': { price: 9000, compareAtPrice: 10800, stock: 5 },
      '50gm': { price: 7500, compareAtPrice: 9000, stock: 4 },
      '250gm': { price: 35000, compareAtPrice: 42000, stock: 3 },
      '500gm': { price: 65000, compareAtPrice: 78000, stock: 2 },
      '1kg': { price: 120000, compareAtPrice: 144000, stock: 1 },
    },
  },
  {
    slug: 'ancient-khao-yai-jungle-rare',
    variants: {
      '1-tola': { price: 5500, compareAtPrice: 6600, stock: 5 },
      '5-tola': { price: 24500, compareAtPrice: 29500, stock: 3 },
      '50gm': { price: 20500, compareAtPrice: 24600, stock: 3 },
      '250gm': { price: 95000, compareAtPrice: 114000, stock: 2 },
      '500gm': { price: 180000, compareAtPrice: 216000, stock: 1 },
      '1kg': { price: 340000, compareAtPrice: 408000, stock: 1 },
    },
  },
];

// DEHN AL OUD PRICING (8 products x 5 variants = 40 variants)
const DEHN_OUD_PRICING: ProductPricing[] = [
  {
    slug: 'old-trat-oud-oil',
    variants: {
      '3ml': { price: 650, compareAtPrice: 780, stock: 15 },
      '6ml': { price: 1200, compareAtPrice: 1440, stock: 12 },
      '12ml': { price: 2200, compareAtPrice: 2640, stock: 10 },
      '5-tola': { price: 9500, compareAtPrice: 11400, stock: 5 },
      '10-tola': { price: 18000, compareAtPrice: 21600, stock: 3 },
    },
  },
  {
    slug: 'elite-trat-oud-oil',
    variants: {
      '3ml': { price: 750, compareAtPrice: 900, stock: 12 },
      '6ml': { price: 1400, compareAtPrice: 1680, stock: 10 },
      '12ml': { price: 2600, compareAtPrice: 3120, stock: 8 },
      '5-tola': { price: 11500, compareAtPrice: 13800, stock: 4 },
      '10-tola': { price: 22000, compareAtPrice: 26400, stock: 2 },
    },
  },
  {
    slug: 'sweet-trat-oud-oil',
    variants: {
      '3ml': { price: 580, compareAtPrice: 700, stock: 18 },
      '6ml': { price: 1080, compareAtPrice: 1300, stock: 14 },
      '12ml': { price: 2000, compareAtPrice: 2400, stock: 10 },
      '5-tola': { price: 8800, compareAtPrice: 10500, stock: 5 },
      '10-tola': { price: 16500, compareAtPrice: 19800, stock: 3 },
    },
  },
  {
    slug: 'old-malino-oud-oil',
    variants: {
      '3ml': { price: 720, compareAtPrice: 860, stock: 10 },
      '6ml': { price: 1350, compareAtPrice: 1620, stock: 8 },
      '12ml': { price: 2500, compareAtPrice: 3000, stock: 6 },
      '5-tola': { price: 11000, compareAtPrice: 13200, stock: 4 },
      '10-tola': { price: 21000, compareAtPrice: 25200, stock: 2 },
    },
  },
  {
    slug: 'old-maroki-oud-oil-rare',
    variants: {
      '3ml': { price: 1400, compareAtPrice: 1680, stock: 5 },
      '6ml': { price: 2600, compareAtPrice: 3120, stock: 4 },
      '12ml': { price: 4800, compareAtPrice: 5760, stock: 3 },
      '5-tola': { price: 21000, compareAtPrice: 25200, stock: 2 },
      '10-tola': { price: 40000, compareAtPrice: 48000, stock: 1 },
    },
  },
  {
    slug: 'jaya-oud-oil-rare',
    variants: {
      '3ml': { price: 1600, compareAtPrice: 1920, stock: 6 },
      '6ml': { price: 3000, compareAtPrice: 3600, stock: 4 },
      '12ml': { price: 5500, compareAtPrice: 6600, stock: 3 },
      '5-tola': { price: 24000, compareAtPrice: 28800, stock: 2 },
      '10-tola': { price: 45000, compareAtPrice: 54000, stock: 1 },
    },
  },
  {
    slug: 'elite-prachin-oud-oil',
    variants: {
      '3ml': { price: 850, compareAtPrice: 1020, stock: 8 },
      '6ml': { price: 1600, compareAtPrice: 1920, stock: 6 },
      '12ml': { price: 2950, compareAtPrice: 3540, stock: 5 },
      '5-tola': { price: 13000, compareAtPrice: 15600, stock: 3 },
      '10-tola': { price: 24500, compareAtPrice: 29400, stock: 2 },
    },
  },
  {
    slug: 'old-indian-syoufi-oud-oil',
    variants: {
      '3ml': { price: 950, compareAtPrice: 1140, stock: 7 },
      '6ml': { price: 1780, compareAtPrice: 2140, stock: 5 },
      '12ml': { price: 3300, compareAtPrice: 3960, stock: 4 },
      '5-tola': { price: 14500, compareAtPrice: 17400, stock: 3 },
      '10-tola': { price: 27500, compareAtPrice: 33000, stock: 2 },
    },
  },
];

// PERFUMES PRICING (5 products x 1 variant = 5 variants)
const PERFUME_PRICING: ProductPricing[] = [
  {
    slug: 'umsiya',
    variants: {
      '100ml': { price: 480, compareAtPrice: 580, stock: 40 },
    },
  },
  {
    slug: 'hikayah',
    variants: {
      '100ml': { price: 450, compareAtPrice: 540, stock: 35 },
    },
  },
  {
    slug: 'nesayim',
    variants: {
      '100ml': { price: 420, compareAtPrice: 500, stock: 50 },
    },
  },
  {
    slug: 'kunooz',
    variants: {
      '100ml': { price: 420, compareAtPrice: 500, stock: 30 },
    },
  },
  {
    slug: 'hams',
    variants: {
      '100ml': { price: 380, compareAtPrice: 450, stock: 45 },
    },
  },
];

// ALL OVER SPRAYS PRICING (5 products x 1 variant = 5 variants)
const SPRAY_PRICING: ProductPricing[] = [
  {
    slug: 'chic-body-spray',
    variants: {
      '100ml': { price: 135, compareAtPrice: 160, stock: 80 },
    },
  },
  {
    slug: 'hiyam-body-spray',
    variants: {
      '100ml': { price: 125, compareAtPrice: 150, stock: 75 },
    },
  },
  {
    slug: 'fajr-body-spray',
    variants: {
      '100ml': { price: 120, compareAtPrice: 145, stock: 90 },
    },
  },
  {
    slug: 'gharam-body-spray',
    variants: {
      '100ml': { price: 115, compareAtPrice: 140, stock: 70 },
    },
  },
  {
    slug: 'ghazal-body-spray',
    variants: {
      '100ml': { price: 110, compareAtPrice: 130, stock: 85 },
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique SKU for a variant
 */
function generateVariantSku(productSku: string, size: string): string {
  // Convert size to uppercase and remove special characters
  const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${productSku}-${sizeCode}`;
}

/**
 * Create variants for a product
 */
async function createVariantsForProduct(
  productSlug: string,
  variantDefs: { name: string; nameAr: string; size: string; sortOrder: number }[],
  pricing: ProductPricing
): Promise<number> {
  // Find the product
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true, sku: true, name: true },
  });

  if (!product) {
    console.log(`  ⚠️  Product not found: ${productSlug}`);
    return 0;
  }

  let createdCount = 0;

  for (const variantDef of variantDefs) {
    const priceData = pricing.variants[variantDef.size];

    if (!priceData) {
      console.log(`  ⚠️  No pricing for ${productSlug} - ${variantDef.size}`);
      continue;
    }

    const variantSku = generateVariantSku(product.sku, variantDef.size);

    try {
      // Use upsert to make it idempotent
      await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {
          name: variantDef.name,
          nameAr: variantDef.nameAr,
          size: variantDef.size,
          price: priceData.price,
          compareAtPrice: priceData.compareAtPrice,
          stock: priceData.stock,
          sortOrder: variantDef.sortOrder,
          isActive: true,
        },
        create: {
          productId: product.id,
          name: variantDef.name,
          nameAr: variantDef.nameAr,
          size: variantDef.size,
          sku: variantSku,
          price: priceData.price,
          compareAtPrice: priceData.compareAtPrice,
          stock: priceData.stock,
          sortOrder: variantDef.sortOrder,
          isActive: true,
        },
      });
      createdCount++;
    } catch (error: any) {
      console.log(`  ❌ Error creating variant ${variantSku}: ${error.message}`);
    }
  }

  // Update parent product price to minimum variant price
  const variants = await prisma.productVariant.findMany({
    where: { productId: product.id, isActive: true },
  });

  if (variants.length > 0) {
    const minPrice = Math.min(...variants.map(v => v.price));
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: minPrice,
        stock: totalStock,
      },
    });
  }

  return createdCount;
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting variant seed...\n');
  console.log('='.repeat(70));

  let totalVariants = 0;

  // ====================================
  // OUD PRODUCTS - 13 products x 6 variants
  // ====================================
  console.log('\n📦 OUD (Agarwood) Products - Adding 6 variants each:\n');

  for (const pricing of OUD_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, OUD_VARIANTS, pricing);
    console.log(`  ✓ ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // ====================================
  // DEHN AL OUD PRODUCTS - 8 products x 5 variants
  // ====================================
  console.log('\n📦 DEHN AL OUD Products - Adding 5 variants each:\n');

  for (const pricing of DEHN_OUD_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, DEHN_OUD_VARIANTS, pricing);
    console.log(`  ✓ ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // ====================================
  // PERFUMES - 5 products x 1 variant
  // ====================================
  console.log('\n📦 PERFUMES - Adding 1 variant each:\n');

  for (const pricing of PERFUME_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, SINGLE_SIZE_VARIANT, pricing);
    console.log(`  ✓ ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // ====================================
  // ALL OVER SPRAYS - 5 products x 1 variant
  // ====================================
  console.log('\n📦 ALL OVER SPRAYS - Adding 1 variant each:\n');

  for (const pricing of SPRAY_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, SINGLE_SIZE_VARIANT, pricing);
    console.log(`  ✓ ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // ====================================
  // SUMMARY
  // ====================================
  console.log('\n' + '='.repeat(70));
  console.log('🎉 VARIANT SEED COMPLETE!');
  console.log('='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`  - Oud Products: 13 x 6 = 78 variants`);
  console.log(`  - Dehn Al Oud: 8 x 5 = 40 variants`);
  console.log(`  - Perfumes: 5 x 1 = 5 variants`);
  console.log(`  - All Over Sprays: 5 x 1 = 5 variants`);
  console.log(`  - TOTAL: ${totalVariants} variants created/updated`);
  console.log('='.repeat(70));

  // Verify counts
  const variantCount = await prisma.productVariant.count();
  console.log(`\n✅ Database now has ${variantCount} total variants`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
