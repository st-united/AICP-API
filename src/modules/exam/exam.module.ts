import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ExamController],
  providers: [ExamService, ConfigService],
})
export class ExamModule {}
