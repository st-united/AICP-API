import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExamStatus, SFIALevel, CompetencyDimension } from '@prisma/client';

export class GetExamResultDto {
  @Expose()
  @ApiProperty()
  id: string;

  @ApiProperty()
  elapsedTime: string;

  @ApiProperty({ example: 7, description: 'Tổng số câu trả lời đúng' })
  correctCount: number;

  @ApiProperty({ example: 2, description: 'Tổng số câu trả lời sai' })
  wrongCount: number;

  @ApiProperty({ example: 1, description: 'Tổng số câu bị bỏ qua' })
  skippedCount: number;

  @Expose()
  @Type(() => PillarScoreDto)
  mindsetScore: PillarScoreDto;

  @Expose()
  @Type(() => PillarScoreDto)
  skillsetScore: PillarScoreDto;

  @Expose()
  @Type(() => PillarScoreDto)
  toolsetScore: PillarScoreDto;

  @ApiProperty()
  level: string;

  @Expose()
  sfiaLevel: SFIALevel;

  @Expose()
  overallScore: number;

  @Expose()
  @Type(() => ExamSetInformationDto)
  examSet: ExamSetInformationDto;

  @Expose()
  @Type(() => UserInfoDto)
  userInfo: UserInfoDto;
}

export class PillarScoreDto {
  @Expose()
  id: string;

  @Expose()
  name: CompetencyDimension;

  @Expose()
  score: number;
}

export class ExamSetInformationDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class UserInfoDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;
}
