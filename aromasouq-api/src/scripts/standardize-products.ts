/**
 * Script to standardize product data:
 * 1. Set all products to use "Antique Oud" brand
 * 2. Remove all Unsplash image URLs to use placeholder system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting product standardization...\n');

  // Step 1: Find or create "Antique Oud" brand
  console.log('Step 1: Finding/Creating "Antique Oud" brand...');

  let antiqueOudBrand = await prisma.brand.findFirst({
    where: {
      OR: [
        { slug: 'antique-oud' },
        { name: { contains: 'Antique Oud', mode: 'insensitive' } },
        { name: { contains: 'antiqueOud', mode: 'insensitive' } },
      ]
    }
  });

  if (!antiqueOudBrand) {
    console.log('❌ "Antique Oud" brand not found. Creating it...');
    antiqueOudBrand = await prisma.brand.create({
      data: {
        name: 'Antique Oud',
        nameAr: 'عود عتيق',
        slug: 'antique-oud',
        description: 'Antique Oud - Premium Arabian Fragrances',
        descriptionAr: 'عود عتيق - العطور العربية الفاخرة',
        isActive: true,
      }
    });
    console.log('✅ Created "Antique Oud" brand:', antiqueOudBrand.id);
  } else {
    console.log('✅ Found "Antique Oud" brand:', antiqueOudBrand.id);
    console.log(`   Name: ${antiqueOudBrand.name}`);
  }

  console.log('\n---\n');

  // Step 2: Get all products that don't have "Antique Oud" brand
  console.log('Step 2: Finding products with different brands...');

  const productsToUpdate = await prisma.product.findMany({
    where: {
      OR: [
        { brandId: { not: antiqueOudBrand.id } },
        { brandId: null }
      ]
    },
    include: {
      brand: true
    }
  });

  console.log(`📦 Found ${productsToUpdate.length} products to update`);

  if (productsToUpdate.length > 0) {
    console.log('\nProducts to be updated:');
    productsToUpdate.slice(0, 10).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (Current brand: ${product.brand?.name || 'None'})`);
    });
    if (productsToUpdate.length > 10) {
      console.log(`  ... and ${productsToUpdate.length - 10} more`);
    }
  }

  console.log('\n---\n');

  // Step 3: Get all products with images
  console.log('Step 3: Finding products with image URLs...');

  const productsWithImages = await prisma.product.findMany({
    where: {
      images: {
        isEmpty: false
      }
    },
    select: {
      id: true,
      name: true,
      images: true
    }
  });

  console.log(`🖼️  Found ${productsWithImages.length} products with images`);

  if (productsWithImages.length > 0) {
    console.log('\nSample products with images:');
    productsWithImages.slice(0, 5).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}: ${product.images.length} image(s)`);
      product.images.slice(0, 2).forEach(img => {
        console.log(`     - ${img.substring(0, 60)}...`);
      });
    });
    if (productsWithImages.length > 5) {
      console.log(`  ... and ${productsWithImages.length - 5} more`);
    }
  }

  console.log('\n---\n');

  // Step 4: Confirm before proceeding
  console.log('📋 SUMMARY:');
  console.log(`  - Products to update brand: ${productsToUpdate.length}`);
  console.log(`  - Products to clear images: ${productsWithImages.length}`);
  console.log(`  - Target brand: ${antiqueOudBrand.name} (${antiqueOudBrand.id})`);

  console.log('\n🚀 Applying changes...\n');

  // Update brands
  if (productsToUpdate.length > 0) {
    const brandUpdateResult = await prisma.product.updateMany({
      where: {
        OR: [
          { brandId: { not: antiqueOudBrand.id } },
          { brandId: null }
        ]
      },
      data: {
        brandId: antiqueOudBrand.id
      }
    });
    console.log(`✅ Updated ${brandUpdateResult.count} products to use "Antique Oud" brand`);
  }

  // Clear images
  if (productsWithImages.length > 0) {
    const imageUpdateResult = await prisma.product.updateMany({
      where: {
        images: {
          isEmpty: false
        }
      },
      data: {
        images: []
      }
    });
    console.log(`✅ Cleared images from ${imageUpdateResult.count} products`);
  }

  console.log('\n✨ Product standardization complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
