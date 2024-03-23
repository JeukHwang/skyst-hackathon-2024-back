import { Injectable } from '@nestjs/common';
import { Gift, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReplyRequestDto, SendRequestDto } from './gift.dto';

export type GiftProfile = {
  id: string;
  letter: string;
  repliedLetter?: string;
  itemId: string;
  senderId: string;
  receiverId: string;
  sendedAt?: Date;
  receivedAt?: Date;
  replySendedAt?: Date;
  replyReceivedAt?: Date;
  deletedAt?: Date;
};

export function toGiftProfile(gift: Gift): GiftProfile {
  return {
    id: gift.id,
    letter: gift.letter,
    repliedLetter: gift.repliedLetter,
    itemId: gift.itemId,
    senderId: gift.senderId,
    receiverId: gift.receiverId,
    sendedAt: gift.sendedAt,
    receivedAt: gift.receivedAt,
    replySendedAt: gift.replySendedAt,
    replyReceivedAt: gift.replyReceivedAt,
    deletedAt: gift.replySendedAt,
  };
}

@Injectable()
export class GiftService {
  constructor(private readonly prismaService: PrismaService) {}

  async getSendedGift(userId: string): Promise<GiftProfile[]> {
    const gifts = await this.prismaService.user
      .findUnique({ where: { id: userId } })
      .sended();
    return gifts.map(toGiftProfile);
  }

  async getReceivedGift(userId: string): Promise<GiftProfile[]> {
    const gifts = await this.prismaService.user
      .findUnique({ where: { id: userId } })
      .received();
    return gifts.map(toGiftProfile);
  }

  async sendGift(body: SendRequestDto, user: User): Promise<GiftProfile> {
    const gift = await this.prismaService.gift.create({
      data: {
        letter: body.letter,
        itemId: body.itemId,
        senderId: user.id,
        receiverId: body.receiverId,
        sendedAt: new Date(),
      },
    });
    return toGiftProfile(gift);
  }

  async replyGift(body: ReplyRequestDto, user: User): Promise<void> {
    const gift = await this.prismaService.gift.findUnique({
      where: { id: body.giftId },
    });
    if (
      !gift &&
      gift.receiverId !== user.id &&
      gift.repliedLetter === undefined
    )
      return null;
    await this.prismaService.gift.update({
      where: { id: body.giftId },
      data: {
        repliedLetter: body.repliedLetter,
        replySendedAt: new Date(),
      },
    });
  }

  async find(giftId: string, user: User): Promise<GiftProfile> {
    const gift = await this.prismaService.gift.findUnique({
      where: { id: giftId },
      include: {
        sender: true,
        receiver: true,
      },
    });
    await this.prismaService.gift.update({
      where: { id: gift.id },
      data: {
        receivedAt:
          user.id === gift.receiverId && gift.sendedAt && !gift.receivedAt
            ? new Date()
            : undefined,
        replyReceivedAt:
          user.id === gift.senderId &&
          gift.replySendedAt &&
          !gift.replyReceivedAt
            ? new Date()
            : undefined,
      },
    });
    return {
      ...toGiftProfile(gift),
      senderName: gift.sender.name,
      receiverName: gift.receiver.name,
    } as GiftProfile;
  }
}
