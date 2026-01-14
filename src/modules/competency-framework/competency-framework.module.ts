import { Module } from '@nestjs/common';
import { CompetencyFrameworkController } from './competency-framework.controller';
import { CompetencyFrameworkService } from './competency-framework.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CompetencyFrameworkController],
  providers: [CompetencyFrameworkService, PrismaService],
  exports: [CompetencyFrameworkService],
})
export class CompetencyFrameworkModule {}
