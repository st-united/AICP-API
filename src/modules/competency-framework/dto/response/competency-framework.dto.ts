import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CompetencyPillarDto } from './competency-pillar.dto';

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
}
