import { PrismaClient, UserRole, VendorStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding (WITHOUT PRODUCTS)...\n');

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
  // ====================================
  console.log('🏪 Creating default vendor (Antique Oud)...\n');

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

  // ====================================
  // CURRENCY RATES - GCC Countries
  // ====================================
  console.log('💱 Creating currency rates...');

  const currencies = [
    { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', rate: 1.0, decimalPlaces: 2, isActive: true },
    { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: '﷼', rate: 1.02, decimalPlaces: 2, isActive: true },
    { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', rate: 0.083, decimalPlaces: 3, isActive: true },
    { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', rate: 0.103, decimalPlaces: 3, isActive: true },
    { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', rate: 0.105, decimalPlaces: 3, isActive: true },
    { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', rate: 0.99, decimalPlaces: 2, isActive: true },
  ];

  for (const currency of currencies) {
    await prisma.currencyRate.upsert({
      where: { code: currency.code },
      update: { rate: currency.rate, isActive: currency.isActive },
      create: currency,
    });
  }
  console.log('✅ Created 6 GCC currency rates\n');

  // ====================================
  // CATEGORIES
  // ====================================
  console.log('📁 Creating categories...');

  const categories = [
    { name: 'Perfumes', nameAr: 'عطور', slug: 'perfumes', description: 'Discover our exclusive collection of premium perfumes', descriptionAr: 'اكتشف مجموعتنا الحصرية من العطور الفاخرة', icon: '🌸', sortOrder: 1 },
    { name: 'Oud', nameAr: 'عود', slug: 'oud', description: 'Authentic Oud fragrances from the Middle East', descriptionAr: 'عطور عود أصلية من الشرق الأوسط', icon: '🪵', sortOrder: 2 },
    { name: 'Attars', nameAr: 'عطور زيتية', slug: 'attars', description: 'Traditional oil-based perfumes', descriptionAr: 'عطور تقليدية أساسها الزيت', icon: '💧', sortOrder: 3 },
    { name: 'Bakhoor', nameAr: 'بخور', slug: 'bakhoor', description: 'Premium incense and bakhoor', descriptionAr: 'بخور ممتاز', icon: '🔥', sortOrder: 4 },
    { name: 'Home Fragrance', nameAr: 'معطرات منزلية', slug: 'home-fragrance', description: 'Luxury home fragrances and diffusers', descriptionAr: 'معطرات منزلية فاخرة', icon: '🏠', sortOrder: 5 },
    { name: 'Gift Sets', nameAr: 'مجموعات هدايا', slug: 'gift-sets', description: 'Curated fragrance gift sets', descriptionAr: 'مجموعات هدايا العطور المنسقة', icon: '🎁', sortOrder: 6 },
    { name: 'Body Mist', nameAr: 'رذاذ الجسم', slug: 'body-mist', description: 'Light and refreshing body mists', descriptionAr: 'رذاذ الجسم الخفيف والمنعش', icon: '💨', sortOrder: 7 },
    { name: 'Body Spray', nameAr: 'بخاخ الجسم', slug: 'body-spray', description: 'Refreshing body sprays for everyday use', descriptionAr: 'بخاخات الجسم المنعشة للاستخدام اليومي', icon: '💦', sortOrder: 8 },
    { name: 'Dehnal Oud', nameAr: 'دهن العود', slug: 'dehnal-oud', description: 'Premium Dehnal Oud oil-based fragrances', descriptionAr: 'عطور دهن العود الفاخرة الزيتية', icon: '🧴', sortOrder: 9 },
    { name: 'Our Brand', nameAr: 'علامتنا التجارية', slug: 'our-brand', description: 'Exclusive AromaSouq branded fragrances', descriptionAr: 'عطور حصرية من علامة أروماسوق التجارية', icon: '⭐', sortOrder: 10 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log('✅ Created 10 categories\n');

  // ====================================
  // BRANDS
  // ====================================
  console.log('🏷️  Creating brands...');

  const brands = [
    { name: 'Dior', nameAr: 'ديور', slug: 'dior', description: 'Luxury French fashion house founded in 1946', descriptionAr: 'دار أزياء فرنسية فاخرة تأسست عام 1946', logo: 'https://logo.clearbit.com/dior.com' },
    { name: 'Chanel', nameAr: 'شانيل', slug: 'chanel', description: 'Iconic French luxury brand', descriptionAr: 'علامة تجارية فرنسية فاخرة مميزة', logo: 'https://logo.clearbit.com/chanel.com' },
    { name: 'Tom Ford', nameAr: 'توم فورد', slug: 'tom-ford', description: 'American luxury fashion brand', descriptionAr: 'علامة تجارية أمريكية فاخرة', logo: 'https://logo.clearbit.com/tomford.com' },
    { name: 'Versace', nameAr: 'فيرساتشي', slug: 'versace', description: 'Italian luxury fashion company', descriptionAr: 'شركة أزياء إيطالية فاخرة', logo: 'https://logo.clearbit.com/versace.com' },
    { name: 'Ajmal', nameAr: 'أجمل', slug: 'ajmal', description: 'Leading Middle Eastern fragrance house', descriptionAr: 'دار عطور شرق أوسطية رائدة', logo: 'https://logo.clearbit.com/ajmalperfume.com' },
    { name: 'AromaSouq', nameAr: 'أروماسوق', slug: 'aromasouq', description: 'Our exclusive brand', descriptionAr: 'علامتنا التجارية الحصرية', logo: 'https://logo.clearbit.com/aromasouq.ae' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, isActive: true },
    });
  }
  console.log('✅ Created 6 brands\n');

  // ====================================
  // NO PRODUCTS
  // ====================================
  console.log('⏭️  Skipping products (as requested)\n');

  // ====================================
  // SUMMARY
  // ====================================
  console.log('='.repeat(70));
  console.log('⚠️  IMPORTANT: Add this to your .env file:');
  console.log('='.repeat(70));
  console.log(`DEFAULT_VENDOR_ID=${vendor.id}`);
  console.log('='.repeat(70));

  console.log('\n🎉 Database seeding completed!\n');
  console.log('📊 Summary:');
  console.log('  - 2 Users (admin + vendor) with wallets');
  console.log('  - 1 Vendor (Antique Oud)');
  console.log('  - 6 Currency rates (AED, SAR, KWD, BHD, OMR, QAR)');
  console.log('  - 10 Categories');
  console.log('  - 6 Brands');
  console.log('  - 0 Products (skipped)');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin: admin@aromasouq.ae / Admin123!');
  console.log('  Vendor: admin@antiqueoud.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
