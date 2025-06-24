import { ExamStatus, SFIALevel } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class DetailExamResponseDto {
  @Expose()
  id: string;

  @Expose()
  startedAt: Date;

  @Expose()
  sfiaLevel: SFIALevel;

  @Expose()
  overallScore: number;

  @Expose()
  mindsetScore: number;

  @Expose()
  skillsetScore: number;

  @Expose()
  toolsetScore: number;

  @Expose()
  examStatus: ExamStatus;

  @Expose()
  @Type(() => ExamSetInformationDto)
  examSet: ExamSetInformationDto;
}

export class ExamSetInformationDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
}
