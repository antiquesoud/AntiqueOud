import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CacheKey, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('all-categories')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('with-products')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800000) // 30 minutes
  @CacheKey('categories-with-products')
  findAllWithProducts() {
    return this.categoriesService.findAllWithProducts();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    // Invalidate category caches
    await this.invalidateCategoryCaches();
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    // Invalidate category caches
    await this.invalidateCategoryCaches();
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    // Invalidate category caches
    await this.invalidateCategoryCaches();
    return this.categoriesService.remove(id);
  }

  private async invalidateCategoryCaches() {
    await Promise.all([
      this.cacheManager.del('all-categories'),
      this.cacheManager.del('categories-with-products'),
    ]);
  }
}
