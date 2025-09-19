import { Module } from '@nestjs/common';
import { MentorSpotsController } from './mentor-spots.controller';
import { MentorSpotsService } from './mentor-spots.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MentorSpotsController],
  providers: [MentorSpotsService, PrismaService],
  exports: [MentorSpotsService],
})
export class MentorSpotsModule {}
