import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDto } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
        data: { ...userInfo },
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

  removeRefreshToken(id: string) {
    this.prismaService.user.update({
      where: { id },
      data: { refreshToken: null },
    });
  }
}
