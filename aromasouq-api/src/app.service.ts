import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Pre-warm cache on server startup
  async onModuleInit() {
    console.log('🔥 Pre-warming cache on startup...');
    try {
      await this.warmCache();
      console.log('✅ Cache warmed successfully');
    } catch (error) {
      console.error('⚠️ Cache warming failed:', error.message);
    }
  }

  getHello(): string {
    return 'AromaSouq API is running!';
  }

  // Health check endpoint
  async healthCheck() {
    const dbHealthy = await this.checkDatabase();
    return {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealthy ? 'connected' : 'error',
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Warm cache with frequently accessed data
  async warmCache() {
    const startTime = Date.now();

    // Fetch all data in parallel
    const [categories, brands, featured, flashSale] = await Promise.all([
      this.getCategories(),
      this.getBrands(),
      this.getFeaturedProducts(),
      this.getFlashSaleProducts(),
    ]);

    // Cache the results
    await Promise.all([
      this.cacheManager.set('all-categories', categories, 3600000), // 1 hour
      this.cacheManager.set('all-brands', brands, 3600000),
      this.cacheManager.set('featured-products', featured, 1800000), // 30 min
      this.cacheManager.set('flash-sale-products', flashSale, 300000), // 5 min
      this.cacheManager.set('homepage-data', { categories, brands, featured, flashSale }, 300000),
    ]);

    console.log(`Cache warmed in ${Date.now() - startTime}ms`);
    return { message: 'Cache warmed', duration: `${Date.now() - startTime}ms` };
  }

  // Combined homepage data - single API call for all homepage data
  async getHomepageData() {
    // Try cache first
    const cached = await this.cacheManager.get('homepage-data');
    if (cached) {
      return cached;
    }

    // Fetch all data in parallel
    const [categories, brands, featured, flashSale, oudProducts, brandProducts] = await Promise.all([
      this.getCategories(),
      this.getBrands(),
      this.getFeaturedProducts(),
      this.getFlashSaleProducts(),
      this.getProductsByCategory('oud', 8),
      this.getProductsByBrand('antique-oud', 10),
    ]);

    const result = {
      categories,
      brands,
      featured,
      flashSale,
      oudProducts,
      brandProducts,
    };

    // Cache for 5 minutes
    await this.cacheManager.set('homepage-data', result, 300000);

    return result;
  }

  // Helper methods for data fetching
  private async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async getBrands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private async getFeaturedProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      select: this.getProductSelectFields(),
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getFlashSaleProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true, isOnSale: true },
      select: this.getProductSelectFields(),
      take: 10,
      orderBy: { discountPercent: 'desc' },
    });
  }

  private async getProductsByCategory(categorySlug: string, limit: number) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) return [];

    return this.prisma.product.findMany({
      where: { isActive: true, categoryId: category.id },
      select: this.getProductSelectFields(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getProductsByBrand(brandSlug: string, limit: number) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug: brandSlug },
    });

    if (!brand) return [];

    return this.prisma.product.findMany({
      where: { isActive: true, brandId: brand.id },
      select: this.getProductSelectFields(),
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  private getProductSelectFields() {
    return {
      id: true,
      name: true,
      nameAr: true,
      slug: true,
      price: true,
      salePrice: true,
      compareAtPrice: true,
      images: true,
      stock: true,
      isActive: true,
      isFeatured: true,
      isOnSale: true,
      discountPercent: true,
      averageRating: true,
      reviewCount: true,
      gender: true,
      concentration: true,
      category: {
        select: { id: true, name: true, nameAr: true, slug: true },
      },
      brand: {
        select: { id: true, name: true, nameAr: true, slug: true, logo: true },
      },
    };
  }
}
