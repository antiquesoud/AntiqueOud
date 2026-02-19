import { IsArray, IsUUID, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemUpdate {
  @IsUUID()
  itemId: string;

  @IsInt()
  @Min(0) // 0 = remove item
  quantity: number;
}

export class SyncCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemUpdate)
  items: CartItemUpdate[];
}
