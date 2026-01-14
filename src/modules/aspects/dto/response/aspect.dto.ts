import { AssessmentMethodDto } from '@app/modules/competency-framework/dto/response/assessment-method.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CompetencyDimension } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AspectDto {
  @Expose()
  @ApiProperty({
    example: 'e7c2e649-3d1a-4c1e-8d4f-577668c5f0f1',
    description: 'ID của Aspect',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'Đánh Giá & Lựa Chọn Công Cụ (Tool Evaluation & Selection)',
    description: 'Tên của tiêu chí',
  })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Ability to evaluate and select appropriate AI tools for specific tasks.',
    description: 'Mô tả của tiêu chí',
  })
  description: string;

  @Expose()
  @ApiProperty({
    example: 'B1',
  })
  represent: string;

  @Expose()
  @ApiProperty({
    example: 'TOOLSET',
    enum: CompetencyDimension,
  })
  dimension: CompetencyDimension;

  @Expose()
  @ApiProperty({
    example: 3,
    description: 'Trọng số của tiêu chí',
  })
  weightDimension?: number;

  @Expose()
  @ApiProperty({
    description: 'Phương pháp đánh giá của tiêu chí',
  })
  assessmentMethods?: AssessmentMethodDto[];
}
