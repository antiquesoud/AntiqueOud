import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}
