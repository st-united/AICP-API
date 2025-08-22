import { ExamStatus, SFIALevel } from '@prisma/client';
import { Expose } from 'class-transformer';

export class HistoryExamResponseDto {
  @Expose()
  id: string;

  @Expose()
  examStatus: ExamStatus;

  @Expose()
  sfiaLevel: SFIALevel;

  @Expose()
  attempt?: number;

  @Expose()
  isLatest?: boolean;

  @Expose()
  examSet: examSetOptionDto;

  @Expose()
  createdAt: Date;
}

export class examSetOptionDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
