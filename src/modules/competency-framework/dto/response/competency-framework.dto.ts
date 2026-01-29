import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AssessmentMethodDto } from './assessment-method.dto';

export class LevelDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Level',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'LEVEL_1',
    description: 'Tên của Level',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Level 1-2',
    description: 'Mô tả của Level',
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
    example: 'Giao Tiếp Hiệu Quả',
    description: 'Tên của Aspect',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 3,
    description: 'Trọng số của tiêu chí trong pillar',
  })
  weightDimension: number;

  @Expose()
  @ApiProperty({
    description: 'Phương pháp đánh giá của tiêu chí',
  })
  assessmentMethods?: AssessmentMethodDto[];

  @Expose()
  @ApiProperty({
    description: 'Danh sách các cấp độ (level) thuộc tiêu chí',
    type: [LevelDto],
  })
  levels: LevelDto[];
}

export class CompetencyPillarDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Pillar',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Mindset',
    description: 'Tên của Pillar',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'MINDSET',
    description: 'Dimension của Pillar',
  })
  dimension: string;

  @Expose()
  @ApiProperty({
    example: 3,
    description: 'Trọng số của pillar',
  })
  weightDimension: number;

  @Expose()
  @ApiProperty({
    description: 'Danh sách các Aspects thuộc Competency Pillar',
    type: [AspectDto],
  })
  aspects: AspectDto[];
}

export class CompetencyFrameworkDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Competency Framework',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Khung Năng Lực Trí Tuệ Nhân Tạo',
    description: 'Tên của Khung Năng Lực',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: {
      id: 'd4f5e6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90',
      name: 'Công Nghệ Thông Tin',
      description: 'Lĩnh vực công nghệ thông tin',
    },
    description: 'Lĩnh vực (Domain) của Khung Năng Lực',
  })
  domain: DomainDto;

  @Expose()
  @ApiProperty({
    description: 'Pillar về Mindset',
  })
  mindset?: CompetencyPillarDto;

  @Expose()
  @ApiProperty({
    description: 'Pillar về Skillset',
  })
  skillset?: CompetencyPillarDto;

  @Expose()
  @ApiProperty({
    description: 'Pillar về Toolset',
  })
  toolset?: CompetencyPillarDto;

  @Expose()
  @ApiProperty({
    example: true,
    description: 'Trạng thái hoạt động của Khung Năng Lực',
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    example: '2026-01-12T08:53:43.000Z',
    description: 'Ngày tạo',
  })
  createdAt?: Date;

  @Expose()
  @ApiProperty({
    example: '2026-01-12T08:53:43.000Z',
    description: 'Ngày cập nhật',
  })
  updatedAt?: Date;

  @Expose()
  @ApiProperty({
    description: 'Danh sách các cấp độ (level) của khung năng lực',
    type: [LevelDto],
  })
  levels?: LevelDto[];
}
