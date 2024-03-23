import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/user/user.decorator';
import { ReplyRequestDto, SendRequestDto } from './gift.dto';
import { GiftProfile, GiftService } from './gift.service';

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get('sended')
  async getSendedGift(@CurrentUser() user: User): Promise<GiftProfile[]> {
    return await this.giftService.getSendedGift(user.id);
  }

  @Get('received')
  async getReceivedGift(@CurrentUser() user: User): Promise<GiftProfile[]> {
    return await this.giftService.getReceivedGift(user.id);
  }

  @Post('send')
  async sendGift(
    @Body() body: SendRequestDto,
    @CurrentUser() user: User,
  ): Promise<GiftProfile> {
    return await this.giftService.sendGift(body, user);
  }

  @Post('reply')
  async replyGift(
    @Body() body: ReplyRequestDto,
    @CurrentUser() user: User,
  ): Promise<void> {
    return await this.giftService.replyGift(body, user);
  }

  @Get(':id')
  find(
    @Param('id') giftId: string,
    @CurrentUser() user: User,
  ): Promise<GiftProfile> {
    return this.giftService.find(giftId, user);
  }
}
