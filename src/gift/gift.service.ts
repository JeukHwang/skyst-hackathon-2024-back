import { Injectable } from '@nestjs/common';
import { Gift, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReplyRequestDto, SendRequestDto } from './gift.dto';

export type GiftProfile = {
  id: string;
  letter: string;
  repliedLetter?: string;
  itemId: string;
  itemName?: string;
  itemImage?: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  receiverName?: string;
  sendedAt?: Date;
  receivedAt?: Date;
  replySendedAt?: Date;
  replyReceivedAt?: Date;
  deletedAt?: Date;
  date?: Date;
};

export function toGiftProfile(gift: Gift) {
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
    const gifts = await this.prismaService.gift.findMany({
      where: {
        senderId: userId, // 선물을 보낸 사람의 ID로 필터링
      },
      include: {
        item: true, // 선물과 관련된 아이템 정보 포함
        receiver: true, // 선물을 받은 사람의 정보 포함
        sender: true, // 선물을 보낸 사람의 정보 포함
      },
    });

    return gifts.map((gift) => ({
      id: gift.id,
      letter: gift.letter,
      repliedLetter: gift.repliedLetter,
      itemId: gift.itemId,
      itemName: gift.item.name, // item에서 이름 포함
      itemImage: gift.item.photo, // item에서 이미지 포함
      senderId: gift.senderId,
      senderName: gift.sender.name, // sender에서 이름 포함
      receiverId: gift.receiverId,
      receiverName: gift.receiver.name, // receiver에서 이름 포함
      sendedAt: gift.sendedAt,
      receivedAt: gift.receivedAt,
      replySendedAt: gift.replySendedAt,
      replyReceivedAt: gift.replyReceivedAt,
      deletedAt: gift.deletedAt,
      date: new Date(
        gift.sendedAt.getTime() +
          new Date().getTimezoneOffset() * 60000 +
          9 * 60 * 60 * 1000,
      ),
    }));
  }

  async getReceivedGift(userId: string): Promise<GiftProfile[]> {
    const gifts = await this.prismaService.gift.findMany({
      where: {
        receiverId: userId, // 선물을 받은 사람의 ID로 필터링
      },
      include: {
        item: true, // 선물과 관련된 아이템 정보 포함
        sender: true, // 선물을 보낸 사람의 정보 포함
        receiver: true, // 선물을 받은 사람의 정보 포함
      },
    });

    return gifts.map((gift) => ({
      id: gift.id,
      letter: gift.letter,
      repliedLetter: gift.repliedLetter,
      itemId: gift.itemId,
      itemName: gift.item.name, // item에서 이름 포함
      itemImage: gift.item.photo, // item에서 이미지 포함
      senderId: gift.senderId,
      senderName: gift.sender.name, // sender에서 이름 포함
      receiverId: gift.receiverId,
      receiverName: gift.receiver.name, // receiver에서 이름 포함
      sendedAt: gift.sendedAt,
      receivedAt: gift.receivedAt,
      replySendedAt: gift.replySendedAt,
      replyReceivedAt: gift.replyReceivedAt,
      deletedAt: gift.deletedAt,
      date: new Date(
        gift.sendedAt.getTime() +
          new Date().getTimezoneOffset() * 60000 +
          9 * 60 * 60 * 1000,
      ),
    }));
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
