import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsBoolean, IsObject, IsNotEmpty, IsArray, IsArray } from 'class-validator';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { Expose, Transform, Type } from 'class-transformer';

export class AspectLevelDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Aspect Level',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Level 1-2: Thừa nhận AI thay đổi công việc, sẵn sàng học',
    description: 'Mô tả của từng cấp độ trong tiêu chí',
  })
  description: string;
}

export class AspectDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Aspect',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 3,
    description: 'Trọng số của tiêu chí trong pillar',
  })
  weightDimension: number;

  @Expose()
  @Type(() => AspectLevelDto)
  @ApiProperty({
    description: 'Danh sách các cấp độ (level) thuộc tiêu chí',
  })
  levels: AspectLevelDto[];
}

export class CompetencyPillarDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Competency Pillar',
  })
  id: string;

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

export class FrameworkLevelDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của level trong competency framework',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Level 1-2: Thừa nhận AI thay đổi công việc, sẵn sàng học',
    description: 'Mô tả của từng cấp độ trong competency framework',
  })
  description: string;
}

export class CreateCompetencyFrameworkDto {
  @ApiProperty({ example: 'AI Framework' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: { id: 'd4f5e6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90' } })
  @IsObject()
  @IsOptional()
  domain?: DomainDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Mindset',
      dimension: 'MINDSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'MINDSET',
          weightDimension: 100,
        },
      ],
    },
  })
  mindset?: CompetencyPillarDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Skillset',
      dimension: 'SKILLSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'SKILLSET',
          weightDimension: 100,
        },
      ],
    },
  })
  skillset?: CompetencyPillarDto;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: {
      name: 'Toolset',
      dimension: 'TOOLSET',
      weightDimension: 50,
      aspects: [
        {
          name: 'Tư duy phản biện',
          description: 'Đánh giá và phản biện kết quả AI',
          dimension: 'TOOLSET',
          weightDimension: 100,
          assessmentMethods: [
            {
              id: '36812a1d-2357-49f8-bc0f-3d78bdb46746',
              weightWithinDimension: 100,
            },
          ],
        },
      ],
    },
  })
  toolset?: CompetencyPillarDto;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (value === true || value === false) return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive: boolean;

  @IsOptional()
  @IsArray()
  @Expose()
  @Type(() => FrameworkLevelDto)
  @ApiProperty({
    example: [
      {
        id: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
        description: 'Level 1-2: Thừa nhận AI thay đổi công việc, sẵn sàng học',
      },
      {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
        description: 'Level 3-4: Ứng dụng AI trong công việc hàng ngày',
      },
    ],
    description: 'Danh sách các cấp độ (level) thuộc tiêu chí',
  })
  levels: FrameworkLevelDto[];
}

export class UpdateCompetencyFrameworkDto extends CreateCompetencyFrameworkDto {}
