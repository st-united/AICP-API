import { Module } from '@nestjs/common';
import { CompetencyPillarController } from './competency-pillar.controller';
import { CompetencyPillarService } from './competency-pillar.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompetencyPillarController],
  providers: [CompetencyPillarService],
  exports: [CompetencyPillarService],
})
export class CompetencyPillarModule {}
