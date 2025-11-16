import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { BulkFlashSaleDto, RemoveFlashSaleDto, SetDiscountPercentDto } from './dto/flash-sale.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    categoryId?: string;
    categorySlug?: string;
    brandId?: string;
    vendorId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: string;
    concentration?: string;
    scentFamily?: string;
    season?: string;
    // Phase 3: New classification filters
    productType?: string;
    region?: string;
    occasion?: string;
    oudType?: string;
    collection?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    sortBy?: 'price' | 'createdAt' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      categoryId,
      categorySlug,
      brandId,
      vendorId,
      search,
      minPrice,
      maxPrice,
      gender,
      concentration,
      scentFamily,
      season,
      productType,
      region,
      occasion,
      oudType,
      collection,
      isFeatured,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params || {};

    const where: any = {
      isActive,
    };

    // Support filtering by category ID or slug
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      // Find category by slug first
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (brandId) where.brandId = brandId;
    if (vendorId) where.vendorId = vendorId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (gender) where.gender = gender;
    if (concentration) where.concentration = concentration;
    if (scentFamily) where.scentFamily = scentFamily;
    if (season) where.season = season;

    // Phase 3: New classification filters
    if (productType) where.productType = productType;
    if (oudType) where.oudType = oudType;
    if (collection) where.collection = collection;

    // Special handling for region and occasion (use contains for flexible matching)
    if (region) {
      where.region = { contains: region, mode: 'insensitive' };
    }
    if (occasion) {
      where.occasion = { contains: occasion, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
              logo: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessNameAr: true,
              businessEmail: true,
              businessPhone: true,
            },
          },
          variants: {
            where: { isActive: true },
          },
          videos: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Transform products to match frontend expectations
    const transformedProducts = products.map(product => this.transformProduct(product));

    return {
      data: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            logo: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
        variants: {
          where: { isActive: true },
        },
        videos: true,
        reviews: {
          where: { isPublished: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            reviewImages: true,
            _count: {
              select: { votes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.transformProduct(product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            logo: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
        variants: {
          where: { isActive: true },
        },
        videos: true,
        reviews: {
          where: { isPublished: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            reviewImages: true,
            _count: {
              select: { votes: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.transformProduct(product);
  }

  async create(
    userId: string,
    userRole: UserRole,
    createProductDto: CreateProductDto,
  ) {
    // Check slug uniqueness
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product with slug ${createProductDto.slug} already exists`,
      );
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    // Handle brand: either verify existing brandId or create new brand from customBrandName
    let brandId = createProductDto.brandId;

    if (createProductDto.customBrandName && !brandId) {
      // Create or find brand with custom name
      const slug = createProductDto.customBrandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if brand already exists with this slug
      let brand = await this.prisma.brand.findUnique({
        where: { slug },
      });

      // Create brand if it doesn't exist
      if (!brand) {
        brand = await this.prisma.brand.create({
          data: {
            name: createProductDto.customBrandName,
            slug,
            isActive: true,
          },
        });
      }

      brandId = brand.id;
    } else if (brandId) {
      // Verify brand exists if brandId is provided
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${brandId} not found`,
        );
      }
    }

    // Auto-inject vendorId based on user role
    let vendorId: string;

    if (userRole === UserRole.ADMIN) {
      // Admin can create products for any vendor
      if (!createProductDto.vendorId) {
        throw new BadRequestException(
          'Admin must specify vendorId when creating products',
        );
      }
      vendorId = createProductDto.vendorId;

      // Verify vendor exists
      const vendor = await this.prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        throw new BadRequestException(
          `Vendor with ID ${vendorId} not found`,
        );
      }
    } else {
      // Vendor creates product for themselves
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException(
          'Vendor profile not found. Please create a vendor profile first.',
        );
      }

      if (vendor.status !== 'APPROVED') {
        throw new ForbiddenException(
          `Cannot create products. Vendor status is: ${vendor.status}`,
        );
      }

      vendorId = vendor.id;
    }

    // Remove vendorId and customBrandName from DTO to prevent client manipulation
    const { vendorId: _, customBrandName: __, ...productData } = createProductDto;

    // Auto-activate products for approved vendors
    // Vendors who are APPROVED should have their products active by default
    const isActiveStatus = productData.isActive !== undefined ? productData.isActive : true;

    try {
      return await this.prisma.product.create({
        data: {
          ...productData,
          vendorId, // Use the auto-injected/validated vendorId
          brandId, // Use the resolved brandId (from customBrandName or provided brandId)
          isActive: isActiveStatus, // Set active by default for approved vendors
        },
        include: {
          category: true,
          brand: true,
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessNameAr: true,
              businessEmail: true,
              businessPhone: true,
            },
          },
        },
      });
    } catch (error) {
      // Handle Prisma unique constraint violations
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new BadRequestException(
          `A product with this ${field.toUpperCase()} already exists. Please use a different ${field}.`,
        );
      }
      throw error;
    }
  }

  async update(
    userId: string,
    userRole: UserRole,
    productId: string,
    updateProductDto: UpdateProductDto,
  ) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // OWNERSHIP CHECK - Vendors can only update their own products
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      if (product.vendorId !== vendor.id) {
        throw new ForbiddenException(
          'You can only update your own products',
        );
      }

      // Prevent vendor from changing vendorId
      delete updateProductDto.vendorId;
    }

    // Check slug uniqueness if slug is being updated
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug: updateProductDto.slug },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Product with slug ${updateProductDto.slug} already exists`,
        );
      }
    }

    // Verify category exists if being updated
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    // Verify brand exists if being updated
    if (updateProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateProductDto.brandId },
      });

      if (!brand) {
        throw new BadRequestException(
          `Brand with ID ${updateProductDto.brandId} not found`,
        );
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: updateProductDto,
      include: {
        category: true,
        brand: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
      },
    });
  }

  async remove(userId: string, userRole: UserRole, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // OWNERSHIP CHECK - Vendors can only delete their own products
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      if (product.vendorId !== vendor.id) {
        throw new ForbiddenException(
          'You can only delete your own products',
        );
      }
    }

    // Soft delete by setting isActive to false
    return this.prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }

  async updateStock(
    userId: string,
    userRole: UserRole,
    productId: string,
    quantity: number,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // OWNERSHIP CHECK - Vendors can only update stock for their own products
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      if (product.vendorId !== vendor.id) {
        throw new ForbiddenException(
          'You can only update stock for your own products',
        );
      }
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
  }

  async getFeaturedProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products.map(product => this.transformProduct(product));
  }

  /**
   * Transform product from database format to frontend format
   */
  private transformProduct(product: any) {
    return {
      ...product,
      // Map field names to match frontend expectations
      nameEn: product.name,
      descriptionEn: product.description,
      regularPrice: product.price,
      salePrice: product.compareAtPrice,
      stockQuantity: product.stock,
      lowStockThreshold: product.lowStockAlert,
      // Transform images from String[] to ProductImage[]
      images: product.images?.map((url: string, index: number) => ({
        id: `${product.id}-img-${index}`,
        productId: product.id,
        url,
        altText: product.name,
        position: index,
        isFeatured: index === 0,
      })) || [],
      // Ensure rating fields exist
      rating: product.averageRating || 0,
      // Transform category/brand names
      category: product.category ? {
        ...product.category,
        nameEn: product.category.name,
      } : undefined,
      brand: product.brand ? {
        ...product.brand,
        nameEn: product.brand.name,
      } : undefined,
    };
  }

  // ============================================================================
  // PRODUCT VARIANTS
  // ============================================================================

  async createVariant(
    userId: string,
    userRole: UserRole,
    productId: string,
    createVariantDto: CreateVariantDto,
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
      if (!vendor) throw new ForbiddenException('Vendor profile not found');
      if (product.vendorId !== vendor.id) {
        throw new ForbiddenException('You can only create variants for your own products');
      }
    }

    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { sku: createVariantDto.sku },
    });
    if (existingVariant) {
      throw new ConflictException(`Variant with SKU ${createVariantDto.sku} already exists`);
    }

    return this.prisma.productVariant.create({
      data: {
        ...createVariantDto,
        productId,
      },
    });
  }

  async getVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateVariant(
    userId: string,
    userRole: UserRole,
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${variantId} not found`);

    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
      if (!vendor) throw new ForbiddenException('Vendor profile not found');
      if (variant.product.vendorId !== vendor.id) {
        throw new ForbiddenException('You can only update variants for your own products');
      }
    }

    if (updateVariantDto.sku && updateVariantDto.sku !== variant.sku) {
      const existingVariant = await this.prisma.productVariant.findUnique({
        where: { sku: updateVariantDto.sku },
      });
      if (existingVariant) {
        throw new ConflictException(`Variant with SKU ${updateVariantDto.sku} already exists`);
      }
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: updateVariantDto,
    });
  }

  async deleteVariant(userId: string, userRole: UserRole, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${variantId} not found`);

    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
      if (!vendor) throw new ForbiddenException('Vendor profile not found');
      if (variant.product.vendorId !== vendor.id) {
        throw new ForbiddenException('You can only delete variants for your own products');
      }
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isActive: false },
    });
  }

  // NEW: Homepage Aggregation Endpoints

  async getScentFamilyAggregation() {
    const aggregation = await this.prisma.product.groupBy({
      by: ['scentFamily'],
      where: { isActive: true },
      _count: { id: true },
    });

    return aggregation.map((item) => ({
      scentFamily: item.scentFamily,
      count: item._count.id,
    }));
  }

  async getOccasionAggregation() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, occasion: { not: null } },
      select: { occasion: true },
    });

    const occasionCounts = new Map<string, number>();
    products.forEach((product) => {
      if (product.occasion) {
        const occasions = product.occasion.split(',').map((o) => o.trim());
        occasions.forEach((occasion) => {
          occasionCounts.set(occasion, (occasionCounts.get(occasion) || 0) + 1);
        });
      }
    });

    return Array.from(occasionCounts.entries()).map(([occasion, count]) => ({
      occasion,
      count,
    }));
  }

  async getRegionAggregation() {
    const aggregation = await this.prisma.product.groupBy({
      by: ['region'],
      where: { isActive: true, region: { not: null } },
      _count: { id: true },
    });

    return aggregation.map((item) => ({
      region: item.region,
      count: item._count.id,
    }));
  }

  async getOudTypeAggregation() {
    const aggregation = await this.prisma.product.groupBy({
      by: ['oudType'],
      where: { isActive: true, oudType: { not: null } },
      _count: { id: true },
    });

    return aggregation.map((item) => ({
      oudType: item.oudType,
      count: item._count.id,
    }));
  }

  async getProductTypeAggregation() {
    const aggregation = await this.prisma.product.groupBy({
      by: ['productType'],
      where: { isActive: true },
      _count: { id: true },
    });

    return aggregation.map((item) => ({
      productType: item.productType,
      count: item._count?.id || 0,
    }));
  }

  async getCollectionAggregation() {
    const aggregation = await this.prisma.product.groupBy({
      by: ['collection'],
      where: { isActive: true, collection: { not: null } },
      _count: { id: true },
    });

    return aggregation.map((item) => ({
      collection: item.collection,
      count: item._count.id,
    }));
  }

  async getFlashSaleProducts(limit: number = 10) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        isOnSale: true,
        saleEndDate: { gt: new Date() },
      },
      include: {
        brand: { select: { id: true, name: true, nameAr: true, logo: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
      orderBy: { discountPercent: 'desc' },
      take: limit,
    });
  }

  async getProductsByCollection(collection: string, limit: number = 10) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        collection,
      },
      include: {
        brand: { select: { id: true, name: true, nameAr: true, logo: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
      orderBy: { salesCount: 'desc' },
      take: limit,
    });
  }

  async getNewArrivals(limit: number = 10) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        brand: { select: { id: true, name: true, nameAr: true, logo: true } },
        category: { select: { id: true, name: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getGenderBanners() {
    const menCount = await this.prisma.product.count({
      where: { isActive: true, gender: 'men' },
    });
    const womenCount = await this.prisma.product.count({
      where: { isActive: true, gender: 'women' },
    });
    const unisexCount = await this.prisma.product.count({
      where: { isActive: true, gender: 'unisex' },
    });

    return {
      men: menCount,
      women: womenCount,
      unisex: unisexCount,
    };
  }

  // ============================================================================
  // FLASH SALE MANAGEMENT
  // ============================================================================

  async bulkAddFlashSale(
    userId: string,
    userRole: UserRole,
    bulkFlashSaleDto: BulkFlashSaleDto,
  ) {
    const { productIds, salePrice, discountPercent, saleEndDate } = bulkFlashSaleDto;

    // Verify ownership for vendors
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      // Check that all products belong to this vendor
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
          vendorId: vendor.id,
        },
      });

      if (products.length !== productIds.length) {
        throw new ForbiddenException(
          'You can only manage flash sales for your own products',
        );
      }
    }

    // Calculate sale price and discount percent for each product
    const updatePromises = productIds.map(async (productId) => {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });

      if (!product) return null;

      let finalSalePrice = salePrice;
      let finalDiscountPercent = discountPercent;

      // If discount percent is provided but sale price isn't, calculate sale price
      if (discountPercent && !salePrice) {
        finalSalePrice = Math.round(
          product.price * (1 - discountPercent / 100),
        );
      }

      // If sale price is provided but discount percent isn't, calculate discount
      if (salePrice && !discountPercent) {
        finalDiscountPercent = Math.round(
          ((product.price - salePrice) / product.price) * 100,
        );
      }

      return this.prisma.product.update({
        where: { id: productId },
        data: {
          isOnSale: true,
          salePrice: finalSalePrice,
          discountPercent: finalDiscountPercent,
          saleEndDate: saleEndDate || null,
        },
      });
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter((r) => r !== null).length;

    return {
      success: true,
      message: `Added ${successCount} products to flash sale`,
      updatedCount: successCount,
    };
  }

  async bulkRemoveFlashSale(
    userId: string,
    userRole: UserRole,
    removeFlashSaleDto: RemoveFlashSaleDto,
  ) {
    const { productIds } = removeFlashSaleDto;

    // Verify ownership for vendors
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
          vendorId: vendor.id,
        },
      });

      if (products.length !== productIds.length) {
        throw new ForbiddenException(
          'You can only manage flash sales for your own products',
        );
      }
    }

    await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: {
        isOnSale: false,
        salePrice: null,
        discountPercent: null,
        saleEndDate: null,
      },
    });

    return {
      success: true,
      message: `Removed ${productIds.length} products from flash sale`,
      removedCount: productIds.length,
    };
  }

  async setFlashSaleDiscount(
    userId: string,
    userRole: UserRole,
    setDiscountDto: SetDiscountPercentDto,
  ) {
    const { productIds, discountPercent, saleEndDate } = setDiscountDto;

    // Verify ownership for vendors
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
          vendorId: vendor.id,
        },
      });

      if (products.length !== productIds.length) {
        throw new ForbiddenException(
          'You can only manage flash sales for your own products',
        );
      }
    }

    // Calculate sale price for each product based on discount percent
    const updatePromises = productIds.map(async (productId) => {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });

      if (!product) return null;

      const salePrice = Math.round(product.price * (1 - discountPercent / 100));

      return this.prisma.product.update({
        where: { id: productId },
        data: {
          isOnSale: true,
          salePrice,
          discountPercent,
          saleEndDate: saleEndDate || null,
        },
      });
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter((r) => r !== null).length;

    return {
      success: true,
      message: `Set ${discountPercent}% discount on ${successCount} products`,
      updatedCount: successCount,
    };
  }

  async getMyFlashSaleProducts(userId: string, userRole: UserRole) {
    const where: any = {
      isActive: true,
      isOnSale: true,
    };

    // For vendors, only show their own flash sale products
    if (userRole === UserRole.VENDOR) {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId },
      });

      if (!vendor) {
        throw new ForbiddenException('Vendor profile not found');
      }

      where.vendorId = vendor.id;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, nameAr: true, logo: true } },
        category: { select: { id: true, name: true, nameAr: true } },
        vendor: { select: { id: true, businessName: true } },
      },
      orderBy: [
        { saleEndDate: 'asc' },
        { discountPercent: 'desc' },
      ],
    });

    // Group products by status
    const now = new Date();
    const active = products.filter((p) => !p.saleEndDate || p.saleEndDate > now);
    const expired = products.filter((p) => p.saleEndDate && p.saleEndDate <= now);

    return {
      active,
      expired,
      total: products.length,
    };
  }
}
