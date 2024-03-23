import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type ItemProfile = {
  id: string;
  name: string;
  type: string;
  photo: string;
  price: number;
  description: string;
};

export function toItemProfile(item: any): ItemProfile {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    photo: item.photo,
    price: item.price,
    description: item.description,
  };
}

@Injectable()
export class ItemService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllItem(): Promise<ItemProfile[]> {
    return (await this.prismaService.item.findMany()).map(toItemProfile);
  }

  async findItem(itemId: string): Promise<ItemProfile> {
    return toItemProfile(
      await this.prismaService.item.findUnique({ where: { id: itemId } }),
    );
  }

  //   async findItemForPerson(userId: string): Promise<Item[]> {
  //     return await this.prismaService.item.findUnique({ where: { id } });
  //   }
}
