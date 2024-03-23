import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [GiftService, PrismaService],
  controllers: [GiftController],
})
export class GiftModule {}
