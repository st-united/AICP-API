import { AspectDto } from '@app/modules/aspects/dto/response/aspect.dto';
import { AssignMentorDto } from '@app/modules/mentors/dto/response/assign-mentor.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CompetencyDimension } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class CompetencyPillarDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Competency Pillar',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Pillar Name',
    description: 'Tên của Competency Pillar',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'TOOLSET',
    enum: CompetencyDimension,
  })
  dimension: CompetencyDimension;

  @Expose()
  @ApiProperty({
    example: 3,
    description: 'Trọng số của pillar',
  })
  weightDimension: number;

  @Expose()
  @Type(() => AspectDto)
  @ApiProperty({
    description: 'Danh sách các Aspects thuộc Competency Pillar',
  })
  aspects: AspectDto[];
}
