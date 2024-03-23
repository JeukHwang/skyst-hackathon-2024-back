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

export class EditUserDto {
  @IsNumber()
  @Type(() => Number)
  lecture!: number;
}
