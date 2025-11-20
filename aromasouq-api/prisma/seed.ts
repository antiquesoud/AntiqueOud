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
      role: UserRole.VENDOR, // Vendor role to access vendor dashboard
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

      // Business Information
      businessName: 'Antique Oud',
      businessNameAr: 'أنتيك العود',
      businessEmail: 'contact@antiqueoud.com',
      businessPhone: '+971-XX-XXXXXXX',

      // Description
      description: 'Premium Traditional Arabic Oud - Finest quality oud products inspired by rich Arab heritage',
      descriptionAr: 'أنتيك العود - أرقى أنواع العود العربي الأصيل، المستوحى من تراثنا العريق وحضارتنا الأصيلة',

      // Slug
      slug: 'antique-oud',

      // Legal Information (Update with real details)
      tradeLicense: 'AO-2025-001',
      taxNumber: 'TAX-AO-UAE-2025',

      // Contact
      whatsappEnabled: true,
      whatsappNumber: '+971-XX-XXXXXXX',

      // Branding
      logo: '/images/antique-oud-logo.svg',

      // Social Media
      website: 'https://antiqueoud.com',
      instagramUrl: 'https://instagram.com/antiqueoud',
      facebookUrl: 'https://facebook.com/antiqueoud',

      // Status
      status: VendorStatus.APPROVED,
      verifiedAt: new Date(),
    },
  });

  console.log('✅ Created default vendor profile: Antique Oud');
  console.log('   Vendor ID:', vendor.id);
  console.log('   Business Name:', vendor.businessName);
  console.log('   Status:', vendor.status);

  // Output for .env configuration
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
      rate: 1.0, // Base currency
      decimalPlaces: 2,
      isActive: true,
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      nameAr: 'ريال سعودي',
      symbol: '﷼',
      rate: 1.02, // 1 AED = 1.02 SAR (approximate fixed rate)
      decimalPlaces: 2,
      isActive: true,
    },
    {
      code: 'KWD',
      name: 'Kuwaiti Dinar',
      nameAr: 'دينار كويتي',
      symbol: 'د.ك',
      rate: 0.083, // 1 AED = 0.083 KWD (KWD is the highest valued currency)
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'BHD',
      name: 'Bahraini Dinar',
      nameAr: 'دينار بحريني',
      symbol: 'د.ب',
      rate: 0.103, // 1 AED = 0.103 BHD
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'OMR',
      name: 'Omani Rial',
      nameAr: 'ريال عماني',
      symbol: 'ر.ع',
      rate: 0.105, // 1 AED = 0.105 OMR
      decimalPlaces: 3,
      isActive: true,
    },
    {
      code: 'QAR',
      name: 'Qatari Riyal',
      nameAr: 'ريال قطري',
      symbol: 'ر.ق',
      rate: 0.99, // 1 AED = 0.99 QAR (approximately 1:1)
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
  // CATEGORIES - New Structure
  // ====================================
  console.log('📁 Creating categories...');

  const perfumesCategory = await prisma.category.upsert({
    where: { slug: 'perfumes' },
    update: {},
    create: {
      name: 'Perfumes',
      nameAr: 'عطور',
      slug: 'perfumes',
      description: 'Discover our exclusive collection of premium perfumes',
      descriptionAr: 'اكتشف مجموعتنا الحصرية من العطور الفاخرة',
      icon: '🌸',
      sortOrder: 1,
      isActive: true,
    },
  });

  const oudCategory = await prisma.category.upsert({
    where: { slug: 'oud' },
    update: {},
    create: {
      name: 'Oud',
      nameAr: 'عود',
      slug: 'oud',
      description: 'Authentic Oud fragrances from the Middle East',
      descriptionAr: 'عطور عود أصلية من الشرق الأوسط',
      icon: '🪵',
      sortOrder: 2,
      isActive: true,
    },
  });

  const attarsCategory = await prisma.category.upsert({
    where: { slug: 'attars' },
    update: {},
    create: {
      name: 'Attars',
      nameAr: 'عطور زيتية',
      slug: 'attars',
      description: 'Traditional oil-based perfumes',
      descriptionAr: 'عطور تقليدية أساسها الزيت',
      icon: '💧',
      sortOrder: 3,
      isActive: true,
    },
  });

  const bakhoorCategory = await prisma.category.upsert({
    where: { slug: 'bakhoor' },
    update: {},
    create: {
      name: 'Bakhoor',
      nameAr: 'بخور',
      slug: 'bakhoor',
      description: 'Premium incense and bakhoor',
      descriptionAr: 'بخور ممتاز',
      icon: '🔥',
      sortOrder: 4,
      isActive: true,
    },
  });

  const homeFragranceCategory = await prisma.category.upsert({
    where: { slug: 'home-fragrance' },
    update: {},
    create: {
      name: 'Home Fragrance',
      nameAr: 'معطرات منزلية',
      slug: 'home-fragrance',
      description: 'Luxury home fragrances and diffusers',
      descriptionAr: 'معطرات منزلية فاخرة',
      icon: '🏠',
      sortOrder: 5,
      isActive: true,
    },
  });

  const giftSetsCategory = await prisma.category.upsert({
    where: { slug: 'gift-sets' },
    update: {},
    create: {
      name: 'Gift Sets',
      nameAr: 'مجموعات هدايا',
      slug: 'gift-sets',
      description: 'Curated fragrance gift sets',
      descriptionAr: 'مجموعات هدايا العطور المنسقة',
      icon: '🎁',
      sortOrder: 6,
      isActive: true,
    },
  });

  const bodyMistCategory = await prisma.category.upsert({
    where: { slug: 'body-mist' },
    update: {},
    create: {
      name: 'Body Mist',
      nameAr: 'رذاذ الجسم',
      slug: 'body-mist',
      description: 'Light and refreshing body mists',
      descriptionAr: 'رذاذ الجسم الخفيف والمنعش',
      icon: '💨',
      sortOrder: 7,
      isActive: true,
    },
  });

  const bodySprayCategory = await prisma.category.upsert({
    where: { slug: 'body-spray' },
    update: {},
    create: {
      name: 'Body Spray',
      nameAr: 'بخاخ الجسم',
      slug: 'body-spray',
      description: 'Refreshing body sprays for everyday use',
      descriptionAr: 'بخاخات الجسم المنعشة للاستخدام اليومي',
      icon: '💦',
      sortOrder: 8,
      isActive: true,
    },
  });

  const dehnalOudCategory = await prisma.category.upsert({
    where: { slug: 'dehnal-oud' },
    update: {},
    create: {
      name: 'Dehnal Oud',
      nameAr: 'دهن العود',
      slug: 'dehnal-oud',
      description: 'Premium Dehnal Oud oil-based fragrances',
      descriptionAr: 'عطور دهن العود الفاخرة الزيتية',
      icon: '🧴',
      sortOrder: 9,
      isActive: true,
    },
  });

  const ourBrandCategory = await prisma.category.upsert({
    where: { slug: 'our-brand' },
    update: {},
    create: {
      name: 'Our Brand',
      nameAr: 'علامتنا التجارية',
      slug: 'our-brand',
      description: 'Exclusive AromaSouq branded fragrances',
      descriptionAr: 'عطور حصرية من علامة أروماسوق التجارية',
      icon: '⭐',
      sortOrder: 10,
      isActive: true,
    },
  });

  console.log('✅ Created 10 categories\n');

  // ====================================
  // BRANDS
  // ====================================
  console.log('🏷️  Creating brands...');

  const dior = await prisma.brand.upsert({
    where: { slug: 'dior' },
    update: {},
    create: {
      name: 'Dior',
      nameAr: 'ديور',
      slug: 'dior',
      description: 'Luxury French fashion house founded in 1946',
      descriptionAr: 'دار أزياء فرنسية فاخرة تأسست عام 1946',
      logo: 'https://logo.clearbit.com/dior.com',
      isActive: true,
    },
  });

  const chanel = await prisma.brand.upsert({
    where: { slug: 'chanel' },
    update: {},
    create: {
      name: 'Chanel',
      nameAr: 'شانيل',
      slug: 'chanel',
      description: 'Iconic French luxury brand',
      descriptionAr: 'علامة تجارية فرنسية فاخرة مميزة',
      logo: 'https://logo.clearbit.com/chanel.com',
      isActive: true,
    },
  });

  const tomFord = await prisma.brand.upsert({
    where: { slug: 'tom-ford' },
    update: {},
    create: {
      name: 'Tom Ford',
      nameAr: 'توم فورد',
      slug: 'tom-ford',
      description: 'American luxury fashion brand',
      descriptionAr: 'علامة تجارية أمريكية فاخرة',
      logo: 'https://logo.clearbit.com/tomford.com',
      isActive: true,
    },
  });

  const versace = await prisma.brand.upsert({
    where: { slug: 'versace' },
    update: {},
    create: {
      name: 'Versace',
      nameAr: 'فيرساتشي',
      slug: 'versace',
      description: 'Italian luxury fashion company',
      descriptionAr: 'شركة أزياء إيطالية فاخرة',
      logo: 'https://logo.clearbit.com/versace.com',
      isActive: true,
    },
  });

  const ajmalBrand = await prisma.brand.upsert({
    where: { slug: 'ajmal' },
    update: {},
    create: {
      name: 'Ajmal',
      nameAr: 'أجمل',
      slug: 'ajmal',
      description: 'Leading Middle Eastern fragrance house',
      descriptionAr: 'دار عطور شرق أوسطية رائدة',
      logo: 'https://logo.clearbit.com/ajmalperfume.com',
      isActive: true,
    },
  });

  const aromasouqBrand = await prisma.brand.upsert({
    where: { slug: 'aromasouq' },
    update: {},
    create: {
      name: 'AromaSouq',
      nameAr: 'أروماسوق',
      slug: 'aromasouq',
      description: 'Our exclusive brand',
      descriptionAr: 'علامتنا التجارية الحصرية',
      logo: 'https://logo.clearbit.com/aromasouq.ae',
      isActive: true,
    },
  });

  console.log('✅ Created 6 brands\n');

  // ====================================
  // PRODUCTS
  // ====================================
  console.log('🧴 Creating products...');

  const products = [
    // PERFUMES Category - ORIGINAL productType
    {
      name: 'Sauvage Eau de Toilette',
      nameAr: 'سوفاج أو دو تواليت',
      slug: 'dior-sauvage-edt',
      description: 'A radically fresh composition, Sauvage is both raw and noble.',
      descriptionAr: 'تركيبة منعشة بشكل جذري، سوفاج خام ونبيل في آن واحد.',
      price: 450.0,
      compareAtPrice: 550.0,
      cost: 300.0,
      sku: 'DIOR-SAU-100',
      barcode: '3348901419628',
      stock: 50,
      lowStockAlert: 10,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
      categoryId: perfumesCategory.id,
      brandId: dior.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Toilette',
      gender: 'men',
      topNotes: 'Calabrian Bergamot, Pepper',
      heartNotes: 'Sichuan Pepper, Lavender, Pink Pepper, Vetiver',
      baseNotes: 'Ambroxan, Cedar, Labdanum',
      scentFamily: 'woody',
      longevity: '6-8 hours',
      sillage: 'Strong',
      season: 'All Season',
      productType: 'ORIGINAL', // MANDATORY
      region: 'FRANCE',
      occasion: 'OFFICE,DAILY',
      format: 'SPRAY',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 45,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Chanel No. 5 Eau de Parfum',
      nameAr: 'شانيل رقم 5 أو دو بارفان',
      slug: 'chanel-no5-edp',
      description: 'An iconic floral bouquet. The essence of femininity.',
      descriptionAr: 'باقة زهور أيقونية. جوهر الأنوثة.',
      price: 620.0,
      compareAtPrice: 750.0,
      cost: 450.0,
      sku: 'CHAN-NO5-100',
      barcode: '3145891165203',
      stock: 30,
      lowStockAlert: 5,
      images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500'],
      categoryId: perfumesCategory.id,
      brandId: chanel.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Parfum',
      gender: 'women',
      topNotes: 'Aldehydes, Ylang-Ylang, Neroli',
      heartNotes: 'Iris, Jasmine, Rose',
      baseNotes: 'Vanilla, Sandalwood, Vetiver',
      scentFamily: 'floral',
      longevity: '8-10 hours',
      sillage: 'Moderate to Strong',
      season: 'Spring, Fall',
      productType: 'ORIGINAL',
      region: 'FRANCE',
      occasion: 'PARTY,WEDDING',
      collection: 'SIGNATURE',
      format: 'SPRAY',
      priceSegment: 'LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 62,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Tom Ford Black Orchid',
      nameAr: 'توم فورد بلاك أوركيد',
      slug: 'tom-ford-black-orchid',
      description: 'A luxurious and sensual fragrance of rich, dark accords.',
      descriptionAr: 'عطر فاخر وحسي من التوافقات الغنية والداكنة.',
      price: 580.0,
      compareAtPrice: 680.0,
      cost: 420.0,
      sku: 'TF-BO-100',
      barcode: '888066652865',
      stock: 25,
      lowStockAlert: 8,
      images: ['https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=500'],
      categoryId: perfumesCategory.id,
      brandId: tomFord.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Parfum',
      gender: 'unisex',
      topNotes: 'Truffle, Gardenia, Black Currant',
      heartNotes: 'Orchid, Spices, Lotus',
      baseNotes: 'Mexican chocolate, Patchouli, Vanilla',
      scentFamily: 'oriental',
      longevity: '10-12 hours',
      sillage: 'Very Strong',
      season: 'Fall, Winter',
      productType: 'NICHE',
      region: 'USA',
      occasion: 'PARTY,WEDDING',
      collection: 'EXCLUSIVE',
      format: 'SPRAY',
      priceSegment: 'ULTRA_LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 58,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Versace Eros',
      nameAr: 'فيرساتشي إيروس',
      slug: 'versace-eros-edt',
      description: 'A fragrance that interprets sublime masculinity.',
      descriptionAr: 'عطر يفسر الذكورة السامية.',
      price: 380.0,
      compareAtPrice: 450.0,
      cost: 250.0,
      sku: 'VERS-EROS-100',
      barcode: '8011003823772',
      stock: 40,
      lowStockAlert: 10,
      images: ['https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500'],
      categoryId: perfumesCategory.id,
      brandId: versace.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Toilette',
      gender: 'men',
      topNotes: 'Mint, Green Apple, Lemon',
      heartNotes: 'Tonka Bean, Ambroxan, Geranium',
      baseNotes: 'Madagascar Vanilla, Virginian Cedar',
      scentFamily: 'fresh',
      longevity: '6-8 hours',
      sillage: 'Strong',
      season: 'Spring, Summer',
      productType: 'ORIGINAL',
      region: 'ITALY',
      occasion: 'DAILY,PARTY',
      format: 'SPRAY',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 38,
      isActive: true,
      isFeatured: false,
    },

    // PERFUMES - CLONE productType
    {
      name: 'Savage Intense Clone',
      nameAr: 'سافاج إنتنس مقلد',
      slug: 'savage-intense-clone',
      description: 'Inspired by the iconic Sauvage, offering similar woody notes.',
      descriptionAr: 'مستوحى من سوفاج الشهير، يقدم نوتات خشبية مماثلة.',
      price: 120.0,
      compareAtPrice: 180.0,
      cost: 70.0,
      sku: 'CLONE-SAV-100',
      stock: 80,
      lowStockAlert: 20,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'],
      categoryId: perfumesCategory.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Parfum',
      gender: 'men',
      scentFamily: 'woody',
      longevity: '5-6 hours',
      sillage: 'Moderate',
      season: 'All Season',
      productType: 'CLONE',
      occasion: 'DAILY,OFFICE',
      format: 'SPRAY',
      priceSegment: 'BUDGET',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 12,
      isActive: true,
      isFeatured: false,
    },

    // OUD Category - Multiple oudType values
    {
      name: 'Royal Cambodian Oud',
      nameAr: 'عود كمبودي ملكي',
      slug: 'royal-cambodian-oud',
      description: 'Premium Cambodian oud with rich, complex notes.',
      descriptionAr: 'عود كمبودي فاخر مع نوتات غنية ومعقدة.',
      price: 850.0,
      compareAtPrice: 1000.0,
      cost: 600.0,
      sku: 'OUD-CAMB-12',
      stock: 15,
      lowStockAlert: 5,
      images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500'],
      categoryId: oudCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '12ml',
      concentration: 'Pure Oil',
      gender: 'unisex',
      scentFamily: 'woody',
      longevity: '12-24 hours',
      sillage: 'Very Strong',
      season: 'Fall, Winter',
      productType: 'NICHE',
      region: 'UAE',
      oudType: 'CAMBODIAN',
      occasion: 'WEDDING,RAMADAN,EID',
      collection: 'OUD_ROYALE',
      format: 'OIL',
      priceSegment: 'ULTRA_LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 85,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Indian Oud Blend',
      nameAr: 'مزيج العود الهندي',
      slug: 'indian-oud-blend',
      description: 'Authentic Indian oud with smooth, deep aroma.',
      descriptionAr: 'عود هندي أصيل برائحة ناعمة وعميقة.',
      price: 650.0,
      compareAtPrice: 800.0,
      cost: 450.0,
      sku: 'OUD-IND-12',
      stock: 20,
      lowStockAlert: 5,
      images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500'],
      categoryId: oudCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '12ml',
      concentration: 'Pure Oil',
      gender: 'unisex',
      scentFamily: 'woody',
      longevity: '10-20 hours',
      sillage: 'Strong',
      season: 'All Season',
      productType: 'NICHE',
      region: 'INDIA',
      oudType: 'INDIAN',
      occasion: 'RAMADAN,EID,WEDDING',
      format: 'OIL',
      priceSegment: 'LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 65,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Thai Oud Dehn Al Oud',
      nameAr: 'دهن العود التايلندي',
      slug: 'thai-oud-dehn',
      description: 'Traditional Thai oud in dehn al oud format.',
      descriptionAr: 'عود تايلندي تقليدي بصيغة دهن العود.',
      price: 720.0,
      compareAtPrice: 900.0,
      cost: 500.0,
      sku: 'OUD-THAI-12',
      stock: 18,
      lowStockAlert: 5,
      images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500'],
      categoryId: oudCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '12ml',
      concentration: 'Dehn Al Oud',
      gender: 'unisex',
      scentFamily: 'oriental',
      longevity: '15-24 hours',
      sillage: 'Very Strong',
      season: 'Fall, Winter',
      productType: 'NICHE',
      region: 'THAILAND',
      oudType: 'THAI',
      occasion: 'WEDDING,EID',
      collection: 'OUD_ROYALE',
      format: 'OIL',
      priceSegment: 'ULTRA_LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 72,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Mukhallat Oud Special',
      nameAr: 'مخلط العود الخاص',
      slug: 'mukhallat-oud-special',
      description: 'A special blend of multiple oud varieties.',
      descriptionAr: 'مزيج خاص من أنواع عود متعددة.',
      price: 780.0,
      compareAtPrice: 950.0,
      cost: 550.0,
      sku: 'OUD-MUK-12',
      stock: 12,
      lowStockAlert: 3,
      images: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500'],
      categoryId: oudCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '12ml',
      concentration: 'Pure Oil',
      gender: 'unisex',
      scentFamily: 'oriental',
      longevity: '12-24 hours',
      sillage: 'Very Strong',
      season: 'All Season',
      productType: 'NICHE',
      region: 'UAE',
      oudType: 'MUKHALLAT',
      occasion: 'RAMADAN,EID,WEDDING',
      collection: 'SIGNATURE',
      format: 'OIL',
      priceSegment: 'ULTRA_LUXURY',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 78,
      isActive: true,
      isFeatured: false,
    },

    // ATTARS Category - ATTAR productType
    {
      name: 'Rose Attar',
      nameAr: 'عطر الورد',
      slug: 'rose-attar',
      description: 'Pure rose attar oil, traditional and elegant.',
      descriptionAr: 'زيت عطر الورد النقي، تقليدي وأنيق.',
      price: 180.0,
      compareAtPrice: 250.0,
      cost: 120.0,
      sku: 'ATT-ROSE-6',
      stock: 50,
      lowStockAlert: 15,
      images: ['https://images.unsplash.com/photo-1587556930857-3f0a7fa70e67?w=500'],
      categoryId: attarsCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '6ml',
      concentration: 'Pure Attar',
      gender: 'women',
      scentFamily: 'floral',
      longevity: '8-12 hours',
      sillage: 'Moderate',
      season: 'Spring, Summer',
      productType: 'ATTAR',
      region: 'INDIA',
      occasion: 'DAILY,WEDDING',
      format: 'OIL',
      priceSegment: 'MID',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 18,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Musk Attar',
      nameAr: 'عطر المسك',
      slug: 'musk-attar',
      description: 'Classic musk attar with long-lasting scent.',
      descriptionAr: 'عطر المسك الكلاسيكي مع رائحة طويلة الأمد.',
      price: 160.0,
      compareAtPrice: 220.0,
      cost: 100.0,
      sku: 'ATT-MUSK-6',
      stock: 60,
      lowStockAlert: 20,
      images: ['https://images.unsplash.com/photo-1587556930857-3f0a7fa70e67?w=500'],
      categoryId: attarsCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '6ml',
      concentration: 'Pure Attar',
      gender: 'unisex',
      scentFamily: 'musky',
      longevity: '10-14 hours',
      sillage: 'Moderate',
      season: 'All Season',
      productType: 'ATTAR',
      region: 'SAUDI',
      occasion: 'DAILY,RAMADAN',
      format: 'OIL',
      priceSegment: 'MID',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 16,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Sandalwood Attar',
      nameAr: 'عطر خشب الصندل',
      slug: 'sandalwood-attar',
      description: 'Pure sandalwood attar, warm and woody.',
      descriptionAr: 'عطر خشب الصندل النقي، دافئ وخشبي.',
      price: 200.0,
      compareAtPrice: 280.0,
      cost: 140.0,
      sku: 'ATT-SAND-6',
      stock: 45,
      lowStockAlert: 15,
      images: ['https://images.unsplash.com/photo-1587556930857-3f0a7fa70e67?w=500'],
      categoryId: attarsCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '6ml',
      concentration: 'Pure Attar',
      gender: 'men',
      scentFamily: 'woody',
      longevity: '8-10 hours',
      sillage: 'Moderate',
      season: 'Fall, Winter',
      productType: 'ATTAR',
      region: 'INDIA',
      occasion: 'OFFICE,DAILY',
      format: 'OIL',
      priceSegment: 'MID',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 20,
      isActive: true,
      isFeatured: false,
    },

    // BAKHOOR Category - BAKHOOR productType
    {
      name: 'Premium Bakhoor Al Sheikha',
      nameAr: 'بخور الشيخة الفاخر',
      slug: 'bakhoor-al-sheikha',
      description: 'Premium incense blend with oud and amber.',
      descriptionAr: 'مزيج بخور فاخر مع العود والعنبر.',
      price: 95.0,
      compareAtPrice: 120.0,
      cost: 60.0,
      sku: 'BAK-SHEIK-250',
      stock: 100,
      lowStockAlert: 30,
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500'],
      categoryId: bakhoorCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '250g',
      gender: 'unisex',
      scentFamily: 'oriental',
      longevity: '4-6 hours',
      sillage: 'Very Strong',
      season: 'All Season',
      productType: 'BAKHOOR',
      region: 'UAE',
      occasion: 'RAMADAN,EID,WEDDING',
      priceSegment: 'MID',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 10,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Oud Bakhoor Chips',
      nameAr: 'رقائق بخور العود',
      slug: 'oud-bakhoor-chips',
      description: 'Natural oud wood chips for traditional burning.',
      descriptionAr: 'رقائق خشب عود طبيعية للحرق التقليدي.',
      price: 150.0,
      compareAtPrice: 200.0,
      cost: 100.0,
      sku: 'BAK-OUD-100',
      stock: 50,
      lowStockAlert: 15,
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500'],
      categoryId: bakhoorCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: '100g',
      gender: 'unisex',
      scentFamily: 'woody',
      longevity: '6-8 hours',
      sillage: 'Very Strong',
      season: 'All Season',
      productType: 'BAKHOOR',
      region: 'UAE',
      occasion: 'RAMADAN,EID',
      collection: 'OUD_ROYALE',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 15,
      isActive: true,
      isFeatured: false,
    },

    // HOME FRAGRANCE Category - HOME_FRAGRANCE productType
    {
      name: 'Luxury Reed Diffuser - Oud & Rose',
      nameAr: 'موزع القصب الفاخر - عود وورد',
      slug: 'reed-diffuser-oud-rose',
      description: 'Elegant reed diffuser with oud and rose fragrance.',
      descriptionAr: 'موزع قصب أنيق برائحة العود والورد.',
      price: 280.0,
      compareAtPrice: 350.0,
      cost: 180.0,
      sku: 'HOME-REED-200',
      stock: 40,
      lowStockAlert: 10,
      images: ['https://images.unsplash.com/photo-1602874801006-c2f98d3e55de?w=500'],
      categoryId: homeFragranceCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '200ml',
      gender: 'unisex',
      scentFamily: 'floral',
      longevity: '60-90 days',
      sillage: 'Moderate',
      season: 'All Season',
      productType: 'HOME_FRAGRANCE',
      region: 'UAE',
      occasion: 'DAILY',
      format: 'OIL',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 28,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Scented Candle - Arabian Nights',
      nameAr: 'شمعة معطرة - ليالي عربية',
      slug: 'candle-arabian-nights',
      description: 'Luxury scented candle with oriental notes.',
      descriptionAr: 'شمعة معطرة فاخرة مع نوتات شرقية.',
      price: 120.0,
      compareAtPrice: 160.0,
      cost: 70.0,
      sku: 'HOME-CAND-300',
      stock: 60,
      lowStockAlert: 20,
      images: ['https://images.unsplash.com/photo-1602874801006-c2f98d3e55de?w=500'],
      categoryId: homeFragranceCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '300g',
      gender: 'unisex',
      scentFamily: 'oriental',
      longevity: '40-50 hours',
      sillage: 'Moderate',
      season: 'All Season',
      productType: 'HOME_FRAGRANCE',
      region: 'UAE',
      occasion: 'DAILY',
      priceSegment: 'MID',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 12,
      isActive: true,
      isFeatured: false,
    },

    // GIFT SETS Category - GIFT_SET productType
    {
      name: 'Luxury Fragrance Discovery Set',
      nameAr: 'مجموعة اكتشاف العطور الفاخرة',
      slug: 'discovery-set-luxury',
      description: 'Curated set of 5 premium fragrance samples.',
      descriptionAr: 'مجموعة منسقة من 5 عينات عطور فاخرة.',
      price: 250.0,
      compareAtPrice: 350.0,
      cost: 150.0,
      sku: 'GIFT-DISC-5',
      stock: 30,
      lowStockAlert: 10,
      images: ['https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=500'],
      categoryId: giftSetsCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '5x10ml',
      gender: 'unisex',
      scentFamily: 'oriental',
      productType: 'GIFT_SET',
      region: 'UAE',
      occasion: 'WEDDING,RAMADAN,EID',
      collection: 'DISCOVERY_BOX',
      format: 'SAMPLE',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 25,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Ramadan Special Gift Set',
      nameAr: 'مجموعة هدايا رمضان الخاصة',
      slug: 'ramadan-gift-set',
      description: 'Perfect gift set for Ramadan with oud and attar.',
      descriptionAr: 'مجموعة هدايا مثالية لرمضان مع عود وعطر.',
      price: 380.0,
      compareAtPrice: 480.0,
      cost: 250.0,
      sku: 'GIFT-RAM-SET',
      stock: 50,
      lowStockAlert: 15,
      images: ['https://images.unsplash.com/photo-1513094735237-8f2714d57c13?w=500'],
      categoryId: giftSetsCategory.id,
      brandId: ajmalBrand.id,
      vendorId: vendor.id,
      size: 'Set',
      gender: 'unisex',
      scentFamily: 'oriental',
      productType: 'GIFT_SET',
      region: 'UAE',
      occasion: 'RAMADAN,EID',
      collection: 'RAMADAN',
      format: 'GIFT_SET',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 38,
      isActive: true,
      isFeatured: true,
    },

    // BODY MIST Category - BODY_SPRAY productType
    {
      name: 'Fresh Citrus Body Mist',
      nameAr: 'رذاذ الجسم بالحمضيات المنعش',
      slug: 'body-mist-citrus',
      description: 'Light and refreshing citrus body mist.',
      descriptionAr: 'رذاذ جسم خفيف ومنعش بالحمضيات.',
      price: 65.0,
      compareAtPrice: 90.0,
      cost: 40.0,
      sku: 'BODY-CIT-200',
      stock: 100,
      lowStockAlert: 30,
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500'],
      categoryId: bodyMistCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '200ml',
      concentration: 'Body Spray',
      gender: 'women',
      scentFamily: 'citrus',
      longevity: '2-3 hours',
      sillage: 'Light',
      season: 'Spring, Summer',
      productType: 'BODY_SPRAY',
      region: 'UAE',
      occasion: 'DAILY',
      format: 'SPRAY',
      priceSegment: 'BUDGET',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 7,
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Cool Aquatic Body Mist',
      nameAr: 'رذاذ الجسم المائي البارد',
      slug: 'body-mist-aquatic',
      description: 'Cool and fresh aquatic body mist for men.',
      descriptionAr: 'رذاذ جسم مائي بارد ومنعش للرجال.',
      price: 70.0,
      compareAtPrice: 95.0,
      cost: 45.0,
      sku: 'BODY-AQU-200',
      stock: 80,
      lowStockAlert: 25,
      images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500'],
      categoryId: bodyMistCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '200ml',
      concentration: 'Body Spray',
      gender: 'men',
      scentFamily: 'aquatic',
      longevity: '2-4 hours',
      sillage: 'Light',
      season: 'Spring, Summer',
      productType: 'BODY_SPRAY',
      region: 'UAE',
      occasion: 'DAILY,OFFICE',
      format: 'SPRAY',
      priceSegment: 'BUDGET',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 7,
      isActive: true,
      isFeatured: false,
    },

    // OUR BRAND Category - OUR_BRAND productType
    {
      name: 'AromaSouq Signature Blend',
      nameAr: 'أروماسوق مزيج التوقيع',
      slug: 'aromasouq-signature',
      description: 'Our exclusive signature fragrance blend.',
      descriptionAr: 'مزيج العطور الحصري الخاص بنا.',
      price: 320.0,
      compareAtPrice: 420.0,
      cost: 200.0,
      sku: 'AS-SIG-100',
      stock: 50,
      lowStockAlert: 15,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
      categoryId: ourBrandCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Parfum',
      gender: 'unisex',
      topNotes: 'Bergamot, Saffron, Cardamom',
      heartNotes: 'Rose, Oud, Jasmine',
      baseNotes: 'Amber, Musk, Sandalwood',
      scentFamily: 'oriental',
      longevity: '8-10 hours',
      sillage: 'Strong',
      season: 'All Season',
      productType: 'OUR_BRAND',
      region: 'UAE',
      occasion: 'PARTY,WEDDING,OFFICE',
      collection: 'SIGNATURE',
      format: 'SPRAY',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 32,
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'AromaSouq Leather Edition',
      nameAr: 'أروماسوق إصدار الجلد',
      slug: 'aromasouq-leather',
      description: 'Bold leather fragrance with woody undertones.',
      descriptionAr: 'عطر جلد جريء مع نغمات خشبية.',
      price: 290.0,
      compareAtPrice: 380.0,
      cost: 180.0,
      sku: 'AS-LEATH-100',
      stock: 40,
      lowStockAlert: 12,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'],
      categoryId: ourBrandCategory.id,
      brandId: aromasouqBrand.id,
      vendorId: vendor.id,
      size: '100ml',
      concentration: 'Eau de Parfum',
      gender: 'men',
      topNotes: 'Leather, Black Pepper',
      heartNotes: 'Cedar, Tobacco',
      baseNotes: 'Vetiver, Patchouli, Amber',
      scentFamily: 'leather',
      longevity: '7-9 hours',
      sillage: 'Moderate to Strong',
      season: 'Fall, Winter',
      productType: 'OUR_BRAND',
      region: 'UAE',
      occasion: 'OFFICE,PARTY',
      collection: 'EXCLUSIVE',
      format: 'SPRAY',
      priceSegment: 'PREMIUM',
      enableWhatsapp: true,
      whatsappNumber: '+971501234567',
      coinsToAward: 29,
      isActive: true,
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product as any,
    });
  }

  console.log(`✅ Created ${products.length} products\n`);

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 6 GCC Currency Rates (AED, SAR, KWD, BHD, OMR, QAR)');
  console.log('  - 10 Categories (perfumes, oud, attars, bakhoor, home-fragrance, gift-sets, body-mist, body-spray, dehnal-oud, our-brand)');
  console.log('  - 6 Brands (Dior, Chanel, Tom Ford, Versace, Ajmal, AromaSouq)');
  console.log(`  - ${products.length} Products (all with mandatory productType)`);
  console.log('  - 2 Users (admin, vendor) with wallets');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin: admin@aromasouq.ae / Admin123!');
  console.log('  Vendor: admin@antiqueoud.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
