import { Module } from '@nestjs/common';
import { ExamSetsService } from './exam-sets.service';
import { ExamSetsController } from './exam-sets.controller';

@Module({
  controllers: [ExamSetsController],
  providers: [ExamSetsService],
})
export class ExamSetsModule {}
