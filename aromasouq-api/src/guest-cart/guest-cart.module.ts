import { Module } from '@nestjs/common';
import { GuestCartService } from './guest-cart.service';
import { GuestCartController } from './guest-cart.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GuestCartController],
  providers: [GuestCartService],
  exports: [GuestCartService],
})
export class GuestCartModule {}
