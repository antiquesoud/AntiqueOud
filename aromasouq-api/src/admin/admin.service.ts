import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      pendingOrders,
      activeUsers,
      pendingVendors,
      totalVendors,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // Total orders
      this.prisma.order.count(),

      // Total products
      this.prisma.product.count(),

      // Total revenue (sum of all delivered orders)
      this.prisma.order.aggregate({
        where: { orderStatus: 'DELIVERED' },
        _sum: { total: true },
      }),

      // Pending orders
      this.prisma.order.count({
        where: { orderStatus: 'PENDING' },
      }),

      // Active users
      this.prisma.user.count({
        where: { status: 'ACTIVE' },
      }),

      // Pending vendors
      this.prisma.vendor.count({
        where: { status: 'PENDING' },
      }),

      // Total vendors
      this.prisma.vendor.count(),
    ]);

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Top selling products
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
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

    return {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      activeUsers,
      pendingVendors,
      totalVendors,
      recentOrders,
      topProducts: topProductsWithDetails,
    };
  }

  async getAllUsers(params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { role, status, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          coinsBalance: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto) {
    const { status } = updateUserStatusDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent admin from deactivating themselves
    if (user.role === 'ADMIN' && status === 'SUSPENDED') {
      throw new BadRequestException('Cannot suspend admin users');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    return updatedUser;
  }

  async getAllOrders(params?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, userId, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (status) where.orderStatus = status;
    if (userId) where.userId = userId;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  images: true,
                  vendor: {
                    select: {
                      id: true,
                      businessName: true,
                      businessNameAr: true,
                      user: {
                        select: {
                          firstName: true,
                          lastName: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllProducts(params?: {
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { isActive, isFeatured, search, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessNameAr: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          variants: {
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
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate total stock and effective price for each product
    const productsWithCalculations = products.map((product) => {
      // Calculate total stock (from product + all variants)
      const totalStock =
        product.stock +
        (product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0);

      // Determine effective price
      let effectivePrice = product.salePrice || product.price;

      // If product has variants, use the lowest price
      if (product.variants && product.variants.length > 0) {
        const variantPrices = product.variants.map(
          (v) => v.salePrice || v.price,
        );
        const lowestPrice = Math.min(...variantPrices);
        effectivePrice = lowestPrice;
      }

      return {
        ...product,
        stockQuantity: totalStock, // Add for frontend compatibility
        regularPrice: product.price, // Add for frontend compatibility
        calculatedPrice: effectivePrice, // Add calculated price
      };
    });

    return {
      data: productsWithCalculations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllReviews(params?: {
    isPublished?: boolean;
    productId?: string;
    page?: number;
    limit?: number;
  }) {
    const { isPublished, productId, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (isPublished !== undefined) where.isPublished = isPublished;
    if (productId) where.productId = productId;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVendors(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = params || {};

    const where: any = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      data: vendors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVendorById(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return vendor;
  }

  async updateVendorStatus(
    vendorId: string,
    updateVendorStatusDto: UpdateVendorStatusDto,
  ) {
    const { status } = updateVendorStatusDto;

    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    const updateData: any = { status };

    // Set verifiedAt timestamp when approving
    if (status === 'APPROVED' && !vendor.verifiedAt) {
      updateData.verifiedAt = new Date();
    }

    // When vendor is suspended/rejected, deactivate all their products
    if (status === 'SUSPENDED' || status === 'REJECTED') {
      await this.prisma.product.updateMany({
        where: { vendorId },
        data: { isActive: false },
      });
    }

    // When vendor is approved, reactivate their products
    if (status === 'APPROVED') {
      await this.prisma.product.updateMany({
        where: { vendorId },
        data: { isActive: true },
      });
    }

    const updatedVendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedVendor;
  }

  async updateProductStatus(productId: string, isActive: boolean) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        nameAr: true,
        isActive: true,
      },
    });
  }
}
