import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CacheKey, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import type { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { BulkFlashSaleDto, RemoveFlashSaleDto, SetDiscountPercentDto } from './dto/flash-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('category') category?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('brandId') brandId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('gender') gender?: string,
    @Query('concentration') concentration?: string,
    @Query('scentFamily') scentFamily?: string,
    @Query('season') season?: string,
    // Phase 3: New classification query params
    @Query('productType') productType?: string,
    @Query('region') region?: string,
    @Query('occasion') occasion?: string,
    @Query('oudType') oudType?: string,
    @Query('collection') collection?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('isActive') isActive?: string,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'name',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Build cache key from query params (only cache non-search queries for 2 min)
    const cacheKey = search ? null : `products:${categorySlug || category || categoryId || 'all'}:${gender || ''}:${page || 1}:${limit || 20}:${sortBy || 'createdAt'}`;

    // Try to get from cache first (skip for search queries)
    if (cacheKey) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const result = await this.productsService.findAll({
      categoryId,
      categorySlug: categorySlug || category, // Support both parameters, prioritize categorySlug
      brandId,
      vendorId,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      gender,
      concentration,
      scentFamily,
      season,
      productType,
      region,
      occasion,
      oudType,
      collection,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    // Cache the result for 2 minutes (non-search queries only)
    if (cacheKey) {
      await this.cacheManager.set(cacheKey, result, 120000); // 2 minutes
    }

    return result;
  }

  @Get('featured')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800000) // 30 minutes
  @CacheKey('featured-products')
  getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeaturedProducts(
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // NEW: Homepage Aggregation Endpoints
  @Get('scent-families')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('scent-families')
  getScentFamilies() {
    return this.productsService.getScentFamilyAggregation();
  }

  @Get('occasions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('occasions')
  getOccasions() {
    return this.productsService.getOccasionAggregation();
  }

  @Get('regions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('regions')
  getRegions() {
    return this.productsService.getRegionAggregation();
  }

  @Get('oud-types')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('oud-types')
  getOudTypes() {
    return this.productsService.getOudTypeAggregation();
  }

  @Get('product-types')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('product-types')
  getProductTypes() {
    return this.productsService.getProductTypeAggregation();
  }

  @Get('collections')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('collections')
  getCollections() {
    return this.productsService.getCollectionAggregation();
  }

  @Get('flash-sale')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes (changes frequently)
  @CacheKey('flash-sale-products')
  getFlashSale(@Query('limit') limit?: string) {
    return this.productsService.getFlashSaleProducts(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('collection/:collection')
  getByCollection(
    @Param('collection') collection: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.getProductsByCollection(
      collection,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('new-arrivals')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800000) // 30 minutes
  @CacheKey('new-arrivals')
  getNewArrivals(@Query('limit') limit?: string) {
    return this.productsService.getNewArrivals(
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('gender-banners')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('gender-banners')
  getGenderBanners() {
    return this.productsService.getGenderBanners();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  create(@Req() req: Request, @Body() createProductDto: CreateProductDto) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.create(userId, userRole, createProductDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.update(userId, userRole, id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  updateStock(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.updateStock(userId, userRole, id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.remove(userId, userRole, id);
  }

  // ============================================================================
  // PRODUCT VARIANTS
  // ============================================================================

  // Get variant presets for a product type (public endpoint)
  @Get('variant-presets/:productType')
  getVariantPresets(@Param('productType') productType: string) {
    return this.productsService.getVariantPresets(productType);
  }

  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  createVariant(
    @Req() req: Request,
    @Param('id') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.createVariant(userId, userRole, productId, createVariantDto);
  }

  @Get(':id/variants')
  getVariants(@Param('id') productId: string) {
    return this.productsService.getVariants(productId);
  }

  @Patch('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  updateVariant(
    @Req() req: Request,
    @Param('id') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.updateVariant(userId, userRole, variantId, updateVariantDto);
  }

  @Delete('variants/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  deleteVariant(@Req() req: Request, @Param('id') variantId: string) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.deleteVariant(userId, userRole, variantId);
  }

  // ============================================================================
  // FLASH SALE MANAGEMENT
  // ============================================================================

  @Post('flash-sale/bulk-add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  bulkAddFlashSale(
    @Req() req: Request,
    @Body() bulkFlashSaleDto: BulkFlashSaleDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.bulkAddFlashSale(userId, userRole, bulkFlashSaleDto);
  }

  @Post('flash-sale/bulk-remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  bulkRemoveFlashSale(
    @Req() req: Request,
    @Body() removeFlashSaleDto: RemoveFlashSaleDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.bulkRemoveFlashSale(userId, userRole, removeFlashSaleDto);
  }

  @Post('flash-sale/set-discount')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  setFlashSaleDiscount(
    @Req() req: Request,
    @Body() setDiscountDto: SetDiscountPercentDto,
  ) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.setFlashSaleDiscount(userId, userRole, setDiscountDto);
  }

  @Get('flash-sale/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  getMyFlashSaleProducts(@Req() req: Request) {
    const userId = req.user!['sub'];
    const userRole = req.user!['role'] as UserRole;
    return this.productsService.getMyFlashSaleProducts(userId, userRole);
  }
}
