import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MentorSlotsService } from './mentor-slots.service';
import { MentorSlotsController } from './mentor-slots.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MentorSlotsController],
  providers: [MentorSlotsService, PrismaService, ConfigService],
})
export class MentorSlotsModule {}
