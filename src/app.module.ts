import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './test/test.module';
import { ItemModule } from './item/item.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, TestModule, ItemModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
