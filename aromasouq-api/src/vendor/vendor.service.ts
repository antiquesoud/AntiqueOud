import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { VendorStatus, UserRole, OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create vendor profile for a user (or update if exists)
   * Called after user registration with role=VENDOR
   * Uses upsert logic to handle multi-step registration
   */
  async create(userId: string, createVendorDto: CreateVendorDto) {
    // Check if user exists and has VENDOR role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.VENDOR) {
      throw new ForbiddenException('User must have VENDOR role');
    }

    // If vendor profile already exists, update it instead of throwing error
    if (user.vendorProfile) {
      return this.prisma.vendor.update({
        where: { userId },
        data: {
          businessName: createVendorDto.businessName,
          businessEmail: createVendorDto.businessEmail,
          businessPhone: createVendorDto.businessPhone,
          businessNameAr: createVendorDto.businessNameAr,
          description: createVendorDto.description,
          descriptionAr: createVendorDto.descriptionAr,
          tradeLicense: createVendorDto.tradeLicense,
          taxNumber: createVendorDto.taxNumber,
          website: createVendorDto.website,
          instagramUrl: createVendorDto.instagramUrl,
          facebookUrl: createVendorDto.facebookUrl,
          twitterUrl: createVendorDto.twitterUrl,
          whatsappNumber: createVendorDto.whatsappNumber,
          // Keep existing status if profile is being updated
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
            },
          },
        },
      });
    }

    // Create new vendor profile
    const vendor = await this.prisma.vendor.create({
      data: {
        userId,
        businessName: createVendorDto.businessName,
        businessEmail: createVendorDto.businessEmail,
        businessPhone: createVendorDto.businessPhone,
        businessNameAr: createVendorDto.businessNameAr,
        description: createVendorDto.description,
        descriptionAr: createVendorDto.descriptionAr,
        tradeLicense: createVendorDto.tradeLicense,
        taxNumber: createVendorDto.taxNumber,
        website: createVendorDto.website,
        instagramUrl: createVendorDto.instagramUrl,
        facebookUrl: createVendorDto.facebookUrl,
        twitterUrl: createVendorDto.twitterUrl,
        whatsappNumber: createVendorDto.whatsappNumber,
        status: VendorStatus.PENDING, // Requires admin approval
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    return vendor;
  }

  /**
   * Get vendor profile by userId
   */
  async getByUserId(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            role: true,
            status: true,
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
      throw new NotFoundException('Vendor profile not found');
    }

    return vendor;
  }

  /**
   * Update vendor profile
   */
  async update(userId: string, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    if (vendor.status === VendorStatus.SUSPENDED) {
      throw new ForbiddenException('Cannot update suspended vendor profile');
    }

    return this.prisma.vendor.update({
      where: { userId },
      data: updateVendorDto,
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
  }

  /**
   * Get vendor dashboard statistics
   */
  async getDashboardStats(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    // Get all products for this vendor
    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        salesCount: true,
        averageRating: true,
        reviewCount: true,
        isActive: true,
        lowStockAlert: true,
      },
    });

    const productIds = products.map((p) => p.id);

    // Get both user orders and guest orders containing vendor's products
    const [userOrders, guestOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          items: {
            some: {
              productId: { in: productIds },
            },
          },
        },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100, // Get last 100 orders for calculations
      }),
      this.prisma.guestOrder.findMany({
        where: {
          items: {
            some: {
              productId: { in: productIds },
            },
          },
        },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100, // Get last 100 orders for calculations
      }),
    ]);

    // Merge both order types
    const orders = [
      ...userOrders.map((order) => ({
        ...order,
        isGuestOrder: false,
      })),
      ...guestOrders.map((order) => ({
        ...order,
        isGuestOrder: true,
        user: null, // Guest orders don't have user
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate statistics
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts = products.filter(
      (p) => p.stock <= p.lowStockAlert && p.stock > 0,
    );

    const totalSales = orders.reduce((sum, order) => {
      const vendorItemsTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.price * item.quantity,
        0,
      );
      return sum + vendorItemsTotal;
    }, 0);

    const pendingOrders = orders.filter((o) => o.orderStatus === 'PENDING').length;
    const totalOrders = orders.length;

    const avgRating =
      totalProducts > 0
        ? products.reduce((sum, p) => sum + p.averageRating, 0) / totalProducts
        : 0;
    const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);

    // Top selling products
    const topProducts = [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        salesCount: p.salesCount,
        revenue: p.price * p.salesCount,
        stockQuantity: p.stock,
      }));

    // Recent orders mapped to vendor's items (handle both user and guest orders)
    const recentOrders = orders.slice(0, 5).map((order: any) => {
      let customerName = 'Guest Customer';
      let customerEmail = '';

      if (order.isGuestOrder) {
        // Guest order - extract from shippingAddress or use guest fields
        customerEmail = (order as any).guestEmail || '';
        try {
          const shippingAddress = (order as any).shippingAddress as any;
          if (shippingAddress && (shippingAddress.firstName || shippingAddress.lastName)) {
            customerName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim();
          }
        } catch (e) {
          // Keep default
        }
      } else {
        // Authenticated user order
        customerName = `${order.user.firstName} ${order.user.lastName}`;
        customerEmail = order.user.email;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName,
        customerEmail,
        total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    // Calculate sales growth (current month vs previous month)
    // Get start of current month
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Calculate current month sales
    const currentMonthOrders = orders.filter(
      (order) =>
        order.createdAt >= currentMonthStart &&
        order.orderStatus !== OrderStatus.CANCELLED,
    );
    const currentMonthSales = currentMonthOrders.reduce((sum, order) => {
      const vendorItemsTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.price * item.quantity,
        0,
      );
      return sum + vendorItemsTotal;
    }, 0);

    // Get start of previous month
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    previousMonthStart.setDate(1);
    previousMonthStart.setHours(0, 0, 0, 0);

    // Get end of previous month (1 second before current month start)
    const previousMonthEnd = new Date(currentMonthStart);
    previousMonthEnd.setSeconds(previousMonthEnd.getSeconds() - 1);

    // Calculate previous month sales
    const previousMonthOrders = orders.filter(
      (order) =>
        order.createdAt >= previousMonthStart &&
        order.createdAt <= previousMonthEnd &&
        order.orderStatus !== OrderStatus.CANCELLED,
    );
    const previousMonthSales = previousMonthOrders.reduce((sum, order) => {
      const vendorItemsTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.price * item.quantity,
        0,
      );
      return sum + vendorItemsTotal;
    }, 0);

    // Calculate growth percentage
    let salesGrowth = 0;
    if (previousMonthSales > 0) {
      salesGrowth =
        ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
      salesGrowth = Math.round(salesGrowth * 100) / 100; // Round to 2 decimals
    }

    return {
      totalSales: currentMonthSales, // Current month sales
      salesGrowth: salesGrowth, // Percentage growth
      productCount: totalProducts,
      activeProducts,
      orderCount: totalOrders,
      pendingOrders,
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalReviews,
      topProducts,
      recentOrders,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stockQuantity: p.stock,
      })),
    };
  }

  /**
   * Get vendor's products with filters
   */
  async getProducts(userId: string, params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    const { search, status, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {
      vendorId: vendor.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

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
            },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              nameAr: true,
              size: true,
              sku: true,
              price: true,
              salePrice: true,
              stock: true,
              isActive: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get vendor's orders (includes both authenticated user orders and guest orders)
   */
  async getOrders(userId: string, params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    // Get all product IDs for this vendor
    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    const { search, status, page = 1, limit = 20 } = params || {};
    const skip = (page - 1) * limit;

    // Build where clause for authenticated user orders
    const whereUser: any = {
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    };

    if (status && status !== 'all') {
      whereUser.orderStatus = status;
    }

    // Build where clause for guest orders
    const whereGuest: any = {
      items: {
        some: {
          productId: { in: productIds },
        },
      },
    };

    if (status && status !== 'all') {
      whereGuest.orderStatus = status;
    }

    // Query both authenticated user orders and guest orders in parallel
    const [userOrders, guestOrders, totalUser, totalGuest] = await Promise.all([
      this.prisma.order.findMany({
        where: whereUser,
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.guestOrder.findMany({
        where: whereGuest,
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where: whereUser }),
      this.prisma.guestOrder.count({ where: whereGuest }),
    ]);

    // Map authenticated user orders
    const mappedUserOrders = userOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      itemCount: order.items.length,
      total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: order.orderStatus,
      createdAt: order.createdAt,
      items: order.items,
      isGuestOrder: false,
    }));

    // Map guest orders - extract name from shipping address if available
    const mappedGuestOrders = guestOrders.map((order) => {
      // Try to extract name from shippingAddress JSON
      let guestName = 'Guest Customer';
      try {
        const shippingAddress = order.shippingAddress as any;
        if (shippingAddress && (shippingAddress.firstName || shippingAddress.lastName)) {
          guestName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim();
        }
      } catch (e) {
        // If parsing fails, keep default
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: guestName,
        customerEmail: order.guestEmail,
        itemCount: order.items.length,
        total: order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: order.orderStatus,
        createdAt: order.createdAt,
        items: order.items,
        isGuestOrder: true,
      };
    });

    // Merge both order types and sort by createdAt descending
    const allOrders = [...mappedUserOrders, ...mappedGuestOrders]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    const totalOrders = totalUser + totalGuest;

    return {
      data: allOrders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit),
      },
    };
  }

  /**
   * Get single order details (vendors can only view orders containing their products)
   */
  async getOrder(userId: string, orderId: string) {
    // Get vendor profile
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    // Get all product IDs for this vendor
    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // Try to find the order in both user orders and guest orders
    const [userOrder, guestOrder] = await Promise.all([
      this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  slug: true,
                  images: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  size: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          address: true,
        },
      }),
      this.prisma.guestOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  slug: true,
                  images: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  nameAr: true,
                  size: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Check if order exists in either table
    if (!userOrder && !guestOrder) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Use whichever order was found
    const order = userOrder || guestOrder;
    const isGuestOrder = !!guestOrder;

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.items.length === 0) {
      throw new ForbiddenException(
        'This order does not contain any of your products',
      );
    }

    // Extract customer information
    let customerName = 'Guest Customer';
    let customerEmail = '';
    let address: any = null;

    if (isGuestOrder && guestOrder) {
      // Guest order
      customerEmail = guestOrder.guestEmail;
      try {
        const shippingAddress = guestOrder.shippingAddress as any;
        if (shippingAddress) {
          address = shippingAddress;
          if (shippingAddress.firstName || shippingAddress.lastName) {
            customerName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim();
          }
        }
      } catch (e) {
        // Keep default
      }
    } else if (userOrder) {
      // Authenticated user order
      customerName = `${userOrder.user.firstName} ${userOrder.user.lastName}`;
      customerEmail = userOrder.user.email;
      address = userOrder.address;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName,
      customerEmail,
      itemCount: order.items.length,
      total: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      status: order.orderStatus,
      createdAt: order.createdAt,
      items: order.items,
      address,
      trackingNumber: order.trackingNumber,
      isGuestOrder,
    };
  }

  /**
   * Update order status (vendors can only update orders containing their products)
   */
  async updateOrderStatus(
    userId: string,
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const { orderStatus, trackingNumber } = updateOrderStatusDto;

    // Get vendor profile
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    // Get all product IDs for this vendor
    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true },
    });

    const productIds = products.map((p) => p.id);

    // Try to find order in both authenticated Order and GuestOrder tables
    const [userOrder, guestOrder] = await Promise.all([
      this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
          },
        },
      }),
      this.prisma.guestOrder.findUnique({
        where: { id: orderId },
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
          },
        },
      }),
    ]);

    const order = userOrder || guestOrder;
    const isGuestOrder = !!guestOrder;

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.items.length === 0) {
      throw new ForbiddenException(
        'This order does not contain any of your products',
      );
    }

    // Prepare update data
    const updateData: any = { orderStatus };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Set timestamp fields based on status
    switch (orderStatus) {
      case OrderStatus.CONFIRMED:
        updateData.confirmedAt = new Date();
        updateData.paymentStatus = PaymentStatus.PAID;
        break;
      case OrderStatus.PROCESSING:
        // No specific timestamp for processing
        break;
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        // Award coins to user when order is delivered (only for authenticated users, not guests)
        if (!isGuestOrder && userOrder?.userId) {
          await this.prisma.user.update({
            where: { id: userOrder.userId },
            data: {
              coinsBalance: {
                increment: userOrder.coinsEarned || 0,
              },
            },
          });
        }
        break;
      case OrderStatus.CANCELLED:
        throw new BadRequestException(
          'Vendors cannot cancel orders. Please contact customer support.',
        );
    }

    // Update the appropriate order table based on order type
    if (isGuestOrder) {
      const updatedOrder = await this.prisma.guestOrder.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      return {
        ...updatedOrder,
        isGuestOrder: true,
      };
    } else {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          items: {
            where: {
              productId: { in: productIds },
            },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        customerName: `${updatedOrder.user.firstName} ${updatedOrder.user.lastName}`,
        customerEmail: updatedOrder.user.email,
        itemCount: updatedOrder.items.length,
        total: updatedOrder.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
        status: updatedOrder.orderStatus,
        createdAt: updatedOrder.createdAt,
        items: updatedOrder.items,
        isGuestOrder: false,
      };
    }
  }
}

