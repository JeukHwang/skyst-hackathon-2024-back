import { IsString } from 'class-validator';

export class SendRequestDto {
  @IsString()
  letter: string;
  @IsString()
  itemId: string;
  @IsString()
  receiverId: string;
}

export class ReplyRequestDto {
  @IsString()
  giftId: string;
  @IsString()
  repliedLetter: string;
}
