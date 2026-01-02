import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AddressesModule } from './addresses/addresses.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UploadsModule } from './uploads/uploads.module';
import { VendorModule } from './vendor/vendor.module';
import { CouponsModule } from './coupons/coupons.module';
import { CheckoutModule } from './checkout/checkout.module';
import { WalletModule} from './wallet/wallet.module';
import { SessionModule } from './session/session.module';
import { GuestCartModule } from './guest-cart/guest-cart.module';
import { GuestOrdersModule } from './guest-orders/guest-orders.module';
import { PaymentsModule } from './payments/payments.module';

// Phase 5: File uploads & media management modules loaded
// Phase 6: Wallet & Coins system integrated
// Phase 7: Guest checkout system with session management
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global cache module for API response caching
    CacheModule.register({
      ttl: 300000,      // Default TTL: 5 minutes (in milliseconds)
      max: 500,         // Maximum items in cache
      isGlobal: true,   // Available across all modules
    }),
    PrismaModule,
    SessionModule, // Global session management for guests
    AuthModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    GuestCartModule, // Guest cart for unauthenticated users
    WishlistModule,
    WalletModule,
    OrdersModule,
    GuestOrdersModule, // Guest orders for unauthenticated users
    ReviewsModule,
    AddressesModule,
    UsersModule,
    AdminModule,
    SupabaseModule,
    UploadsModule,
    VendorModule,
    CouponsModule,
    CheckoutModule,
    PaymentsModule, // Stripe payment integration
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
