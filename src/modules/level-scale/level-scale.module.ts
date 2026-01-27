import { Module } from '@nestjs/common';
import { LevelScaleController } from './level-scale.controller';
import { LevelScaleService } from './level-scale.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LevelScaleController],
  providers: [LevelScaleService],
  exports: [LevelScaleService],
})
export class LevelScaleModule {}
