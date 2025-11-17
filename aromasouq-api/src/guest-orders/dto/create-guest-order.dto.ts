import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsObject,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  building: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsString()
  apartment?: string;

  @IsString()
  landmark?: string;

  @IsString()
  notes?: string;
}

export class CreateGuestOrderDto {
  @IsNotEmpty()
  @IsEmail()
  guestEmail: string;

  @IsNotEmpty()
  @IsString()
  guestPhone: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsNotEmpty()
  @IsString()
  @IsIn(['CASH_ON_DELIVERY', 'ONLINE_PAYMENT', 'BANK_TRANSFER'])
  paymentMethod: string;
}
