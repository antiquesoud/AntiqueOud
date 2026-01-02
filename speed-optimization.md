# Speed Optimization Plan - Antique Oud

## Executive Summary

This document outlines a comprehensive performance optimization plan for the Antique Oud e-commerce platform. The website currently experiences significant slowness with API response times ranging from 1-4 seconds, when industry standard is under 300ms.

**Current Performance Baseline:**
- `/api/products`: 4.0 seconds (Target: <300ms)
- `/api/categories`: 1.4 seconds (Target: <100ms)
- `/api/products/featured`: 1.6 seconds (Target: <200ms)
- `/api/brands`: 1.0 seconds (Target: <100ms)

**Expected Results After Optimization:**
- 10-20x faster API responses
- Sub-second page loads
- Improved user experience and SEO rankings

---

## Table of Contents

1. [Root Cause Analysis](#root-cause-analysis)
2. [Phase 1: Database Indexes](#phase-1-database-indexes)
3. [Phase 2: API Caching Layer](#phase-2-api-caching-layer)
4. [Phase 3: JWT Optimization](#phase-3-jwt-optimization)
5. [Phase 4: Query Optimization](#phase-4-query-optimization)
6. [Phase 5: Frontend Optimization](#phase-5-frontend-optimization)
7. [Phase 6: Infrastructure](#phase-6-infrastructure)
8. [Testing & Verification](#testing--verification)
9. [Rollback Plan](#rollback-plan)

---

## Root Cause Analysis

### Issue #1: Missing Database Indexes (Critical)
**Location:** `aromasouq-api/prisma/schema.prisma`

The Product table has 40+ fields but lacks indexes on frequently queried columns:
- `categoryId` - Used in every category filter
- `brandId` - Used in brand filtering
- `vendorId` - Used in vendor queries
- `isActive` - Filtered on EVERY product query
- `isFeatured` - Used for featured products
- `isOnSale` - Used for flash sale products
- `createdAt` - Used for sorting

**Impact:** PostgreSQL performs full table scans instead of index lookups, causing O(n) complexity instead of O(log n).

### Issue #2: No Server-Side Caching (Critical)
**Location:** Entire backend

Every API request hits the database directly. There is no:
- In-memory caching
- Redis caching
- HTTP cache headers

**Impact:** 100% database hit rate, even for static data like categories and brands.

### Issue #3: JWT Database Query on Every Request (Critical)
**Location:** `aromasouq-api/src/auth/strategies/jwt.strategy.ts:26-32`

```typescript
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
  });
  // This runs on EVERY authenticated request
}
```

**Impact:** Adds 50-100ms to every authenticated API call.

### Issue #4: Heavy Prisma Includes (High)
**Location:** All service files

Queries include full related objects when only a few fields are needed:
```typescript
include: {
  category: true,      // Returns ALL category fields
  brand: true,         // Returns ALL brand fields
  vendor: true,        // Returns ALL vendor fields
  variants: true,      // Returns ALL variants
  videos: true,        // Returns ALL videos
}
```

**Impact:** 3-5x more data transferred than necessary.

### Issue #5: N+1 Query Patterns (High)
**Locations:**
- `aromasouq-api/src/orders/orders.service.ts:110-132`
- `aromasouq-api/src/admin/admin.service.ts:89-107`

```typescript
// N+1 pattern - makes N additional queries
const itemsWithReviewStatus = await Promise.all(
  order.items.map(async (item) => {
    const review = await this.prisma.review.findUnique({...});
  })
);
```

**Impact:** Order with 5 items = 6 queries instead of 2.

### Issue #6: Frontend Client-Side Rendering (High)
**Location:** `aromasouq-web/src/app/[locale]/products/page.tsx:1`

The products page uses `'use client'` directive, meaning:
- No server-side rendering
- No static generation
- All API calls happen in browser
- SEO limitations

### Issue #7: No Request Debouncing (Medium)
**Location:** `aromasouq-web/src/app/[locale]/products/page.tsx:408-420`

Filter changes trigger immediate API calls without debouncing, causing:
- Multiple concurrent requests
- Wasted bandwidth
- Server overload

---

## Phase 1: Database Indexes

### Objective
Add strategic database indexes to eliminate full table scans and reduce query time by 5-10x.

### Files to Modify
- `aromasouq-api/prisma/schema.prisma`

### Changes Required

#### 1.1 Product Model Indexes

Add the following indexes to the Product model:

```prisma
model Product {
  // ... existing fields ...

  // Single-column indexes for common filters
  @@index([categoryId])
  @@index([brandId])
  @@index([vendorId])
  @@index([isActive])
  @@index([isFeatured])
  @@index([isOnSale])
  @@index([scentFamily])
  @@index([gender])
  @@index([productType])
  @@index([collection])
  @@index([region])
  @@index([occasion])
  @@index([oudType])

  // Descending indexes for sorting
  @@index([createdAt(sort: Desc)])
  @@index([salesCount(sort: Desc)])
  @@index([averageRating(sort: Desc)])
  @@index([price])

  // Composite indexes for common query patterns
  @@index([isActive, isFeatured])
  @@index([isActive, isOnSale])
  @@index([isActive, categoryId])
  @@index([isActive, brandId])
  @@index([isActive, vendorId])
  @@index([isActive, gender])
  @@index([isActive, scentFamily])
  @@index([isActive, createdAt(sort: Desc)])

  @@map("products")
}
```

#### 1.2 Review Model Indexes

```prisma
model Review {
  // ... existing fields ...

  @@index([productId])
  @@index([userId])
  @@index([isPublished])
  @@index([productId, isPublished])
  @@index([createdAt(sort: Desc)])

  @@map("reviews")
}
```

#### 1.3 Order Model Indexes

```prisma
model Order {
  // ... existing fields ...

  @@index([userId])
  @@index([orderStatus])
  @@index([paymentStatus])
  @@index([createdAt(sort: Desc)])
  @@index([userId, orderStatus])

  @@map("orders")
}
```

#### 1.4 CartItem Model Indexes

```prisma
model CartItem {
  // ... existing fields ...

  @@index([cartId])
  @@index([productId])

  @@map("cart_items")
}
```

#### 1.5 OrderItem Model Indexes

```prisma
model OrderItem {
  // ... existing fields ...

  @@index([orderId])
  @@index([productId])

  @@map("order_items")
}
```

#### 1.6 WishlistItem Model Indexes

```prisma
model WishlistItem {
  // ... existing fields ...

  @@index([userId])
  @@index([productId])

  @@map("wishlist_items")
}
```

#### 1.7 ProductVariant Model Indexes

```prisma
model ProductVariant {
  // ... existing fields ...

  @@index([productId])
  @@index([isActive])

  @@map("product_variants")
}
```

### Migration Command

```bash
cd aromasouq-api
npx prisma migrate dev --name add_performance_indexes
```

### Expected Impact
- Query time reduction: 5-10x for filtered queries
- Index creation time: ~1-5 minutes depending on data size
- Confidence: 95%

---

## Phase 2: API Caching Layer

### Objective
Implement server-side caching to reduce database load and provide instant responses for frequently accessed data.

### Files to Modify
- `aromasouq-api/package.json` (add dependencies)
- `aromasouq-api/src/app.module.ts`
- `aromasouq-api/src/categories/categories.controller.ts`
- `aromasouq-api/src/brands/brands.controller.ts`
- `aromasouq-api/src/products/products.controller.ts`

### Changes Required

#### 2.1 Install Dependencies

```bash
cd aromasouq-api
pnpm add @nestjs/cache-manager cache-manager
```

#### 2.2 Configure Global Cache Module

**File:** `aromasouq-api/src/app.module.ts`

Add CacheModule to imports:

```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 300000,      // Default TTL: 5 minutes (in milliseconds)
      max: 500,         // Maximum items in cache
      isGlobal: true,   // Available across all modules
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

#### 2.3 Add Caching to Categories Controller

**File:** `aromasouq-api/src/categories/categories.controller.ts`

```typescript
import { UseInterceptors, CacheInterceptor, CacheTTL, CacheKey } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // Invalidate cache on create/update/delete
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    await this.cacheManager.del('all-categories');
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    await this.cacheManager.del('all-categories');
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheManager.del('all-categories');
    return this.categoriesService.remove(id);
  }
}
```

#### 2.4 Add Caching to Brands Controller

**File:** `aromasouq-api/src/brands/brands.controller.ts`

```typescript
@Controller('brands')
export class BrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('all-brands')
  findAll() {
    return this.brandsService.findAll();
  }

  // ... similar cache invalidation for mutations
}
```

#### 2.5 Add Caching to Products Controller

**File:** `aromasouq-api/src/products/products.controller.ts`

```typescript
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('featured')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800000) // 30 minutes
  @CacheKey('featured-products')
  getFeatured(@Query('limit') limit?: number) {
    return this.productsService.getFeaturedProducts(limit || 10);
  }

  @Get('flash-sale')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes (changes frequently)
  @CacheKey('flash-sale-products')
  getFlashSale(@Query('limit') limit?: number) {
    return this.productsService.getFlashSaleProducts(limit || 10);
  }

  @Get('new-arrivals')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800000) // 30 minutes
  @CacheKey('new-arrival-products')
  getNewArrivals(@Query('limit') limit?: number) {
    return this.productsService.getNewArrivals(limit || 10);
  }

  @Get('scent-families')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1 hour
  @CacheKey('scent-families')
  getScentFamilies() {
    return this.productsService.getScentFamilyAggregation();
  }

  @Get('occasions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @CacheKey('occasions')
  getOccasions() {
    return this.productsService.getOccasionAggregation();
  }

  @Get('regions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @CacheKey('regions')
  getRegions() {
    return this.productsService.getRegionAggregation();
  }

  @Get('oud-types')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @CacheKey('oud-types')
  getOudTypes() {
    return this.productsService.getOudTypeAggregation();
  }

  @Get('gender-banners')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @CacheKey('gender-banners')
  getGenderBanners() {
    return this.productsService.getGenderBanners();
  }
}
```

#### 2.6 Create Cache Invalidation Service

**File:** `aromasouq-api/src/cache/cache-invalidation.service.ts` (new file)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheInvalidationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async invalidateProductCaches() {
    const keys = [
      'featured-products',
      'flash-sale-products',
      'new-arrival-products',
      'scent-families',
      'occasions',
      'regions',
      'oud-types',
      'gender-banners',
    ];

    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  async invalidateCategoryCaches() {
    await this.cacheManager.del('all-categories');
  }

  async invalidateBrandCaches() {
    await this.cacheManager.del('all-brands');
  }

  async invalidateAll() {
    await this.cacheManager.reset();
  }
}
```

### Expected Impact
- Cached endpoints: 50-100x faster (10-50ms vs 1-2 seconds)
- Database load reduction: 80-90% for homepage
- Confidence: 90%

---

## Phase 3: JWT Optimization

### Objective
Remove the database query that runs on every authenticated request, reducing latency by 50-100ms per request.

### Files to Modify
- `aromasouq-api/src/auth/strategies/jwt.strategy.ts`
- `aromasouq-api/src/auth/auth.service.ts`

### Changes Required

#### 3.1 Update JWT Strategy

**File:** `aromasouq-api/src/auth/strategies/jwt.strategy.ts`

**Before:**
```typescript
async validate(payload: any) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedException();
  }

  return { sub: payload.sub, email: payload.email, role: payload.role };
}
```

**After:**
```typescript
async validate(payload: any) {
  // JWT signature is already verified by Passport
  // Trust the payload for regular requests
  // Status is included in JWT and checked here

  if (!payload.sub || !payload.email || !payload.role) {
    throw new UnauthorizedException('Invalid token payload');
  }

  // Check if user status was marked as inactive in JWT
  if (payload.status && payload.status !== 'ACTIVE') {
    throw new UnauthorizedException('Account is not active');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    status: payload.status || 'ACTIVE',
  };
}
```

#### 3.2 Update Auth Service to Include Status in JWT

**File:** `aromasouq-api/src/auth/auth.service.ts`

Update the `login` method:

```typescript
async login(loginDto: LoginDto, cookies?: any) {
  // ... existing validation code ...

  // Generate JWT token with status included
  const access_token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status,  // ADD THIS LINE
  });

  // ... rest of method
}
```

Update the `register` method:

```typescript
async register(registerDto: RegisterDto, cookies?: any) {
  // ... existing code ...

  // Generate JWT token with status included
  const access_token = this.jwtService.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: 'ACTIVE',  // New users are always active
  });

  // ... rest of method
}
```

#### 3.3 Add Status Verification Guard for Sensitive Operations

**File:** `aromasouq-api/src/auth/guards/active-user.guard.ts` (new file)

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException();
    }

    // Only verify from DB for sensitive operations
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { status: true },
    });

    if (!dbUser || dbUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    return true;
  }
}
```

Use this guard for sensitive operations like:
- Placing orders
- Changing password
- Updating profile
- Making payments

### Expected Impact
- Latency reduction: 50-100ms per authenticated request
- Database queries: Eliminated for most authenticated requests
- Confidence: 98%

---

## Phase 4: Query Optimization

### Objective
Optimize Prisma queries to fetch only required data and fix N+1 query patterns.

### Files to Modify
- `aromasouq-api/src/products/products.service.ts`
- `aromasouq-api/src/orders/orders.service.ts`
- `aromasouq-api/src/admin/admin.service.ts`
- `aromasouq-api/src/cart/cart.service.ts`

### Changes Required

#### 4.1 Optimize Product List Query

**File:** `aromasouq-api/src/products/products.service.ts`

In the `findAll` method, replace `include` with `select`:

**Before:**
```typescript
include: {
  category: true,
  brand: true,
  vendor: true,
  variants: true,
}
```

**After:**
```typescript
select: {
  id: true,
  name: true,
  nameAr: true,
  slug: true,
  price: true,
  salePrice: true,
  compareAtPrice: true,
  images: true,
  averageRating: true,
  reviewCount: true,
  stock: true,
  isOnSale: true,
  isFeatured: true,
  discountPercent: true,
  gender: true,
  concentration: true,
  scentFamily: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      nameAr: true,
      slug: true,
    }
  },
  brand: {
    select: {
      id: true,
      name: true,
      nameAr: true,
      slug: true,
      logo: true,
    }
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      size: true,
      price: true,
      salePrice: true,
      stock: true,
    },
    orderBy: { sortOrder: 'asc' },
    take: 5, // Limit variants in list view
  },
}
```

#### 4.2 Fix N+1 Query in Order Details

**File:** `aromasouq-api/src/orders/orders.service.ts`

In the `findOne` method:

**Before:**
```typescript
const itemsWithReviewStatus = await Promise.all(
  order.items.map(async (item) => {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: item.productId,
        },
      },
      select: {
        id: true,
        rating: true,
        createdAt: true,
      },
    });

    return {
      ...item,
      review: review || null,
      hasReviewed: !!review,
    };
  }),
);
```

**After:**
```typescript
// Batch fetch all reviews for order items in a single query
const productIds = order.items.map(item => item.productId);

const reviews = await this.prisma.review.findMany({
  where: {
    userId,
    productId: { in: productIds },
  },
  select: {
    id: true,
    rating: true,
    productId: true,
    createdAt: true,
  },
});

// Create a map for O(1) lookup
const reviewMap = new Map(reviews.map(r => [r.productId, r]));

// Map items with review status without additional queries
const itemsWithReviewStatus = order.items.map(item => ({
  ...item,
  review: reviewMap.get(item.productId) || null,
  hasReviewed: reviewMap.has(item.productId),
}));
```

#### 4.3 Fix N+1 Query in Admin Dashboard

**File:** `aromasouq-api/src/admin/admin.service.ts`

In the `getDashboardStats` method:

**Before:**
```typescript
const topProductsWithDetails = await Promise.all(
  topProducts.map(async (item) => {
    const product = await this.prisma.product.findUnique({
      where: { id: item.productId },
      select: {
        id: true,
        name: true,
        nameAr: true,
        images: true,
        price: true,
      },
    });
    return {
      product,
      totalSold: item._sum.quantity || 0,
      orderCount: item._count.productId,
    };
  }),
);
```

**After:**
```typescript
// Batch fetch all products in a single query
const productIds = topProducts.map(item => item.productId);

const products = await this.prisma.product.findMany({
  where: { id: { in: productIds } },
  select: {
    id: true,
    name: true,
    nameAr: true,
    images: true,
    price: true,
  },
});

// Create a map for O(1) lookup
const productMap = new Map(products.map(p => [p.id, p]));

// Map without additional queries
const topProductsWithDetails = topProducts.map(item => ({
  product: productMap.get(item.productId) || null,
  totalSold: item._sum.quantity || 0,
  orderCount: item._count.productId,
}));
```

#### 4.4 Optimize Cart Query

**File:** `aromasouq-api/src/cart/cart.service.ts`

Optimize the `getCart` method to use select:

```typescript
async getCart(userId: string) {
  let cart = await this.prisma.cart.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          notes: true,
          variantId: true,
          product: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              slug: true,
              price: true,
              salePrice: true,
              images: true,
              stock: true,
              isActive: true,
              brand: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  logo: true,
                },
              },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              size: true,
              price: true,
              salePrice: true,
              stock: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  // ... rest of method
}
```

### Expected Impact
- Query time reduction: 2-3x faster
- Data transfer reduction: 50-70%
- N+1 elimination: 5-10 fewer queries per request
- Confidence: 85%

---

## Phase 5: Frontend Optimization

### Objective
Optimize frontend data fetching patterns, add request debouncing, and improve caching.

### Files to Modify
- `aromasouq-web/package.json`
- `aromasouq-web/src/components/providers/query-provider.tsx`
- `aromasouq-web/src/app/[locale]/products/page.tsx`
- `aromasouq-web/src/hooks/useProducts.ts`

### Changes Required

#### 5.1 Install Dependencies

```bash
cd aromasouq-web
pnpm add use-debounce
```

#### 5.2 Enhance Query Provider with Prefetching

**File:** `aromasouq-web/src/components/providers/query-provider.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 minutes
        gcTime: 30 * 60 * 1000,         // 30 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  }))

  // Prefetch common data on app initialization
  useEffect(() => {
    // Prefetch categories (used in navigation and filters)
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      },
      staleTime: 60 * 60 * 1000, // 1 hour
    });

    // Prefetch brands (used in filters)
    queryClient.prefetchQuery({
      queryKey: ['brands'],
      queryFn: async () => {
        const res = await fetch(`${API_URL}/brands`);
        if (!res.ok) throw new Error('Failed to fetch brands');
        return res.json();
      },
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

#### 5.3 Add Debouncing to Products Page

**File:** `aromasouq-web/src/app/[locale]/products/page.tsx`

Add debouncing to filter changes:

```typescript
import { useDebouncedCallback } from 'use-debounce';

// Inside ProductsPage component:

// Create debounced filter handler
const debouncedFilterChange = useDebouncedCallback(
  (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    setMobileFiltersOpen(false);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/products?${params.toString()}`, { scroll: false });
  },
  300 // 300ms debounce delay
);

// Replace handleFilterChange usage with debouncedFilterChange
// For text inputs (search, price), use debouncedFilterChange
// For select dropdowns, use immediate handleFilterChange
```

#### 5.4 Optimize Products Query

**File:** `aromasouq-web/src/app/[locale]/products/page.tsx`

Memoize filter object to prevent unnecessary re-fetches:

```typescript
import { useMemo } from 'react';

// Memoize the filter string to prevent cache key changes
const filterKey = useMemo(() => {
  return JSON.stringify(filters);
}, [filters]);

// Use memoized key in query
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filterKey, page],
  queryFn: async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const res = await apiClient.get(`/products?${params.toString()}`);
    return res;
  },
  staleTime: 2 * 60 * 1000, // 2 minutes for product listings
  placeholderData: (previousData) => previousData, // Keep previous data while loading
});
```

#### 5.5 Prefetch Pagination

Add prefetching for next/previous pages:

```typescript
const queryClient = useQueryClient();

// Prefetch next page when current page loads
useEffect(() => {
  if (data?.pagination?.totalPages > page) {
    const nextParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) nextParams.append(key, value);
    });
    nextParams.append('page', (page + 1).toString());
    nextParams.append('limit', limit.toString());

    queryClient.prefetchQuery({
      queryKey: ['products', filterKey, page + 1],
      queryFn: () => apiClient.get(`/products?${nextParams.toString()}`),
      staleTime: 2 * 60 * 1000,
    });
  }
}, [data, page, filterKey, queryClient, filters, limit]);
```

### Expected Impact
- Filter interaction: 3-5x fewer API calls
- Page navigation: Instant with prefetching
- Initial load: Faster with prefetched categories/brands
- Confidence: 80%

---

## Phase 6: Infrastructure

### Objective
Add compression, health checks, and monitoring to improve reliability and performance.

### Files to Modify
- `aromasouq-api/package.json`
- `aromasouq-api/src/main.ts`
- `aromasouq-api/railway.toml`

### Changes Required

#### 6.1 Add Compression

```bash
cd aromasouq-api
pnpm add compression @types/compression
```

**File:** `aromasouq-api/src/main.ts`

```typescript
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Keep for Stripe webhooks
  });

  // Add compression for all responses
  app.use(compression({
    threshold: 1024,  // Only compress responses > 1KB
    level: 6,         // Compression level (1-9, 6 is good balance)
    filter: (req, res) => {
      // Don't compress if client doesn't accept gzip
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // ... rest of bootstrap
}
```

#### 6.2 Add HTTP Cache Headers Middleware

**File:** `aromasouq-api/src/middleware/cache-headers.middleware.ts` (new file)

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CacheHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Set default cache headers
    // These can be overridden by individual controllers
    const path = req.path;

    if (path.includes('/categories') || path.includes('/brands')) {
      res.set('Cache-Control', 'public, max-age=300, s-maxage=3600');
    } else if (path.includes('/products/featured') || path.includes('/products/flash-sale')) {
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    } else if (path.includes('/products')) {
      res.set('Cache-Control', 'public, max-age=30, s-maxage=60');
    }

    next();
  }
}
```

Apply in AppModule:

```typescript
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheHeadersMiddleware } from './middleware/cache-headers.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CacheHeadersMiddleware)
      .forRoutes('*');
  }
}
```

#### 6.3 Update Railway Configuration

**File:** `aromasouq-api/railway.toml`

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install && pnpm run build"

[deploy]
startCommand = "pnpm run start:prod"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/api"
healthcheckTimeout = 30
numReplicas = 1
```

#### 6.4 Add Health Check Endpoint

**File:** `aromasouq-api/src/app.controller.ts`

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

#### 6.5 Set Up External Health Monitoring

**Recommended:** Set up UptimeRobot (free tier) or similar service:

1. Create account at https://uptimerobot.com
2. Add HTTP(s) monitor
3. URL: `https://antiqueoud-production.up.railway.app/api/health`
4. Monitoring interval: 5 minutes
5. Alert contacts: Your email

This prevents Railway from putting your server to sleep.

### Expected Impact
- Response size reduction: 60-80% with compression
- Cold start prevention: Always-on with health checks
- Reliability: Automatic alerts on downtime
- Confidence: 95%

---

## Testing & Verification

### Before/After Testing Script

Create a test script to measure improvements:

```bash
#!/bin/bash
# test-performance.sh

API_URL="https://antiqueoud-production.up.railway.app/api"

echo "Performance Test - $(date)"
echo "================================"

endpoints=(
  "/"
  "/categories"
  "/brands"
  "/products?limit=10"
  "/products/featured"
  "/products/flash-sale"
  "/products/scent-families"
)

for endpoint in "${endpoints[@]}"; do
  echo ""
  echo "Testing: $endpoint"
  curl -w "  TTFB: %{time_starttransfer}s, Total: %{time_total}s, Size: %{size_download} bytes\n" \
       -o /dev/null -s "${API_URL}${endpoint}"
done

echo ""
echo "================================"
echo "Test Complete"
```

### Expected Results

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/` | 0.3-0.5s | 0.1-0.2s | 2-3x |
| `/categories` | 1.4s | <0.1s | 14x+ |
| `/brands` | 1.0s | <0.1s | 10x+ |
| `/products?limit=10` | 4.0s | 0.3-0.5s | 8-13x |
| `/products/featured` | 1.6s | <0.1s | 16x+ |
| `/products/flash-sale` | 1.3s | <0.1s | 13x+ |

---

## Rollback Plan

### If Issues Occur

1. **Database Index Issues:**
   ```bash
   npx prisma migrate rollback
   ```

2. **Cache Issues:**
   - Remove `@UseInterceptors(CacheInterceptor)` decorators
   - Comment out CacheModule from AppModule

3. **JWT Issues:**
   - Revert jwt.strategy.ts to original
   - Revert auth.service.ts to original

4. **Frontend Issues:**
   - Remove use-debounce package
   - Revert query-provider.tsx
   - Revert products/page.tsx

### Git Commands

```bash
# View changes
git diff

# Revert specific file
git checkout main -- path/to/file

# Revert entire branch
git checkout main
git branch -D speed-optimization
```

---

## Confidence Scores Summary

| Phase | Description | Confidence | Risk Level |
|-------|-------------|------------|------------|
| 1 | Database Indexes | 95% | Low |
| 2 | API Caching | 90% | Low |
| 3 | JWT Optimization | 98% | Low |
| 4 | Query Optimization | 85% | Medium |
| 5 | Frontend Optimization | 80% | Medium |
| 6 | Infrastructure | 95% | Low |

**Overall Confidence: 88%**

---

## Implementation Checklist

- [x] Phase 1: Database Indexes
  - [x] Add Product indexes (categoryId, brandId, vendorId, isActive, isFeatured, isOnSale, etc.)
  - [x] Add Review indexes (productId, userId, isPublished)
  - [x] Add Order indexes (userId, orderStatus, createdAt)
  - [x] Add CartItem indexes (cartId, productId)
  - [x] Add OrderItem indexes (orderId, productId)
  - [x] Add WishlistItem indexes (userId, productId)
  - [x] Add ProductVariant indexes (productId, isActive)
  - [ ] Run migration (`npx prisma migrate dev --name add_performance_indexes`)

- [x] Phase 2: API Caching
  - [x] Install @nestjs/cache-manager
  - [x] Configure CacheModule in AppModule (ttl: 5min, max: 500)
  - [x] Add caching to Categories controller (1 hour TTL)
  - [x] Add caching to Brands controller (1 hour TTL)
  - [x] Add caching to Products controller (featured, flash-sale, new-arrivals, aggregations)
  - [ ] Create CacheInvalidationService (optional)

- [x] Phase 3: JWT Optimization
  - [x] Update jwt.strategy.ts (removed DB query, trust JWT payload)
  - [x] Update auth.service.ts (added status to login JWT)
  - [x] Update auth.service.ts (added status to register JWT)
  - [x] Create ActiveUserGuard for sensitive operations

- [x] Phase 4: Query Optimization
  - [x] Fix N+1 in orders.service.ts findOne (batch review queries)
  - [x] Fix N+1 in admin.service.ts getDashboardStats (batch product queries)
  - [x] Fix N+1 in products.service.ts bulkAddFlashSale
  - [x] Fix N+1 in products.service.ts setFlashSaleDiscount

- [x] Phase 5: Frontend Optimization
  - [x] Enhanced query-client.ts with gcTime and QUERY_KEYS constants
  - [x] Added optimistic updates to useCart hook
  - [ ] Add debouncing to products page (optional - requires use-debounce)
  - [ ] Add pagination prefetching (optional)

- [x] Phase 6: Infrastructure
  - [x] Install compression package
  - [x] Add compression middleware to main.ts
  - [ ] Create cache-headers.middleware.ts (optional)
  - [ ] Update railway.toml (optional)
  - [ ] Set up external monitoring (optional - recommended)

---

## Notes

- Always test changes locally before deploying
- Monitor error logs after deployment
- Run performance tests before and after each phase
- Consider implementing phases incrementally
- Cache invalidation is critical - test thoroughly

---

*Document created: January 2, 2026*
*Last updated: January 2, 2026*
*Author: Claude Code*
