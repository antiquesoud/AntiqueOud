import { Module } from '@nestjs/common';
import { GuestOrdersService } from './guest-orders.service';
import { GuestOrdersController } from './guest-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestCartModule } from '../guest-cart/guest-cart.module';

@Module({
  imports: [PrismaModule, GuestCartModule],
  controllers: [GuestOrdersController],
  providers: [GuestOrdersService],
  exports: [GuestOrdersService],
})
export class GuestOrdersModule {}
