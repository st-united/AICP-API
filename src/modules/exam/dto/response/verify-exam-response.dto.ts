import { ExamStatus, SFIALevel } from '@prisma/client';
import { Expose } from 'class-transformer';

export class VerifyExamResponseDto {
  @Expose()
  id: string;

  @Expose()
  examStatus: ExamStatus;

  @Expose()
  examSetName: string;
}
