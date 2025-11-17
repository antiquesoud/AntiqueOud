import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class TrackOrderDto {
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
