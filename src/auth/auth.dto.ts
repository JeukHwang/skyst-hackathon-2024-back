import { IsString } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  name: string;
  @IsString()
  password: string;
}
