import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ItemService, PrismaService],
  controllers: [ItemController],
})
export class ItemModule {}
