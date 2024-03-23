import { IsString } from 'class-validator';

export class UserResponseDto {
  id: string;
  @IsString()
  name: string;
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
