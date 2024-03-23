import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class EditUserDto {
  @IsNumber()
  @Type(() => Number)
  lecture!: number;
}
