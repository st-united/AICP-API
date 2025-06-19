import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [DomainController],
  providers: [DomainService, ConfigService, PrismaService],
  exports: [DomainService],
})
export class DomainModule {}
