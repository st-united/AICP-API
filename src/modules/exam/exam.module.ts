import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ConfigService } from '@nestjs/config';
import { ExamServiceCommon } from '@app/common/services/exam.service';
@Module({
  controllers: [ExamController],
  providers: [ExamService, ConfigService, ExamServiceCommon],
})
export class ExamModule {}
