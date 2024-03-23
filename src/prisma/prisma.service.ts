/** @see https://wanago.io/2023/04/24/api-nestjs-prisma-soft-deletes/ */
/** @see https://wanago.io/2023/06/19/api-nestjs-prisma-logging/ */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

/** @todo Migrate into client extensions */
/** @see https://www.prisma.io/docs/orm/prisma-client/client-extensions */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: { db: { url: process.env.PRISMA_DB_URL } },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.$use(this.softDeleteMiddleware);
    this.$on('error', ({ message }) => {
      this.logger.error(message);
    });
    this.$on('warn', ({ message }) => {
      this.logger.warn(message);
    });
    this.$on('info', ({ message }) => {
      this.logger.debug(message);
    });
    this.$on('query', ({ query, params }) => {
      this.logger.log(`${query} | ${params}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async softDeleteMiddleware(params, next) {
    if (params.action === 'delete') {
      return next({
        ...params,
        action: 'update',
        args: { ...params.args, data: { deletedAt: new Date() } },
      });
    }
    if (params.action === 'deleteMany') {
      return next({
        ...params,
        action: 'updateMany',
        args: { ...params.args, data: { deletedAt: new Date() } },
      });
    }
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      return next({
        ...params,
        action: 'findFirst',
        args: {
          ...params.args,
          where: { ...params.args?.where, deletedAt: null },
        },
      });
    }
    if (params.action === 'findMany') {
      return next({
        ...params,
        args: {
          ...params.args,
          where: { ...params.args?.where, deletedAt: null },
        },
      });
    }
    return next(params);
  }
}
