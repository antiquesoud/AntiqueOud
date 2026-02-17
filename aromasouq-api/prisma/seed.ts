import { PrismaClient, UserRole, VendorStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // ====================================
  // USERS & WALLETS
  // ====================================
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aromasouq.ae' },
    update: {},
    create: {
      email: 'admin@aromasouq.ae',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      balance: 1000,
      lifetimeEarned: 1000,
      lifetimeSpent: 0,
    },
  });

  // ====================================
  // DEFAULT VENDOR - ANTIQUE OUD
  // For Single-Vendor Mode
  // ====================================
  console.log('🏪 Creating default vendor (Antique Oud)...\n');

  // Vendor User (can also act as admin)
  const vendorUser = await prisma.user.upsert({
    where: { email: 'admin@antiqueoud.com' },
    update: {},
    create: {
      email: 'admin@antiqueoud.com',
      password: hashedPassword,
      firstName: 'Antique',
      lastName: 'Oud',
      role: UserRole.VENDOR,
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ Created vendor user:', vendorUser.email);

  await prisma.wallet.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      balance: 1000,
      lifetimeEarned: 1000,
      lifetimeSpent: 0,
    },
  });

  // Vendor Profile - ANTIQUE OUD
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {
      status: VendorStatus.APPROVED,
      verifiedAt: new Date(),
    },
    create: {
      userId: vendorUser.id,
      businessName: 'Antique Oud',
      businessNameAr: 'أنتيك العود',
      businessEmail: 'contact@antiqueoud.com',
      businessPhone: '+971-XX-XXXXXXX',
      description: 'Premium Traditional Arabic Oud - Finest quality oud products inspired by rich Arab heritage',
      descriptionAr: 'أنتيك العود - أرقى أنواع العود العربي الأصيل، المستوحى من تراثنا العريق وحضارتنا الأصيلة',
      slug: 'antique-oud',
      tradeLicense: 'AO-2025-001',
      taxNumber: 'TAX-AO-UAE-2025',
      whatsappEnabled: true,
      whatsappNumber: '+971-XX-XXXXXXX',
      logo: '/images/antique-oud-logo.svg',
      website: 'https://antiqueoud.com',
      instagramUrl: 'https://instagram.com/antiqueoud',
      facebookUrl: 'https://facebook.com/antiqueoud',
      status: VendorStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created default vendor profile: Antique Oud');
  console.log('   Vendor ID:', vendor.id);
  console.log('   Business Name:', vendor.businessName);
  console.log('   Status:', vendor.status);

  console.log('\n' + '='.repeat(70));
  console.log('⚠️  IMPORTANT: Add this to your .env file');
  console.log('='.repeat(70));
  console.log(`DEFAULT_VENDOR_ID=${vendor.id}`);
  console.log('='.repeat(70));
  console.log('\n');

  // ====================================
  // CURRENCY RATES - GCC Countries
  // ====================================
  console.log('💱 Creating currency rates...');

  const currencies = [
    {
      code: 'AED',
      name: 'UAE Dirham',
      nameAr: 'درهم إماراتي',
      symbol: 'د.إ',
      rate: 1.0,
      decimalPlaces: 2,
      isActive: true,
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      nameAr: 'ريال سعودي',
      symbol: '﷼',
      rate: 1.02,
      decimalPlaces: 2,
      isActive: true,
    },
    {
      code: 'KWD',
      name: 'Kuwaiti Dinar',
      nameAr: 'دينار كويتي',
      symbol: 'د.ك',
      rate: 0.083,
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'BHD',
      name: 'Bahraini Dinar',
      nameAr: 'دينار بحريني',
      symbol: 'د.ب',
      rate: 0.103,
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'OMR',
      name: 'Omani Rial',
      nameAr: 'ريال عماني',
      symbol: 'ر.ع',
      rate: 0.105,
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'QAR',
      name: 'Qatari Riyal',
      nameAr: 'ريال قطري',
      symbol: 'ر.ق',
      rate: 0.99,
      decimalPlaces: 2,
      isActive: true,
    },
  ];

  for (const currency of currencies) {
    await prisma.currencyRate.upsert({
      where: { code: currency.code },
      update: {
        rate: currency.rate,
        isActive: currency.isActive,
      },
      create: currency,
    });
  }

  console.log('✅ Created 6 GCC currency rates');
  console.log('   Base Currency: AED (UAE Dirham)');
  console.log('   Supported: SAR, KWD, BHD, OMR, QAR\n');

  // ====================================
  // CATEGORIES - Client's 7 Categories
  // (Limited Edition is created in seed-products.ts)
  // ====================================
  console.log('📁 Creating categories...');

  // Category 1: Oud
  await prisma.category.upsert({
    where: { slug: 'oud' },
    update: {
      name: 'Oud',
      nameAr: 'العود الطبيعي',
      description: 'Premium natural Oud wood chips and agarwood',
      descriptionAr: 'رقائق العود الطبيعي الفاخر وخشب العود',
      image: '/perfume-images/antik-posts9.jpg',
    },
    create: {
      name: 'Oud',
      nameAr: 'العود الطبيعي',
      slug: 'oud',
      description: 'Premium natural Oud wood chips and agarwood',
      descriptionAr: 'رقائق العود الطبيعي الفاخر وخشب العود',
      image: '/perfume-images/antik-posts9.jpg',
      icon: '🪵',
      sortOrder: 1,
      isActive: true,
    },
  });

  // Category 2: Dehnal Oud Mukhallat
  await prisma.category.upsert({
    where: { slug: 'dehnal-oud' },
    update: {
      name: 'Dehnal Oud Mukhallat',
      nameAr: 'دهن العود',
      description: 'Premium Dehnal Oud oils and mukhallat blends',
      descriptionAr: 'دهن العود الفاخر ومخلطات العود',
      image: '/perfume-images/antik-posts11.jpg',
    },
    create: {
      name: 'Dehnal Oud Mukhallat',
      nameAr: 'دهن العود',
      slug: 'dehnal-oud',
      description: 'Premium Dehnal Oud oils and mukhallat blends',
      descriptionAr: 'دهن العود الفاخر ومخلطات العود',
      image: '/perfume-images/antik-posts11.jpg',
      icon: '🧴',
      sortOrder: 2,
      isActive: true,
    },
  });

  // Category 3: Perfumes
  await prisma.category.upsert({
    where: { slug: 'perfumes' },
    update: {
      name: 'Perfumes',
      nameAr: 'عطور',
      description: 'Exclusive perfume blends and musk fragrances',
      descriptionAr: 'مخلطات العطور الحصرية وعطور المسك',
      image: '/perfume-images/antik-posts6.jpg',
    },
    create: {
      name: 'Perfumes',
      nameAr: 'عطور',
      slug: 'perfumes',
      description: 'Exclusive perfume blends and musk fragrances',
      descriptionAr: 'مخلطات العطور الحصرية وعطور المسك',
      image: '/perfume-images/antik-posts6.jpg',
      icon: '🌸',
      sortOrder: 3,
      isActive: true,
    },
  });

  // Category 4: All Over Spray & Room Fresheners (merged with Air Freshener)
  await prisma.category.upsert({
    where: { slug: 'all-over-spray' },
    update: {
      name: 'All Over Spray & Room Fresheners',
      nameAr: 'بخاخ الجسم ومعطرات الغرف',
      description: 'Refreshing body sprays and room fresheners for everyday use',
      descriptionAr: 'بخاخات الجسم ومعطرات الغرف المنعشة للاستخدام اليومي',
    },
    create: {
      name: 'All Over Spray & Room Fresheners',
      nameAr: 'بخاخ الجسم ومعطرات الغرف',
      slug: 'all-over-spray',
      description: 'Refreshing body sprays and room fresheners for everyday use',
      descriptionAr: 'بخاخات الجسم ومعطرات الغرف المنعشة للاستخدام اليومي',
      image: '/perfume-images/antik-posts7.jpg',
      icon: '💦',
      sortOrder: 4,
      isActive: true,
    },
  });

  // Category 5: Air Freshener (HIDDEN - merged into All Over Spray & Room Fresheners)
  await prisma.category.upsert({
    where: { slug: 'air-freshener' },
    update: {
      isActive: false, // Hidden - merged with All Over Spray
    },
    create: {
      name: 'Air Freshener',
      nameAr: 'معطر الجو',
      slug: 'air-freshener',
      description: 'Premium air fresheners and home fragrances',
      descriptionAr: 'معطرات الجو الفاخرة وعطور المنزل',
      image: '/perfume-images/antik-posts8.jpg',
      icon: '🏠',
      sortOrder: 5,
      isActive: false, // Hidden - merged with All Over Spray
    },
  });

  // Category 6: Dakhoon & Oud Muattar (HIDDEN for now)
  await prisma.category.upsert({
    where: { slug: 'dakhoon-oud-muattar' },
    update: {
      isActive: false, // Hidden as requested
    },
    create: {
      name: 'Dakhoon & Oud Muattar',
      nameAr: 'العود المعطر و الدخون',
      slug: 'dakhoon-oud-muattar',
      description: 'Traditional dakhoon incense and scented oud',
      descriptionAr: 'الدخون التقليدي والعود المعطر',
      image: '/perfume-images/antik-posts10.jpg',
      icon: '🔥',
      sortOrder: 6,
      isActive: false, // Hidden as requested
    },
  });

  // Category 7: Accessories (NEW)
  await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {
      isActive: true,
    },
    create: {
      name: 'Accessories',
      nameAr: 'الإكسسوارات',
      slug: 'accessories',
      description: 'Perfume accessories and related items',
      descriptionAr: 'إكسسوارات العطور والمنتجات ذات الصلة',
      image: '/perfume-images/antik-posts12.jpg',
      icon: '🎁',
      sortOrder: 7,
      isActive: true,
    },
  });

  // Note: Limited Edition (sortOrder: 8) is created in seed-products.ts

  console.log('✅ Created 7 categories (Limited Edition in seed-products.ts)\n');

  // ====================================
  // PRODUCTS & BRANDS
  // All products and the Antique Oud brand are created in seed-products.ts
  // ====================================
  console.log('📦 Products and brands will be created in seed-products.ts\n');

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 6 GCC Currency Rates (AED, SAR, KWD, BHD, OMR, QAR)');
  console.log('  - 7 Categories (oud, dehnal-oud, perfumes, all-over-spray, accessories, + 2 hidden)');
  console.log('  - 2 Users (admin, vendor) with wallets');
  console.log('  - 1 Vendor profile (Antique Oud)');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin: admin@aromasouq.ae / Admin123!');
  console.log('  Vendor: admin@antiqueoud.com / Admin123!');
  console.log('\n📌 Next step: Run seed-products.ts to add products');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
