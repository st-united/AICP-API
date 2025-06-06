import { ExamStatus, SFIALevel } from '@prisma/client';
import { Expose } from 'class-transformer';

export class HistoryExamResponseDto {
  @Expose()
  id: string;

  @Expose()
  examStatus: ExamStatus;

  @Expose()
  levelOfDomain: SFIALevel;

  @Expose()
  createdAt: Date;
}
