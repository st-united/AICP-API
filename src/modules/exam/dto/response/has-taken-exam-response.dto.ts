import { ExamStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class HasTakenExamResponseDto {
  @Expose()
  hasTakenExam: boolean;

  @Expose()
  examSetDuration: number;

  @Expose()
  examId?: string;

  @Expose()
  examStatus?: ExamStatus;
}
