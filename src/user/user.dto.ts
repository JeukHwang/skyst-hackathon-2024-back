import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  name: string;
  @IsString()
  email: string;
  @IsString()
  introduction: string;
  @IsString()
  profilePhoto: string;
}

export class UserBodyDto {
  @IsString()
  introduction: string;
  @IsString()
  profilePhoto: string;
}

export class GiftResponseDto {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
}
