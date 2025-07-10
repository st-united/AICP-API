import { ExamStatus, SFIALevel, CompetencyDimension } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class AspectDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  represent: string;

  @Expose()
  score: number;
}

export class PillarScoreDto {
  @Expose()
  id: string;

  @Expose()
  name: CompetencyDimension;

  @Expose()
  score: number;

  @Expose()
  @Type(() => AspectDto)
  aspects: AspectDto[];
}

export class ExamSetInformationDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

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
  examStatus: ExamStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ExamSetInformationDto)
  examSet: ExamSetInformationDto;

  @Expose()
  @Type(() => PillarScoreDto)
  mindsetScore: PillarScoreDto;

  @Expose()
  @Type(() => PillarScoreDto)
  skillsetScore: PillarScoreDto;

  @Expose()
  @Type(() => PillarScoreDto)
  toolsetScore: PillarScoreDto;
}
