import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AspectAssessmentMethodItemDto } from './aspect-assesment-method.dto';
import { CompetencyAspectStatus } from '@prisma/client';
import { IsUUID } from 'class-validator';

export class AspectFrameworkUsageDto {
  @Expose()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  @IsUUID()
  id: string;

  @Expose()
  @ApiProperty({ example: 'Backend Developer V1' })
  frameworkName: string;

  @Expose()
  @ApiProperty({ example: 10 })
  weightWithinDimension: number;
}

export class AspectDetailResponseDto {
  @Expose()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Effective Communication' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'MINDSET' })
  pillarName: string;

  @Expose()
  @ApiProperty({ example: 'Description of the aspect' })
  description: string;

  @Expose()
  @ApiProperty({ example: 'AVAILABLE' })
  status: CompetencyAspectStatus;

  @Expose()
  @Type(() => AspectAssessmentMethodItemDto)
  @ApiProperty({ type: [AspectAssessmentMethodItemDto] })
  assessmentMethods: AspectAssessmentMethodItemDto[];

  @Expose()
  @Type(() => AspectFrameworkUsageDto)
  @ApiProperty({ type: [AspectFrameworkUsageDto] })
  frameworkUsage: AspectFrameworkUsageDto[];
}
