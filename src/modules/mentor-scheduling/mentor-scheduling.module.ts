import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MentorSchedulingService } from './mentor-scheduling.service';
import { MentorSchedulesController } from './mentor-schedules.controller';
import { MentorSpotsController } from './mentor-spots.controller';

@Module({
  controllers: [MentorSchedulesController, MentorSpotsController],
  providers: [MentorSchedulingService, PrismaService],
  exports: [MentorSchedulingService],
})
export class MentorSchedulingModule {}
