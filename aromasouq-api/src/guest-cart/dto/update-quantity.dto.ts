import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class UpdateQuantityDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}
