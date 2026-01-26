/**
 * Product Variants Seed Script
 *
 * Creates variants for all existing products based on their category:
 * - Oud (Agarwood): 1 Tola, 3 Tola, 10 Tola
 * - Dehnal Oud (Oud Oil): 1 Tola, 3 Tola, 10 Tola
 * - Perfumes: 100ml
 * - All Over Sprays: 100ml
 * - Limited Edition: 1 Piece
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

// Oud & Dehnal Oud Variants - 3 sizes (same for both)
const TOLA_VARIANTS = [
  { name: '1 Tola', nameAr: '1 تولة', size: '1-tola', sortOrder: 1 },
  { name: '3 Tola', nameAr: '3 تولة', size: '3-tola', sortOrder: 2 },
  { name: '10 Tola', nameAr: '10 تولة', size: '10-tola', sortOrder: 3 },
];

// Perfumes & All Over Sprays - Single size
const ML_100_VARIANT = [
  { name: '100 ML', nameAr: '100 مل', size: '100ml', sortOrder: 1 },
];

// Limited Edition - Single piece
const PIECE_VARIANT = [
  { name: '1 Piece', nameAr: 'قطعة واحدة', size: '1-piece', sortOrder: 1 },
];

// ============================================
// PRODUCT PRICING DATA (All prices in AED)
// ============================================

interface ProductPricing {
  slug: string;
  variants: { [size: string]: { price: number; stock: number } };
}

// OUD PRODUCTS PRICING (13 products x 3 variants = 39 variants)
const OUD_PRICING: ProductPricing[] = [
  { slug: 'indian-dugga-vip', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'trat-agarwood-chips-vip', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'malaki-majalis', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'royal-indian-syoufi', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'malaki-vietnami', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'malaki-mori', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'mori-vip', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'mori-malaki', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'salla-vip', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'elite-trad', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'indian-syoufi-nagaland-vip', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'ancient-maroki-asgor-jungle', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'ancient-khao-yai-jungle-rare', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
];

// DEHNAL OUD PRODUCTS PRICING (8 products x 3 variants = 24 variants)
const DEHNAL_OUD_PRICING: ProductPricing[] = [
  { slug: 'old-trat-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'elite-trat-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'sweet-trat-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'old-malino-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'old-maroki-oud-oil-rare', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'jaya-oud-oil-rare', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'elite-prachin-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
  { slug: 'old-indian-syoufi-oud-oil', variants: { '1-tola': { price: 150, stock: 50 }, '3-tola': { price: 450, stock: 30 }, '10-tola': { price: 1500, stock: 10 } } },
];

// PERFUMES PRICING (5 products x 1 variant = 5 variants)
const PERFUME_PRICING: ProductPricing[] = [
  { slug: 'umsiya', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'hikayah', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'nesayim', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'kunooz', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'hams', variants: { '100ml': { price: 200, stock: 50 } } },
];

// ALL OVER SPRAYS PRICING (5 products x 1 variant = 5 variants)
const SPRAY_PRICING: ProductPricing[] = [
  { slug: 'chic-body-spray', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'hiyam-body-spray', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'fajr-body-spray', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'gharam-body-spray', variants: { '100ml': { price: 200, stock: 50 } } },
  { slug: 'ghazal-body-spray', variants: { '100ml': { price: 200, stock: 50 } } },
];

// LIMITED EDITION PRICING (3 products x 1 variant = 3 variants)
const LIMITED_PRICING: ProductPricing[] = [
  { slug: 'irth-collection', variants: { '1-piece': { price: 500, stock: 20 } } },
  { slug: 'gift-bag', variants: { '1-piece': { price: 500, stock: 20 } } },
  { slug: 'antique-luxury-box', variants: { '1-piece': { price: 500, stock: 20 } } },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateVariantSku(productSku: string, size: string): string {
  const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${productSku}-${sizeCode}`;
}

async function createVariantsForProduct(
  productSlug: string,
  variantDefs: { name: string; nameAr: string; size: string; sortOrder: number }[],
  pricing: ProductPricing
): Promise<number> {
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true, sku: true, name: true },
  });

  if (!product) {
    console.log(`  Warning: Product not found: ${productSlug}`);
    return 0;
  }

  let createdCount = 0;

  for (const variantDef of variantDefs) {
    const priceData = pricing.variants[variantDef.size];

    if (!priceData) {
      console.log(`  Warning: No pricing for ${productSlug} - ${variantDef.size}`);
      continue;
    }

    const variantSku = generateVariantSku(product.sku, variantDef.size);

    try {
      await prisma.productVariant.upsert({
        where: { sku: variantSku },
        update: {
          name: variantDef.name,
          nameAr: variantDef.nameAr,
          size: variantDef.size,
          price: priceData.price,
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
          stock: priceData.stock,
          sortOrder: variantDef.sortOrder,
          isActive: true,
        },
      });
      createdCount++;
    } catch (error: any) {
      console.log(`  Error creating variant ${variantSku}: ${error.message}`);
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
      data: { price: minPrice, stock: totalStock },
    });
  }

  return createdCount;
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('Starting variant seed...\n');
  console.log('='.repeat(60));

  let totalVariants = 0;

  // OUD PRODUCTS
  console.log('\nOUD Products - Adding 3 variants each:\n');
  for (const pricing of OUD_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, TOLA_VARIANTS, pricing);
    console.log(`  ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // DEHNAL OUD PRODUCTS
  console.log('\nDEHNAL OUD Products - Adding 3 variants each:\n');
  for (const pricing of DEHNAL_OUD_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, TOLA_VARIANTS, pricing);
    console.log(`  ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // PERFUMES
  console.log('\nPERFUMES - Adding 1 variant each:\n');
  for (const pricing of PERFUME_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, ML_100_VARIANT, pricing);
    console.log(`  ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // ALL OVER SPRAYS
  console.log('\nALL OVER SPRAYS - Adding 1 variant each:\n');
  for (const pricing of SPRAY_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, ML_100_VARIANT, pricing);
    console.log(`  ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // LIMITED EDITION
  console.log('\nLIMITED EDITION - Adding 1 variant each:\n');
  for (const pricing of LIMITED_PRICING) {
    const count = await createVariantsForProduct(pricing.slug, PIECE_VARIANT, pricing);
    console.log(`  ${pricing.slug}: ${count} variants`);
    totalVariants += count;
  }

  // SUMMARY
  console.log('\n' + '='.repeat(60));
  console.log('VARIANT SEED COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log(`  - Oud Products: 13 x 3 = 39 variants`);
  console.log(`  - Dehnal Oud: 8 x 3 = 24 variants`);
  console.log(`  - Perfumes: 5 x 1 = 5 variants`);
  console.log(`  - All Over Sprays: 5 x 1 = 5 variants`);
  console.log(`  - Limited Edition: 3 x 1 = 3 variants`);
  console.log(`  - TOTAL: ${totalVariants} variants created/updated`);
  console.log('='.repeat(60));

  const variantCount = await prisma.productVariant.count();
  console.log(`\nDatabase now has ${variantCount} total variants`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
