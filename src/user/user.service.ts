import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GiftResponseDto, UserBodyDto } from './user.dto';

export type UserProfile = {
  id: string;
  name: string;
};

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
  };
}

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(userInfo: RegisterRequestDto): Promise<User | null> {
    try {
      const user = await this.prismaService.user.create({
        data: { ...userInfo, profilePhoto: '', introduction: '' } as User,
      });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async findAllProfile(): Promise<UserProfile[]> {
    const users = await this.prismaService.user.findMany();
    return users.map(toUserProfile);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    return user;
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { name } });
    return user;
  }

  async removeById(id: string) {
    await this.prismaService.user.delete({ where: { id } });
  }

  async setRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { id },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async getUserIfRefreshTokenMatches(
    id: string,
    refreshToken: string,
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    return isRefreshTokenMatching ? user : null;
  }

  async editProfile(user: User, userBody: UserBodyDto): Promise<User | null> {
    if (!user) {
      return null;
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        introduction: userBody.introduction,
        profilePhoto: userBody.profilePhoto,
      },
    });

    return updatedUser;
  }

  async getUserList(user: User): Promise<User[]> {
    const usersWithGifts = await this.prismaService.user.findMany({
      where: {
        NOT: {
          id: user.id,
        },
      },
      include: {
        sended: {
          include: {
            item: true,
          },
        },
        received: {
          include: {
            item: true,
          },
        },
      },
    });

    const userBalances = usersWithGifts.map((user) => {
      const sentTotal = user.sended.reduce(
        (total, gift) => total + gift.item.price,
        0,
      );
      const receivedTotal = user.received.reduce(
        (total, gift) => total + gift.item.price,
        0,
      );

      const balance = sentTotal - receivedTotal;

      return {
        userId: user.id,
        balance: balance,
      };
    });

    // 동일한 balance가 있는 경우를 위한 랜덤화 함수
    const randomizeForEqualBalances = (a, b) => {
      if (a.balance === b.balance) {
        return 0.5 - Math.random();
      }
      return b.balance - a.balance;
    };

    // balance에 따라 사용자를 정렬합니다. 동일한 경우 랜덤하게 처리
    userBalances.sort(randomizeForEqualBalances);

    const sortedUsers = [];
    for (const balance of userBalances) {
      const user = usersWithGifts.find((u) => u.id === balance.userId);
      if (user) {
        sortedUsers.push(user);
      }
    }

    return sortedUsers.slice(0, 3);
  }

  async getUserNewGift(user: User): Promise<GiftResponseDto[]> {
    const newGifts = await this.prismaService.gift.findMany({
      where: {
        receiverId: user.id,
        receivedAt: null,
      },
      include: {
        item: true,
        sender: true,
      },
    });

    // Gift[]를 GiftResponseDto[]로 변환
    return newGifts.map((gift) => ({
      id: gift.id,
      itemId: gift.itemId,
      itemName: gift.item.name,
      itemImage: gift.item.photo,
      date: gift.sendedAt,
      fromId: gift.sender.id,
      fromName: gift.sender.name,
    }));
  }

  async getUserNewReply(user: User): Promise<GiftResponseDto[]> {
    const newReplies = await this.prismaService.gift.findMany({
      where: {
        receiverId: user.id,
        NOT: {
          receivedAt: null,
        },
        replyReceivedAt: null,
      },
      include: {
        item: true,
      },
    });

    // Gift[]를 GiftResponseDto[]로 변환
    return newReplies.map((reply) => ({
      id: reply.id,
      itemId: reply.itemId,
      itemName: reply.item.name,
      itemImage: reply.item.photo,
    }));
  }

  async getUserNewCnt(
    user: User,
  ): Promise<{ gift: number; reply: number; total: number }> {
    // 새 선물의 개수 조회
    const newGifts = await this.getUserNewGift(user);
    const gift = newGifts.length;

    // 새 답장의 개수 조회
    const newReplies = await this.getUserNewReply(user);
    const reply = newReplies.length;

    const total = gift + reply;

    // 새 선물과 새 답장의 총 개수 반환
    return {
      gift,
      reply,
      total,
    };
  }

  removeRefreshToken(id: string) {
    this.prismaService.user.update({
      where: { id },
      data: { refreshToken: null },
    });
  }
}
