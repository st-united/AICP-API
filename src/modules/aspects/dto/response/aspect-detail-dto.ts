import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { UUID } from 'crypto';
import { CompetencyFrameworkListItemDto } from './aspect-competency-framework.dto';
import { AspectAssessmentMethodItemDto } from './aspect-assesment-method.dto';

export class AspectDetailDto {
  @Expose()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Effective Communication' })
  name: string;

  @Expose()
  @IsUUID()
  @ApiProperty({ example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1' })
  pillarId: UUID;

  @Expose()
  @ApiProperty({ example: 'AVAILABLE' })
  status: string;

  @Expose()
  @ApiProperty()
  createdDate: Date;

  @Expose()
  @ApiProperty()
  assessmentMethods: AspectAssessmentMethodItemDto[];

  @Expose()
  @ApiProperty()
  competencyFrameworks: CompetencyFrameworkListItemDto[];
}
